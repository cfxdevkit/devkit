/**
 * Type declarations for the `solc` Solidity compiler package.
 *
 * solc ships without bundled TypeScript declarations — this shim provides
 * the minimum surface needed by @cfxdevkit/compiler.
 */
declare module 'solc' {
  /**
   * Compile Solidity source.
   * @param input  JSON-serialised CompilerInput
   * @returns JSON-serialised CompilerOutput
   */
  export function compile(input: string): string;

  /** Return the bundled solc version string. */
  export function version(): string;
}
