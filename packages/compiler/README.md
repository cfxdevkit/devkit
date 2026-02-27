# @cfxdevkit/compiler

Runtime Solidity compiler and pre-built contract templates for Conflux DevKit.

Bundles [solc-js](https://github.com/ethereum/solc-js) to compile `.sol` source
in any Node.js environment — no Hardhat, no external compiler binary required.

---

## Why this package?

The CAS Hardhat project (`packages/contracts`) handles *deployment-time*
compilation of production contracts.  This package handles *runtime* compilation
needed by the `devkit-cli` (and any future tool) when a user pastes or uploads
arbitrary Solidity source at runtime.

It also ships two pre-built templates (SimpleStorage, TestToken) for testing
deployment and contract interaction in dev environments.

---

## Conflux Compatibility

All compilation defaults to EVM version **`paris`** to avoid the `PUSH0`
opcode (`0x5f`) introduced in Shanghai.  Conflux eSpace does not support `PUSH0`.
Do **not** override `evmVersion` to `'shanghai'` or later unless your target
chain explicitly supports it.

---

## Installation

```bash
pnpm add @cfxdevkit/compiler
```

`solc` (the Solidity compiler WASM binary) is a direct dependency and is
downloaded automatically.

---

## Usage

### Compile arbitrary Solidity

```typescript
import { compileSolidity } from '@cfxdevkit/compiler';

const result = compileSolidity({
  contractName: 'Counter',
  source: `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;
    contract Counter {
      uint256 public count;
      function inc() public { count++; }
    }
  `,
});

if (!result.success) {
  console.error(result.errors);
} else {
  const { bytecode, abi, compilerVersion } = result.contracts[0];
}
```

### Compile multiple files (with imports)

```typescript
import { compileMultipleSources } from '@cfxdevkit/compiler';

const result = compileMultipleSources({
  'IERC20.sol': interfaceSource,
  'MyToken.sol': tokenSource,   // contains `import "./IERC20.sol";`
});
```

### Use a pre-built template

```typescript
import { getSimpleStorageContract, getTestTokenContract } from '@cfxdevkit/compiler';

// The result is memoised — compiles only once per process
const { bytecode, abi } = getSimpleStorageContract();

// Deploy with (name, symbol, initialSupply) constructor args
const { bytecode: tokenBytecode, abi: tokenAbi } = getTestTokenContract();
```

### Enumerate all templates

```typescript
import { TEST_CONTRACTS } from '@cfxdevkit/compiler/templates';

for (const [name, template] of Object.entries(TEST_CONTRACTS)) {
  console.log(name, template.description);
  const artifact = template.getCompiled();
}
```

---

## Sub-path exports

| Import | Contents |
|--------|----------|
| `@cfxdevkit/compiler` | Everything (compiler + templates) |
| `@cfxdevkit/compiler/compiler` | `compileSolidity`, `compileMultipleSources`, `getSolcVersion`, types |
| `@cfxdevkit/compiler/templates` | `getSimpleStorageContract`, `getTestTokenContract`, `TEST_CONTRACTS` |

---

## API

### `compileSolidity(input: CompilationInput): CompilationResult`

Compile a single Solidity source file.

### `compileMultipleSources(sources, optimizer?, evmVersion?): CompilationResult`

Compile multiple source files that may import each other.

### `getSolcVersion(): string`

Return the bundled solc version string, e.g. `"0.8.28+commit.7893614a..."`.

### `CompilationResult`

```typescript
interface CompilationResult {
  success: boolean;
  contracts: CompilationOutput[];   // bytecode, deployedBytecode, abi, …
  errors:   CompilationError[];
  warnings: CompilationError[];
}
```

---

## License

Apache-2.0 — see [LICENSE](./LICENSE).
