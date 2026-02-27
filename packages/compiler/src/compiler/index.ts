/**
 * Compiler module barrel.
 *
 * @example
 * ```typescript
 * import { compileSolidity, getSolcVersion } from '@cfxdevkit/compiler/compiler';
 * ```
 */

export {
  compileMultipleSources,
  compileSolidity,
  getSolcVersion,
} from './solidity-compiler.js';

export type {
  CompilationError,
  CompilationInput,
  CompilationOutput,
  CompilationResult,
} from './types.js';
