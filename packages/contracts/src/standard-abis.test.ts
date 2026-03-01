import { describe, expect, it } from 'vitest';
import {
  ERC20_ABI,
  ERC20_EXTENDED_ABI,
  ERC721_ABI,
  ERC721_EXTENDED_ABI,
  ERC1155_ABI,
  ERC2612_ABI,
  ERC4626_ABI,
  erc20Abi,
  erc20ExtendedAbi,
  erc721Abi,
  erc721ExtendedAbi,
  erc1155Abi,
  erc2612Abi,
  erc4626Abi,
} from './standard-abis.js';

// ── helpers ──────────────────────────────────────────────────────────────────

type AbiEntry = { type: string; name?: string };

const fns = (abi: readonly AbiEntry[]) =>
  abi.filter((e) => e.type === 'function').map((e) => e.name as string);

const events = (abi: readonly AbiEntry[]) =>
  abi.filter((e) => e.type === 'event').map((e) => e.name as string);

// ── UPPER_CASE alias identity ─────────────────────────────────────────────────

describe('UPPER_CASE aliases are identical to camelCase exports', () => {
  it('ERC2612_ABI === erc2612Abi', () => {
    expect(ERC2612_ABI).toBe(erc2612Abi);
  });
  it('ERC20_ABI === erc20Abi', () => {
    expect(ERC20_ABI).toBe(erc20Abi);
  });
  it('ERC20_EXTENDED_ABI === erc20ExtendedAbi', () => {
    expect(ERC20_EXTENDED_ABI).toBe(erc20ExtendedAbi);
  });
  it('ERC721_ABI === erc721Abi', () => {
    expect(ERC721_ABI).toBe(erc721Abi);
  });
  it('ERC721_EXTENDED_ABI === erc721ExtendedAbi', () => {
    expect(ERC721_EXTENDED_ABI).toBe(erc721ExtendedAbi);
  });
  it('ERC1155_ABI === erc1155Abi', () => {
    expect(ERC1155_ABI).toBe(erc1155Abi);
  });
  it('ERC4626_ABI === erc4626Abi', () => {
    expect(ERC4626_ABI).toBe(erc4626Abi);
  });
});

// ── erc2612Abi ────────────────────────────────────────────────────────────────

describe('erc2612Abi', () => {
  it('exposes permit, nonces, DOMAIN_SEPARATOR', () => {
    expect(fns(erc2612Abi)).toEqual(
      expect.arrayContaining(['permit', 'nonces', 'DOMAIN_SEPARATOR'])
    );
  });

  it('permit has 7 inputs with correct types', () => {
    const permit = erc2612Abi.find(
      (e) => e.type === 'function' && e.name === 'permit'
    ) as { inputs: { type: string }[] } | undefined;
    expect(permit).toBeDefined();
    const types = permit!.inputs.map((i) => i.type);
    expect(types).toEqual([
      'address',
      'address',
      'uint256',
      'uint256',
      'uint8',
      'bytes32',
      'bytes32',
    ]);
  });

  it('contains only functions (no events)', () => {
    expect(events(erc2612Abi)).toHaveLength(0);
  });
});

// ── erc20Abi ──────────────────────────────────────────────────────────────────

describe('erc20Abi', () => {
  it('contains all EIP-20 functions', () => {
    expect(fns(erc20Abi)).toEqual(
      expect.arrayContaining([
        'name',
        'symbol',
        'decimals',
        'totalSupply',
        'balanceOf',
        'allowance',
        'transfer',
        'approve',
        'transferFrom',
      ])
    );
  });

  it('contains Transfer and Approval events', () => {
    expect(events(erc20Abi)).toEqual(
      expect.arrayContaining(['Transfer', 'Approval'])
    );
  });

  it('Transfer event has from, to, value', () => {
    const ev = erc20Abi.find(
      (e) => e.type === 'event' && e.name === 'Transfer'
    ) as { inputs: { name: string; indexed: boolean }[] } | undefined;
    expect(ev).toBeDefined();
    const names = ev!.inputs.map((i) => i.name);
    expect(names).toEqual(['from', 'to', 'value']);
    expect(ev!.inputs[0].indexed).toBe(true);
    expect(ev!.inputs[1].indexed).toBe(true);
    expect(ev!.inputs[2].indexed).toBe(false);
  });
});

// ── erc20ExtendedAbi ──────────────────────────────────────────────────────────

describe('erc20ExtendedAbi', () => {
  it('is a superset of erc20Abi', () => {
    const baseNames = new Set(fns(erc20Abi));
    for (const fn of fns(erc20ExtendedAbi)) {
      baseNames.delete(fn);
    }
    // All base function names should have been present in extended
    expect(baseNames.size).toBe(0);
  });

  it('adds mint, burn, pause, unpause, cap', () => {
    expect(fns(erc20ExtendedAbi)).toEqual(
      expect.arrayContaining([
        'mint',
        'burn',
        'burnFrom',
        'pause',
        'unpause',
        'cap',
      ])
    );
  });

  it('includes EIP-2612 permit functions', () => {
    expect(fns(erc20ExtendedAbi)).toEqual(
      expect.arrayContaining(['permit', 'nonces', 'DOMAIN_SEPARATOR'])
    );
  });

  it('includes AccessControl functions', () => {
    expect(fns(erc20ExtendedAbi)).toEqual(
      expect.arrayContaining([
        'hasRole',
        'grantRole',
        'revokeRole',
        'renounceRole',
        'getRoleAdmin',
      ])
    );
  });

  it('includes MINTER_ROLE and PAUSER_ROLE view functions', () => {
    expect(fns(erc20ExtendedAbi)).toEqual(
      expect.arrayContaining(['MINTER_ROLE', 'PAUSER_ROLE'])
    );
  });

  it('contains Paused and Unpaused events', () => {
    expect(events(erc20ExtendedAbi)).toEqual(
      expect.arrayContaining(['Paused', 'Unpaused'])
    );
  });

  it('contains AccessControl events', () => {
    expect(events(erc20ExtendedAbi)).toEqual(
      expect.arrayContaining(['RoleGranted', 'RoleRevoked', 'RoleAdminChanged'])
    );
  });
});

// ── erc721Abi ─────────────────────────────────────────────────────────────────

describe('erc721Abi', () => {
  it('contains all EIP-721 functions', () => {
    expect(fns(erc721Abi)).toEqual(
      expect.arrayContaining([
        'balanceOf',
        'ownerOf',
        'safeTransferFrom',
        'transferFrom',
        'approve',
        'getApproved',
        'setApprovalForAll',
        'isApprovedForAll',
        'supportsInterface',
      ])
    );
  });

  it('contains metadata functions', () => {
    expect(fns(erc721Abi)).toEqual(
      expect.arrayContaining(['name', 'symbol', 'tokenURI'])
    );
  });

  it('contains Transfer, Approval, ApprovalForAll events', () => {
    expect(events(erc721Abi)).toEqual(
      expect.arrayContaining(['Transfer', 'Approval', 'ApprovalForAll'])
    );
  });

  it('Transfer event has tokenId as third indexed param', () => {
    const ev = erc721Abi.find(
      (e) => e.type === 'event' && e.name === 'Transfer'
    ) as { inputs: { name: string; indexed: boolean }[] } | undefined;
    expect(ev).toBeDefined();
    expect(ev!.inputs[2].name).toBe('tokenId');
    expect(ev!.inputs[2].indexed).toBe(true);
  });
});

// ── erc721ExtendedAbi ─────────────────────────────────────────────────────────

describe('erc721ExtendedAbi', () => {
  it('is a superset of erc721Abi (all base functions present)', () => {
    const extFns = new Set(fns(erc721ExtendedAbi));
    for (const fn of fns(erc721Abi)) {
      expect(extFns.has(fn), `extended should contain '${fn}'`).toBe(true);
    }
  });

  it('adds ERC721Enumerable functions', () => {
    expect(fns(erc721ExtendedAbi)).toEqual(
      expect.arrayContaining([
        'totalSupply',
        'tokenByIndex',
        'tokenOfOwnerByIndex',
      ])
    );
  });

  it('adds burn, safeMint, maxSupply', () => {
    expect(fns(erc721ExtendedAbi)).toEqual(
      expect.arrayContaining(['burn', 'safeMint', 'maxSupply'])
    );
  });

  it('adds royaltyInfo (ERC2981)', () => {
    expect(fns(erc721ExtendedAbi)).toContain('royaltyInfo');
  });

  it('adds pause/unpause', () => {
    expect(fns(erc721ExtendedAbi)).toEqual(
      expect.arrayContaining(['pause', 'unpause', 'paused'])
    );
  });
});

// ── erc1155Abi ────────────────────────────────────────────────────────────────

describe('erc1155Abi', () => {
  it('contains all EIP-1155 functions', () => {
    expect(fns(erc1155Abi)).toEqual(
      expect.arrayContaining([
        'uri',
        'balanceOf',
        'balanceOfBatch',
        'setApprovalForAll',
        'isApprovedForAll',
        'safeTransferFrom',
        'safeBatchTransferFrom',
        'supportsInterface',
      ])
    );
  });

  it('contains TransferSingle, TransferBatch, ApprovalForAll, URI events', () => {
    expect(events(erc1155Abi)).toEqual(
      expect.arrayContaining([
        'TransferSingle',
        'TransferBatch',
        'ApprovalForAll',
        'URI',
      ])
    );
  });

  it('TransferSingle event has operator, from, to, id, value', () => {
    const ev = erc1155Abi.find(
      (e) => e.type === 'event' && e.name === 'TransferSingle'
    ) as { inputs: { name: string }[] } | undefined;
    expect(ev).toBeDefined();
    expect(ev!.inputs.map((i) => i.name)).toEqual([
      'operator',
      'from',
      'to',
      'id',
      'value',
    ]);
  });
});

// ── erc4626Abi ────────────────────────────────────────────────────────────────

describe('erc4626Abi', () => {
  it('inherits ERC-20 functions', () => {
    expect(fns(erc4626Abi)).toEqual(
      expect.arrayContaining([
        'balanceOf',
        'transfer',
        'approve',
        'totalSupply',
      ])
    );
  });

  it('contains EIP-4626 asset and conversion functions', () => {
    expect(fns(erc4626Abi)).toEqual(
      expect.arrayContaining([
        'asset',
        'totalAssets',
        'convertToShares',
        'convertToAssets',
      ])
    );
  });

  it('contains all limit functions', () => {
    expect(fns(erc4626Abi)).toEqual(
      expect.arrayContaining([
        'maxDeposit',
        'maxMint',
        'maxWithdraw',
        'maxRedeem',
      ])
    );
  });

  it('contains all preview functions', () => {
    expect(fns(erc4626Abi)).toEqual(
      expect.arrayContaining([
        'previewDeposit',
        'previewMint',
        'previewWithdraw',
        'previewRedeem',
      ])
    );
  });

  it('contains deposit, mint, withdraw, redeem actions', () => {
    expect(fns(erc4626Abi)).toEqual(
      expect.arrayContaining(['deposit', 'mint', 'withdraw', 'redeem'])
    );
  });

  it('contains Deposit and Withdraw events', () => {
    expect(events(erc4626Abi)).toEqual(
      expect.arrayContaining(['Deposit', 'Withdraw'])
    );
  });

  it('Withdraw event has 5 params including receiver', () => {
    const ev = erc4626Abi.find(
      (e) => e.type === 'event' && e.name === 'Withdraw'
    ) as { inputs: { name: string }[] } | undefined;
    expect(ev).toBeDefined();
    expect(ev!.inputs.map((i) => i.name)).toEqual([
      'sender',
      'receiver',
      'owner',
      'assets',
      'shares',
    ]);
  });
});
