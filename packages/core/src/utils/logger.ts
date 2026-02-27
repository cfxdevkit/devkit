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
 * Simple logger utility
 */

const colors = {
  info: '\x1b[36m', // Cyan
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  success: '\x1b[32m', // Green
  debug: '\x1b[90m', // Gray
  reset: '\x1b[0m', // Reset
};

/** A structured log object or plain message string — mirrors the pino/winston dual-form API. */
type LogMessage = string | Record<string, unknown>;

function formatMessage(
  level: string,
  message: string,
  ...args: unknown[]
): string {
  const timestamp = new Date().toISOString();
  const formattedArgs =
    args.length > 0
      ? ` ${args
          .map((arg) =>
            arg !== null && typeof arg === 'object'
              ? JSON.stringify(
                  arg,
                  (_key, value) =>
                    typeof value === 'bigint' ? value.toString() : value,
                  2
                )
              : String(arg)
          )
          .join(' ')}`
      : '';

  return `[${timestamp}] ${level.toUpperCase()}: ${message}${formattedArgs}`;
}

function handleLog(
  level: string,
  color: string,
  fn: (message: string) => void,
  messageOrObj: LogMessage,
  maybeMsg?: unknown,
  ...args: unknown[]
): void {
  let msg =
    typeof messageOrObj === 'string' ? messageOrObj : String(messageOrObj);
  let objs: unknown[] = maybeMsg !== undefined ? [maybeMsg, ...args] : args;

  if (typeof messageOrObj === 'object' && typeof maybeMsg === 'string') {
    msg = maybeMsg;
    objs = [messageOrObj, ...args];
  }

  fn(color + formatMessage(level, msg, ...objs) + colors.reset);
}

export const logger = {
  info(m: LogMessage, m2?: unknown, ...args: unknown[]): void {
    handleLog('info', colors.info, console.log, m, m2, ...args);
  },
  warn(m: LogMessage, m2?: unknown, ...args: unknown[]): void {
    handleLog('warn', colors.warn, console.warn, m, m2, ...args);
  },
  error(m: LogMessage, m2?: unknown, ...args: unknown[]): void {
    handleLog('error', colors.error, console.error, m, m2, ...args);
  },
  success(m: LogMessage, m2?: unknown, ...args: unknown[]): void {
    handleLog('success', colors.success, console.log, m, m2, ...args);
  },
  debug(m: LogMessage, m2?: unknown, ...args: unknown[]): void {
    handleLog('debug', colors.debug, console.log, m, m2, ...args);
  },
};
