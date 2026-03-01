import { describe, expect, it } from 'vitest';
import {
  ERC20_ABI,
  ERC20_EXTENDED_ABI,
  erc20Abi,
  erc20ExtendedAbi,
} from '../contracts/abis/erc20.js';
import {
  ERC2612_ABI,
  ERC4626_ABI,
  erc2612Abi,
  erc4626Abi,
} from '../contracts/abis/index.js';
import { ERC1155_ABI as ERC1155 } from '../contracts/abis/erc1155.js';
import {
  ERC721_ABI as ERC721,
  ERC721_EXTENDED_ABI,
  erc721ExtendedAbi,
} from '../contracts/abis/erc721.js';
import {
  ContractError,
  DeploymentError,
  InteractionError,
} from '../contracts/types/index.js';

// ── helper ────────────────────────────────────────────────────────────────────

type AbiEntry = { type: string; name?: string };
const fns = (abi: readonly AbiEntry[]) =>
  abi.filter((e) => e.type === 'function').map((e) => e.name as string);
const evts = (abi: readonly AbiEntry[]) =>
  abi.filter((e) => e.type === 'event').map((e) => e.name as string);

// ── ERC-20 base ───────────────────────────────────────────────────────────────

describe('ERC20_ABI', () => {
  it('UPPER_CASE alias is same reference as camelCase', () => {
    expect(ERC20_ABI).toBe(erc20Abi);
  });

  it('contains standard ERC20 function signatures', () => {
    expect(fns(ERC20_ABI)).toEqual(
      expect.arrayContaining([
        'transfer', 'approve', 'balanceOf', 'totalSupply', 'allowance',
        'transferFrom', 'name', 'symbol', 'decimals',
      ])
    );
  });

  it('contains Transfer and Approval events', () => {
    expect(evts(ERC20_ABI)).toEqual(
      expect.arrayContaining(['Transfer', 'Approval'])
    );
  });
});

// ── ERC-20 extended ───────────────────────────────────────────────────────────

describe('ERC20_EXTENDED_ABI', () => {
  it('UPPER_CASE alias is same reference as camelCase', () => {
    expect(ERC20_EXTENDED_ABI).toBe(erc20ExtendedAbi);
  });

  it('is a superset of ERC20_ABI', () => {
    const extFns = new Set(fns(ERC20_EXTENDED_ABI));
    for (const fn of fns(ERC20_ABI)) {
      expect(extFns.has(fn), `extended should contain '${fn}'`).toBe(true);
    }
  });

  it('adds mint, burn, pause/unpause, permit, cap', () => {
    expect(fns(ERC20_EXTENDED_ABI)).toEqual(
      expect.arrayContaining([
        'mint', 'burn', 'burnFrom', 'pause', 'unpause', 'cap',
        'permit', 'nonces', 'DOMAIN_SEPARATOR',
      ])
    );
  });

  it('adds AccessControl functions', () => {
    expect(fns(ERC20_EXTENDED_ABI)).toEqual(
      expect.arrayContaining(['hasRole', 'grantRole', 'revokeRole'])
    );
  });

  it('adds Paused, Unpaused, RoleGranted events', () => {
    expect(evts(ERC20_EXTENDED_ABI)).toEqual(
      expect.arrayContaining(['Paused', 'Unpaused', 'RoleGranted'])
    );
  });
});

// ── ERC-721 base ──────────────────────────────────────────────────────────────

describe('ERC721_ABI', () => {
  it('contains ownerOf, safeTransferFrom, tokenURI', () => {
    expect(fns(ERC721)).toEqual(
      expect.arrayContaining(['ownerOf', 'safeTransferFrom', 'tokenURI'])
    );
  });

  it('contains Transfer, Approval, ApprovalForAll events', () => {
    expect(evts(ERC721)).toEqual(
      expect.arrayContaining(['Transfer', 'Approval', 'ApprovalForAll'])
    );
  });
});

// ── ERC-721 extended ──────────────────────────────────────────────────────────

describe('ERC721_EXTENDED_ABI', () => {
  it('UPPER_CASE alias is same reference as camelCase', () => {
    expect(ERC721_EXTENDED_ABI).toBe(erc721ExtendedAbi);
  });

  it('is a superset of ERC721_ABI', () => {
    const extFns = new Set(fns(ERC721_EXTENDED_ABI));
    for (const fn of fns(ERC721)) {
      expect(extFns.has(fn), `extended should contain '${fn}'`).toBe(true);
    }
  });

  it('adds ERC721Enumerable, burn, safeMint, royaltyInfo', () => {
    expect(fns(ERC721_EXTENDED_ABI)).toEqual(
      expect.arrayContaining([
        'totalSupply', 'tokenByIndex', 'tokenOfOwnerByIndex',
        'burn', 'safeMint', 'royaltyInfo', 'maxSupply',
      ])
    );
  });
});

// ── ERC-1155 ──────────────────────────────────────────────────────────────────

describe('ERC1155_ABI', () => {
  it('contains balanceOf, balanceOfBatch, safeTransferFrom, safeBatchTransferFrom', () => {
    expect(fns(ERC1155)).toEqual(
      expect.arrayContaining([
        'balanceOf', 'balanceOfBatch', 'safeTransferFrom', 'safeBatchTransferFrom',
        'setApprovalForAll', 'isApprovedForAll', 'uri',
      ])
    );
  });

  it('contains TransferSingle, TransferBatch, URI events', () => {
    expect(evts(ERC1155)).toEqual(
      expect.arrayContaining(['TransferSingle', 'TransferBatch', 'URI'])
    );
  });
});

// ── ERC-2612 ──────────────────────────────────────────────────────────────────

describe('ERC2612_ABI re-exported from core/abis/index', () => {
  it('is the same reference as the source', () => {
    expect(ERC2612_ABI).toBe(erc2612Abi);
  });

  it('contains permit, nonces, DOMAIN_SEPARATOR', () => {
    expect(fns(ERC2612_ABI)).toEqual(
      expect.arrayContaining(['permit', 'nonces', 'DOMAIN_SEPARATOR'])
    );
  });
});

// ── ERC-4626 ──────────────────────────────────────────────────────────────────

describe('ERC4626_ABI re-exported from core/abis/index', () => {
  it('is the same reference as the source', () => {
    expect(ERC4626_ABI).toBe(erc4626Abi);
  });

  it('inherits ERC-20 and adds vault functions', () => {
    expect(fns(ERC4626_ABI)).toEqual(
      expect.arrayContaining([
        // ERC-20
        'balanceOf', 'transfer', 'approve', 'totalSupply',
        // EIP-4626
        'asset', 'totalAssets',
        'deposit', 'mint', 'withdraw', 'redeem',
        'maxDeposit', 'maxMint', 'maxWithdraw', 'maxRedeem',
        'previewDeposit', 'previewMint', 'previewWithdraw', 'previewRedeem',
        'convertToShares', 'convertToAssets',
      ])
    );
  });

  it('contains Deposit and Withdraw events', () => {
    expect(evts(ERC4626_ABI)).toEqual(
      expect.arrayContaining(['Deposit', 'Withdraw'])
    );
  });
});

// ── ContractError hierarchy ───────────────────────────────────────────────────

describe('ContractError hierarchy', () => {
  it('ContractError is an Error', () => {
    const err = new ContractError('test error');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('test error');
  });

  it('DeploymentError extends ContractError', () => {
    const err = new DeploymentError('deploy failed');
    expect(err).toBeInstanceOf(ContractError);
    expect(err).toBeInstanceOf(Error);
  });

  it('InteractionError extends ContractError', () => {
    const err = new InteractionError('interact failed');
    expect(err).toBeInstanceOf(ContractError);
  });
});
