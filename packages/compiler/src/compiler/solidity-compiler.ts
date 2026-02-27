/**
 * Runtime Solidity Compiler
 *
 * Wraps solc-js to compile Solidity source code in any Node.js environment.
 *
 * Key design decisions:
 * - EVM target defaults to `'paris'` to avoid PUSH0 (0x5f) which is absent on
 *   Conflux eSpace. Override only when you know the target chain supports it.
 * - Optimizer is enabled by default (200 runs) to match on-chain deployment gas.
 */

import solc from 'solc';

import type {
  CompilationError,
  CompilationInput,
  CompilationOutput,
  CompilationResult,
} from './types.js';

/**
 * Compile a single Solidity source file.
 *
 * @example
 * ```typescript
 * const result = compileSolidity({
 *   contractName: 'Counter',
 *   source: 'pragma solidity ^0.8.20; contract Counter { uint256 public n; }',
 * });
 *
 * if (!result.success) throw new Error(result.errors[0].message);
 * const { bytecode, abi } = result.contracts[0];
 * ```
 */
export function compileSolidity(input: CompilationInput): CompilationResult {
  const { contractName, source, optimizer, evmVersion = 'paris' } = input;

  const solcInput = {
    language: 'Solidity',
    sources: {
      [`${contractName}.sol`]: { content: source },
    },
    settings: {
      evmVersion,
      outputSelection: {
        '*': {
          '*': [
            'abi',
            'evm.bytecode',
            'evm.deployedBytecode',
            'evm.gasEstimates',
          ],
        },
      },
      optimizer: optimizer ?? { enabled: true, runs: 200 },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(solcInput)));
  const { errors, warnings } = classifyDiagnostics(output.errors);

  if (errors.length > 0) {
    return { success: false, contracts: [], errors, warnings };
  }

  const contracts = extractContracts(output.contracts?.[`${contractName}.sol`]);
  return { success: contracts.length > 0, contracts, errors, warnings };
}

/**
 * Compile multiple Solidity sources simultaneously.
 *
 * Useful for contracts that `import` each other.
 *
 * @example
 * ```typescript
 * const result = compileMultipleSources({
 *   'IERC20.sol': interfaceSource,
 *   'MyToken.sol': tokenSource,
 * });
 * ```
 */
export function compileMultipleSources(
  sources: Record<string, string>,
  optimizer?: { enabled: boolean; runs: number },
  evmVersion = 'paris'
): CompilationResult {
  const solcSources: Record<string, { content: string }> = {};
  for (const [name, content] of Object.entries(sources)) {
    solcSources[name.endsWith('.sol') ? name : `${name}.sol`] = { content };
  }

  const solcInput = {
    language: 'Solidity',
    sources: solcSources,
    settings: {
      evmVersion,
      outputSelection: {
        '*': {
          '*': [
            'abi',
            'evm.bytecode',
            'evm.deployedBytecode',
            'evm.gasEstimates',
          ],
        },
      },
      optimizer: optimizer ?? { enabled: true, runs: 200 },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(solcInput)));
  const { errors, warnings } = classifyDiagnostics(output.errors);

  if (errors.length > 0) {
    return { success: false, contracts: [], errors, warnings };
  }

  const contracts: CompilationOutput[] = [];
  if (output.contracts) {
    for (const [sourceName, sourceContracts] of Object.entries(
      output.contracts
    )) {
      for (const [contractName, contract] of Object.entries(
        sourceContracts as Record<string, unknown>
      )) {
        const c = contract as RawSolcContract;
        // Skip interfaces and abstract contracts (empty bytecode)
        if (!c.evm.bytecode.object) continue;
        contracts.push(buildOutput(`${sourceName}:${contractName}`, c));
      }
    }
  }

  return { success: contracts.length > 0, contracts, errors, warnings };
}

/**
 * Return the bundled solc version string.
 *
 * @example `"0.8.28+commit.7893614a.Emscripten.clang"`
 */
export function getSolcVersion(): string {
  return solc.version();
}

// ── Internals ──────────────────────────────────────────────────────────────

interface RawSolcContract {
  abi: unknown[];
  evm: {
    bytecode: { object: string };
    deployedBytecode: { object: string };
    gasEstimates?: {
      creation: {
        codeDepositCost: string;
        executionCost: string;
        totalCost: string;
      };
    };
  };
}

function classifyDiagnostics(rawErrors?: unknown[]): {
  errors: CompilationError[];
  warnings: CompilationError[];
} {
  const errors: CompilationError[] = [];
  const warnings: CompilationError[] = [];
  for (const err of rawErrors ?? []) {
    const e = err as {
      severity: string;
      message: string;
      formattedMessage: string;
      sourceLocation?: { file: string; start: number; end: number };
    };
    const diag: CompilationError = {
      severity: e.severity === 'error' ? 'error' : 'warning',
      message: e.message,
      formattedMessage: e.formattedMessage,
      sourceLocation: e.sourceLocation,
    };
    if (diag.severity === 'error') errors.push(diag);
    else warnings.push(diag);
  }
  return { errors, warnings };
}

function extractContracts(
  sourceContracts: Record<string, unknown> | undefined
): CompilationOutput[] {
  if (!sourceContracts) return [];
  return Object.entries(sourceContracts).map(([name, contract]) =>
    buildOutput(name, contract as RawSolcContract)
  );
}

function buildOutput(
  contractName: string,
  c: RawSolcContract
): CompilationOutput {
  return {
    contractName,
    bytecode: `0x${c.evm.bytecode.object}`,
    deployedBytecode: `0x${c.evm.deployedBytecode.object}`,
    abi: c.abi,
    compilerVersion: solc.version(),
    gasEstimates: c.evm.gasEstimates,
  };
}
