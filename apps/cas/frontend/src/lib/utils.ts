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
/** Error parser for clean UX messages */
export function parseError(err: unknown): string {
  const msg = (err as Error)?.message || String(err);

  // ── Custom contract errors ─────────────────────────────────────────────

  if (msg.includes('TooManyJobs')) {
    return 'You have reached the maximum number of active jobs. Cancel an existing job to free a slot before creating a new one.';
  }

  if (msg.includes('SlippageTooHigh')) {
    const m = msg.match(/SlippageTooHigh\((\d+),\s*(\d+)\)/);
    if (m) {
      const requested = parseInt(m[1], 10) / 100;
      const allowed = parseInt(m[2], 10) / 100;
      return `Slippage ${requested}% exceeds the contract maximum of ${allowed}%. Please lower your slippage.`;
    }
    return 'Slippage value is too high for this contract. Maximum is 5%. Please lower it and try again.';
  }

  if (msg.includes('InvalidParams')) {
    const m = msg.match(/InvalidParams\("(.*?)"\)/);
    if (m) return `Invalid parameters: ${m[1]}`;
    return 'Invalid job parameters. Check your inputs and try again.';
  }

  if (msg.includes('JobNotActive')) {
    return 'This job is no longer active. Refresh the page to see its current status.';
  }
  if (msg.includes('JobNotFound')) {
    return 'Job not found on-chain. It may have already been removed.';
  }

  if (msg.includes('JobExpiredError')) {
    return 'This job has expired and cannot be executed.';
  }

  if (msg.includes('DCACompleted')) {
    return 'This DCA job has already completed all its scheduled swaps.';
  }

  if (msg.includes('DCAIntervalNotReached')) {
    return 'DCA interval has not elapsed yet. The keeper will retry at the next scheduled time.';
  }

  if (msg.includes('PriceConditionNotMet')) {
    return 'Price condition not met — the market price has not reached your target yet.';
  }

  if (msg.includes('EnforcedPause')) {
    return 'The contract is currently paused. Please try again later.';
  }

  if (
    msg.includes('Unauthorized') ||
    msg.includes('OwnableUnauthorizedAccount')
  ) {
    return 'Your wallet is not authorised to perform this action.';
  }

  if (msg.includes('ZeroAddress')) {
    return 'A zero address was passed — this is a configuration error. Please contact support.';
  }

  if (msg.includes('SafeERC20FailedOperation')) {
    return 'Token transfer failed. Make sure you have approved enough tokens or have sufficient balance.';
  }

  if (msg.includes('ReentrancyGuardReentrantCall')) {
    return 'Reentrancy detected — please do not double-click. Wait for the current transaction to confirm.';
  }

  if (msg.includes('Slippage exceeded')) {
    return 'Execution failed: swap output was below the minimum. The keeper will retry automatically.';
  }

  if (
    msg.includes('"minAmountOut is zero"') ||
    msg.includes("'minAmountOut is zero'")
  ) {
    return 'Minimum output is zero — ensure a target price is set and retry.';
  }
  if (
    msg.includes('"amountIn is zero"') ||
    msg.includes("'amountIn is zero'")
  ) {
    return 'Please enter an amount to sell.';
  }
  if (
    msg.includes('"targetPrice is zero"') ||
    msg.includes("'targetPrice is zero'")
  ) {
    return 'Please enter a target price.';
  }

  if (msg.includes('insufficient funds')) {
    return 'Insufficient funds for gas or token transfer.';
  }
  if (msg.includes('User rejected') || msg.includes('user rejected')) {
    return 'Transaction was rejected in your wallet.';
  }
  if (msg.includes('could not be found') || msg.includes('timed out')) {
    return 'Transaction confirmation timed out — it may still confirm. Check your wallet activity.';
  }

  const match = msg.match(/Error: ([A-Za-z0-9_]+)\("(.*?)"\)/);
  if (match) {
    return `Transaction reverted: ${match[2] || match[1]}`;
  }

  const maxLen = 200;
  return msg.length > maxLen ? `${msg.substring(0, maxLen)}…` : msg;
}
