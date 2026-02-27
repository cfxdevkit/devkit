/**
 * Solidity Compiler Types
 *
 * Input/output types for the runtime Solidity compilation service.
 * The compiler targets 'paris' EVM version by default for Conflux eSpace
 * compatibility (avoids the PUSH0 opcode absent on Conflux).
 */

/**
 * Input for compiling a single Solidity contract.
 */
export interface CompilationInput {
  /** Contract name used as the source file key (e.g. "SimpleStorage") */
  contractName: string;
  /** Raw Solidity source code */
  source: string;
  /** Solidity compiler version override (not used — solc version is fixed at install time) */
  version?: string;
  /**
   * Optimizer settings. Defaults to `{ enabled: true, runs: 200 }`.
   */
  optimizer?: {
    enabled: boolean;
    runs: number;
  };
  /**
   * EVM version to target.
   *
   * @defaultValue `'paris'` — required for Conflux eSpace compatibility.
   * Do not use 'shanghai' or later: Conflux does not support the PUSH0 opcode
   * introduced in Shanghai.
   */
  evmVersion?: string;
}

/**
 * A single compiled contract artefact.
 */
export interface CompilationOutput {
  /** Name of the compiled contract */
  contractName: string;
  /** Creation bytecode with 0x prefix */
  bytecode: string;
  /** Runtime (deployed) bytecode with 0x prefix */
  deployedBytecode: string;
  /** Contract ABI */
  abi: unknown[];
  /** solc version string used during compilation */
  compilerVersion: string;
  /** Gas estimates for deployment (may be absent for interfaces) */
  gasEstimates?: {
    creation: {
      codeDepositCost: string;
      executionCost: string;
      totalCost: string;
    };
  };
}

/**
 * A compiler diagnostic (error or warning).
 */
export interface CompilationError {
  severity: 'error' | 'warning';
  message: string;
  /** Full formatted message with source line context */
  formattedMessage: string;
  sourceLocation?: {
    file: string;
    start: number;
    end: number;
  };
}

/**
 * Result returned by every `compile*` function.
 *
 * Always check `success` before using `contracts`.
 */
export interface CompilationResult {
  /** `true` when at least one contract was compiled without errors */
  success: boolean;
  /** Array of compiled contract artefacts */
  contracts: CompilationOutput[];
  /** Fatal errors (non-empty means `success === false`) */
  errors: CompilationError[];
  /** Non-fatal warnings */
  warnings: CompilationError[];
}
