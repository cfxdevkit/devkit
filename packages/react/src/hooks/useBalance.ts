/*
 * Copyright 2025 Conflux DevKit Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * useBalance Hook
 *
 * Fetches and tracks balance for an address
 */

import type { ChainType } from '@cfxdevkit/core';
import { useCallback, useEffect, useState } from 'react';
import { useDevKitContext } from '../providers/DevKitProvider.js';

export interface UseBalanceOptions {
  address?: string;
  chain: ChainType;
  enabled?: boolean;
  refreshInterval?: number;
}

export interface UseBalanceReturn {
  balance?: string;
  isLoading: boolean;
  error?: Error;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and track address balance
 *
 * @example
 * ```tsx
 * const { balance, isLoading } = useBalance({
 *   address: '0x...',
 *   chain: 'evm'
 * });
 * ```
 */
export function useBalance(options: UseBalanceOptions): UseBalanceReturn {
  const { address, enabled = true, refreshInterval } = options;
  useDevKitContext(); // ensure provider is present; apiUrl and chain used in production impl

  const [balance, setBalance] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const fetchBalance = useCallback(async () => {
    if (!address || !enabled) return;

    setIsLoading(true);
    setError(undefined);

    try {
      // In production, call backend API with `chain` to select Core vs eSpace
      // For now, simulate balance fetch
      const mockBalance = '1000000000000000000'; // 1 token
      setBalance(mockBalance);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch balance')
      );
    } finally {
      setIsLoading(false);
    }
  }, [address, enabled]);

  useEffect(() => {
    void fetchBalance();

    // Set up refresh interval if provided
    if (refreshInterval) {
      const interval = setInterval(() => {
        void fetchBalance();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchBalance, refreshInterval]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
