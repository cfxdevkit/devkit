'use client';

/**
 * AuthContext – single source of truth for wallet + SIWE auth state.
 *
 * Design:
 *  - The context is provided once at layout level (inside WagmiProvider).
 *  - All components that need auth state consume useAuthContext() rather than
 *    calling useAuth() directly.  This guarantees every consumer sees the same
 *    token and loading flags with no risk of desync.
 *
 * Auto-sign flow:
 *  - When wagmi reports isConnected = true and no JWT exists, the context
 *    automatically kicks off the SIWE login() call without requiring the user
 *    to click a separate "Sign In" button.
 *  - If the user rejects the signature the error is surfaced and a manual
 *    retry button appears in the NavBar — the auto-trigger fires only ONCE
 *    per connection event to avoid a runaway prompt loop.
 *  - When the wallet disconnects or the address changes, the JWT is cleared.
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { SiweMessage } from 'siwe';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { EXPECTED_CHAIN_ID } from './useNetworkSwitch.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthCtx {
  /** Persisted JWT, null when not authenticated. */
  token: string | null;
  /** Checksummed wallet address, null when not connected. */
  address: string | null;
  /** True while the SIWE nonce-fetch → sign → verify round-trip is in progress. */
  isLoading: boolean;
  /** True when token is non-null and wallet is connected. */
  isAuthenticated: boolean;
  /** Last login error message (e.g. "User rejected request"). */
  error: string | null;
  /** Manually trigger SIWE login (e.g. retry after rejection). Returns true on success. */
  login: () => Promise<boolean>;
  /** Clear JWT + disconnect wallet. */
  logout: () => void;
  /**
   * Clear the stored JWT and reset the auto-sign guard so a fresh SIWE is
   * triggered on the next render cycle.  Call this when any API request
   * returns 401 (expired or invalid token) to transparently re-authenticate
   * the same wallet without the user having to do anything manually.
   */
  refreshAuth: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthCtx | null>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';
const TOKEN_KEY = 'cas_jwt';

/**
 * Decode a JWT payload (no signature verification — just parse the base64
 * body) and return the expiry timestamp in milliseconds, or 0 if unreadable.
 */
function getJwtExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
    return payload.exp ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

/** Return `token` only if it hasn't expired yet; otherwise `null`. */
function validToken(token: string | null): string | null {
  if (!token) return null;
  const exp = getJwtExpiry(token);
  return exp === 0 || exp > Date.now() ? token : null;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // Initialise synchronously from localStorage so there is no flash of
  // "unauthenticated" on page reload when a token already exists.
  // Discard tokens that have already expired so the auto-sign effect fires
  // immediately on the next render rather than waiting for the first 401.
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(TOKEN_KEY);
    const valid = validToken(stored);
    if (stored && !valid) {
      // Proactively clear expired token so auto-sign picks it up.
      localStorage.removeItem(TOKEN_KEY);
    }
    return valid;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard: tracks the address that triggered the latest auto-signed attempt so
  // we don't fire login() repeatedly if the effect re-runs (e.g. StrictMode).
  const autoSignedForRef = useRef<string | null>(null);
  // Counts auto-sign attempts for the current address (reset on address or
  // chain change). We permit one automatic retry for transient failures but
  // block indefinite looping.
  const autoSignAttemptsRef = useRef(0);
  // Set to true when the last login() failure was caused by an explicit user
  // rejection (as opposed to a transient / timing error).
  const lastLoginRejectedRef = useRef(false);
  // Delayed readiness flag: prevents auto-sign from firing in the first 600 ms
  // after mount. On page reload the wallet extension can take a moment to
  // initialise, and calling signMessageAsync too early reliably causes a
  // transient failure that the user then has to manually retry.
  const [isAutoSignReady, setIsAutoSignReady] = useState(false);
  // Track the previous non-null address so we can detect a wallet switch.
  const prevAddressRef = useRef<string | null>(null);

  // ── Delay before first auto-sign attempt ────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setIsAutoSignReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  // ── Reset auto-sign state when wallet lands on the correct chain ─────────────
  // When a user switches to EXPECTED_CHAIN_ID (e.g. after clicking "Switch
  // Network"), clear any stale error and reset the auto-sign guard so a fresh
  // SIWE attempt runs automatically without requiring a manual retry click.
  useEffect(() => {
    if (chainId === EXPECTED_CHAIN_ID && !token) {
      setError(null);
      autoSignedForRef.current = null;
      autoSignAttemptsRef.current = 0;
      lastLoginRejectedRef.current = false;
    }
  }, [chainId, token]);

  // ── Clear token when the wallet SWITCHES to a different address ─────────────
  // We do NOT clear on address → undefined (transient disconnect / wagmi
  // re-initialise) because that would force re-sign on every page navigation
  // or tab switch where wagmi briefly loses the account before reconnecting.
  // Token expiry and explicit logouts are handled separately.
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      if (address) prevAddressRef.current = address;
      return;
    }
    if (address) {
      // Address became known or changed.
      if (prevAddressRef.current && prevAddressRef.current !== address) {
        // Different wallet connected — previous session is invalid.
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
        autoSignedForRef.current = null;
        autoSignAttemptsRef.current = 0;
        lastLoginRejectedRef.current = false;
      }
      prevAddressRef.current = address;
    }
    // When address becomes undefined we intentionally do nothing:
    // the token stays so the user doesn't have to re-sign after a brief
    // wagmi reconnect cycle or a Next.js client-side navigation.
  }, [address]);

  // ── Core login function ───────────────────────────────────────────────────
  const login = useCallback(async (): Promise<boolean> => {
    if (!address) {
      setError('No wallet connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Nonce
      const nonceRes = await fetch(
        `${API_BASE}/auth/nonce?address=${encodeURIComponent(address)}`
      );
      if (!nonceRes.ok) throw new Error('Failed to fetch nonce');
      const { nonce } = (await nonceRes.json()) as { nonce: string };

      // 2. Build + sign SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Conflux Automation Service',
        uri: window.location.origin,
        version: '1',
        chainId:
          chainId ??
          (process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 1030 : 71),
        nonce,
      });
      const prepared = message.prepareMessage();
      const signature = await signMessageAsync({ message: prepared });

      // 3. Verify with backend → JWT
      const verifyRes = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prepared, signature }),
      });
      if (!verifyRes.ok) {
        const body = (await verifyRes.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? 'Verification failed');
      }
      const { token: jwt } = (await verifyRes.json()) as { token: string };

      localStorage.setItem(TOKEN_KEY, jwt);
      setToken(jwt);
      setError(null);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      // Classify rejection vs transient failure so the auto-sign retry logic
      // can decide whether to attempt recovery automatically.
      const isRejection =
        msg.toLowerCase().includes('rejected') ||
        msg.toLowerCase().includes('denied') ||
        msg.toLowerCase().includes('cancelled');
      lastLoginRejectedRef.current = isRejection;
      // Don't surface "User rejected" as a scary error — just show retry.
      if (msg.includes('getChainId is not a function')) {
        setError(
          'Wallet connection issue. Please reconnect your wallet or try a different provider.'
        );
      } else {
        setError(isRejection ? 'Signature rejected — try again.' : msg);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId, signMessageAsync]);

  // ── Auto-sign on connect (fires once per address, only on correct chain) ────
  // Guard against calling login() while on a wrong network: wagmi's
  // signMessageAsync internally calls connector.getChainId() which throws
  // "getChainId is not a function" when the connected chain isn't in the
  // wagmi config.  By waiting for the correct chain ID, the auto-sign fires
  // naturally once the user switches networks — no manual retry needed.
  //
  // Retry logic:
  //  - isAutoSignReady: 600 ms delay on mount so the wallet extension has time
  //    to initialise before we call signMessageAsync.
  //  - autoSignAttemptsRef: allows ONE automatic retry for transient errors.
  //    On a second failure, or any user-rejection, the button stays visible so
  //    the user can manually retry.
  //  - The chain-change effect (above) resets all these guards whenever the
  //    wallet lands on EXPECTED_CHAIN_ID, so switching network → auto-signs.
  useEffect(() => {
    if (
      isConnected &&
      address &&
      chainId === EXPECTED_CHAIN_ID &&
      !token &&
      !isLoading &&
      isAutoSignReady &&
      autoSignedForRef.current !== address // not locked for this address
    ) {
      autoSignedForRef.current = address; // optimistic lock
      void login().then((success) => {
        if (!success) {
          if (
            lastLoginRejectedRef.current ||
            autoSignAttemptsRef.current >= 1
          ) {
            // User explicitly rejected, or we've already retried once — keep
            // the lock so auto-sign doesn't fire again; show the retry button.
          } else {
            // Transient failure (e.g. extension not ready on page load).
            // Allow one automatic retry by releasing the lock.
            autoSignAttemptsRef.current += 1;
            autoSignedForRef.current = null;
          }
        }
      });
    }
  }, [isConnected, address, chainId, token, isLoading, isAutoSignReady, login]);

  // ── Refresh auth (re-sign with the same wallet — used on 401 responses) ──
  const refreshAuth = useCallback(() => {
    setToken(null);
    setError(null);
    localStorage.removeItem(TOKEN_KEY);
    // Reset all auto-sign guards so the effect fires again for this address.
    autoSignedForRef.current = null;
    autoSignAttemptsRef.current = 0;
    lastLoginRejectedRef.current = false;
  }, []);

  // ── Logout ──────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setToken(null);
    setError(null);
    localStorage.removeItem(TOKEN_KEY);
    autoSignedForRef.current = null;
    autoSignAttemptsRef.current = 0;
    lastLoginRejectedRef.current = false;
    disconnect();
  }, [disconnect]);

  return (
    <AuthContext.Provider
      value={{
        token,
        address: address ?? null,
        isLoading,
        isAuthenticated: Boolean(token && address),
        error,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Consumer hook ────────────────────────────────────────────────────────────

export function useAuthContext(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

/**
 * useAuthFetch — returns a `fetch`-compatible function that:
 *  1. Automatically injects `Authorization: Bearer <token>` on every request.
 *  2. Calls `refreshAuth()` when the server responds with HTTP 401, so the
 *     SIWE auto-sign flow re-fires and the user is silently re-authenticated
 *     with the same wallet (no manual action required on any device).
 *
 * Usage:
 *   const authFetch = useAuthFetch();
 *   const res = await authFetch('/api/jobs');
 */
export function useAuthFetch(): (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response> {
  const { token, refreshAuth } = useAuthContext();

  return useCallback(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const headers = new Headers(init?.headers);
      if (token) headers.set('Authorization', `Bearer ${token}`);

      const res = await fetch(input, { ...init, headers });

      if (res.status === 401) {
        refreshAuth();
      }

      return res;
    },
    [token, refreshAuth]
  );
}
