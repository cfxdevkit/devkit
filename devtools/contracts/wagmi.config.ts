import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from '@wagmi/cli';
import { hardhat } from '@wagmi/cli/plugins';
import type { Plugin } from '@wagmi/cli';

// ─── Deployment registry ─────────────────────────────────────────────────────
// deployments.json is the single source of truth for deployed contract
// addresses. Updated by devtools/contracts/scripts/deploy.ts after each deploy.
// Committing this file tracks the canonical on-chain state per network.
interface DeploymentRegistry {
  [chainId: string]: { [contractName: string]: string };
}

function loadDeployments(): DeploymentRegistry {
  try {
    return JSON.parse(readFileSync(resolve('./deployments.json'), 'utf-8'));
  } catch {
    return {};
  }
}

/**
 * Converts the flat deployments.json structure to wagmi's deployments format:
 *   { AutomationManager: { 1030: '0x...', 71: '0x...' } }
 */
function toWagmiDeployments(
  registry: DeploymentRegistry,
  contractNames: string[]
): Record<string, Record<number, `0x${string}`>> {
  const result: Record<string, Record<number, `0x${string}`>> = {};
  for (const name of contractNames) {
    const byChain: Record<number, `0x${string}`> = {};
    for (const [chainId, contracts] of Object.entries(registry)) {
      if (contracts[name]) {
        byChain[Number(chainId)] = contracts[name] as `0x${string}`;
      }
    }
    if (Object.keys(byChain).length > 0) result[name] = byChain;
  }
  return result;
}

// Contracts with on-chain deployed addresses (mainnet / testnet)
const CONTRACT_NAMES_DEPLOYED = [
  'AutomationManager',
  'SwappiPriceAdapter',
  'PermitHandler',
];

// Bootstrap / library contracts — ABI + bytecode only, no fixed addresses
const CONTRACT_NAMES_LIBRARY = [
  'ERC20Base',
  'ERC721Base',
  'ERC1155Base',
  'WrappedCFX',
  'StakingRewards',
  'VestingSchedule',
  'MerkleAirdrop',
  'MultiSigWallet',
  'PaymentSplitter',
  'MockPriceOracle',
];

const CONTRACT_NAMES = [...CONTRACT_NAMES_DEPLOYED, ...CONTRACT_NAMES_LIBRARY];

const deploymentRegistry = loadDeployments();
// Only deployed contracts have addresses
const wagmiDeployments = toWagmiDeployments(deploymentRegistry, CONTRACT_NAMES_DEPLOYED);

/** Map of library contract name → subdirectory under contracts/ */
const ARTIFACT_SUBDIRS: Record<string, string> = {
  ERC20Base:     'tokens',
  ERC721Base:    'tokens',
  ERC1155Base:   'tokens',
  WrappedCFX:    'tokens',
  StakingRewards: 'defi',
  VestingSchedule: 'defi',
  MerkleAirdrop: 'defi',
  MultiSigWallet: 'governance',
  PaymentSplitter: 'utils',
  MockPriceOracle: 'mocks',
};

function getArtifactPath(name: string): string {
  const subdir = ARTIFACT_SUBDIRS[name];
  if (subdir) {
    return resolve(`./artifacts/contracts/${subdir}/${name}.sol/${name}.json`);
  }
  return resolve(`./artifacts/contracts/${name}.sol/${name}.json`);
}

/**
 * Convert a PascalCase contract name to camelCase matching wagmi's convention.
 * Handles acronyms correctly: ERC20Base → erc20Base, WrappedCFX → wrappedCfx.
 */
function toCamelCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')       // e.g. 0B → 0_B
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')     // e.g. ERCBase → ERC_Base
    .toLowerCase()
    .replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Custom plugin — appends `as const` bytecode exports for each contract so
 * that `@cfxdevkit/core/automation` can expose them for programmatic deploys
 * without pulling in Hardhat as a dependency.
 */
function hardhatBytecodePlugin(contractNames: string[]): Plugin {
  return {
    name: 'hardhat-bytecode',
    async run() {
      const lines: string[] = [
        '',
        '// ─── Deployment bytecode ─────────────────────────────────────────────────────',
        '// Used by devtools/contracts/scripts/deploy.ts via viem deployContract.',
        '// Regenerate with: pnpm contracts:codegen',
      ];
      for (const name of contractNames) {
        const artifactPath = getArtifactPath(name);
        const artifact = JSON.parse(readFileSync(artifactPath, 'utf-8')) as {
          bytecode: string;
        };
        const varName = `${toCamelCase(name)}Bytecode`;
        lines.push(
          `export const ${varName} = '${artifact.bytecode}' as const;`
        );
      }
      return { content: lines.join('\n') };
    },
  };
}

/**
 * @wagmi/cli codegen config
 *
 * Reads compiled Hardhat artifacts from ./artifacts and emits type-safe
 * `as const` ABI + address + bytecode exports to the SDK's automation source.
 *
 * Pipeline:
 *   pnpm contracts:codegen   (from monorepo root)
 *   = hardhat compile → wagmi generate
 *   → packages/contracts/src/generated.ts
 *
 * After a new deployment, update deployments.json then re-run codegen to
 * bake the new addresses into the SDK.
 */
export default defineConfig({
  out: '../../packages/contracts/src/generated.ts',
  plugins: [
    hardhat({
      project: './',
      // Allowlist — deployed + bootstrap library contracts
      include: [
        // Deployed contracts
        'AutomationManager.json',
        'SwappiPriceAdapter.json',
        'PermitHandler.json',
        // Token contracts
        'ERC20Base.json',
        'ERC721Base.json',
        'ERC1155Base.json',
        'WrappedCFX.json',
        // DeFi contracts
        'StakingRewards.json',
        'VestingSchedule.json',
        'MerkleAirdrop.json',
        // Governance contracts
        'MultiSigWallet.json',
        // Utility contracts
        'PaymentSplitter.json',
        // Mocks
        'MockPriceOracle.json',
      ],
      // Embed deployed addresses (from deployments.json) into generated.ts.
      // Bootstrap library contracts have no on-chain addresses.
      deployments: wagmiDeployments,
    }),
    hardhatBytecodePlugin(CONTRACT_NAMES),
  ],
});
