// ──────────────────────────────────────────────────────────────────────────────
// Strategy types – UI-facing configuration before a Job is created on-chain.
//
// A Strategy is what the user configures in the frontend; the executor converts
// it into a signed on-chain transaction and a corresponding Job record.
// ──────────────────────────────────────────────────────────────────────────────

export interface LimitOrderStrategy {
  kind: 'limit_order';
  tokenIn: string;
  tokenOut: string;
  amountIn: string; // human-readable (e.g. "100.0")
  targetPrice: string; // human-readable price
  direction: 'gte' | 'lte';
  slippageBps: number; // basis points, e.g. 50 = 0.5%
  expiresInDays: number | null;
}

export interface DCAStrategy {
  kind: 'dca';
  tokenIn: string;
  tokenOut: string;
  amountPerSwap: string; // human-readable
  intervalHours: number;
  totalSwaps: number;
  slippageBps: number;
}

// ── TWAP strategy stub ────────────────────────────────────────────────────────
// Time-Weighted Average Price — splits a large order into equal tranches
// executed at regular intervals regardless of spot price.
// (Type only; on-chain contract support not yet implemented.)

export interface TWAPStrategy {
  kind: 'twap';
  tokenIn: string;
  tokenOut: string;
  totalAmountIn: string; // human-readable total to spend
  numberOfTranches: number; // how many equal slices to execute
  intervalHours: number; // hours between each tranche
  slippageBps: number;
  expiresInDays: number | null;
}

// ── Swap strategy stub ────────────────────────────────────────────────────────
// Single instant market swap executed immediately at current price.
// (Type only; on-chain contract support not yet implemented.)

export interface SwapStrategy {
  kind: 'swap';
  tokenIn: string;
  tokenOut: string;
  amountIn: string; // human-readable
  slippageBps: number;
}

export type Strategy =
  | LimitOrderStrategy
  | DCAStrategy
  | TWAPStrategy
  | SwapStrategy;
