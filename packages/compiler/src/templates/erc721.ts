/**
 * ERC-721 NFT Contract Template
 *
 * A minimal NFT contract from scratch — no OpenZeppelin dependency.
 * Demonstrates token ownership tracking, minting, safe transfers, and approval.
 *
 * Constructor: `constructor(string name, string symbol)`
 */

import { type CompilationOutput, compileSolidity } from '../compiler/index.js';

export const ERC721_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BasicNFT
 * @notice Minimal ERC-721 implementation from scratch.
 *         Teaches: mappings, token ownership, approval patterns, events.
 */
contract BasicNFT {
    string public name;
    string public symbol;
    address public owner;
    uint256 public nextTokenId;

    mapping(uint256 => address) private _ownerOf;
    mapping(address => uint256) private _balanceOf;
    mapping(uint256 => address) private _approved;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => string) private _tokenURIs;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed tokenOwner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed tokenOwner, address indexed operator, bool approved);

    modifier onlyOwner() {
        require(msg.sender == owner, "BasicNFT: not the owner");
        _;
    }

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
    }

    function balanceOf(address account) public view returns (uint256) {
        require(account != address(0), "BasicNFT: zero address");
        return _balanceOf[account];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _ownerOf[tokenId];
        require(tokenOwner != address(0), "BasicNFT: token does not exist");
        return tokenOwner;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf[tokenId] != address(0), "BasicNFT: token does not exist");
        return _tokenURIs[tokenId];
    }

    /// @notice Mint a new token to \`to\` with metadata URI \`uri\`.
    function mint(address to, string calldata uri) external onlyOwner returns (uint256) {
        require(to != address(0), "BasicNFT: mint to zero address");
        uint256 tokenId = nextTokenId++;
        _ownerOf[tokenId] = to;
        _balanceOf[to]++;
        _tokenURIs[tokenId] = uri;
        emit Transfer(address(0), to, tokenId);
        return tokenId;
    }

    function approve(address to, uint256 tokenId) external {
        address tokenOwner = ownerOf(tokenId);
        require(msg.sender == tokenOwner || _operatorApprovals[tokenOwner][msg.sender],
                "BasicNFT: not authorized");
        _approved[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        require(_ownerOf[tokenId] != address(0), "BasicNFT: token does not exist");
        return _approved[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external {
        require(operator != msg.sender, "BasicNFT: approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address tokenOwner, address operator) public view returns (bool) {
        return _operatorApprovals[tokenOwner][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(to != address(0), "BasicNFT: transfer to zero address");
        address tokenOwner = ownerOf(tokenId);
        require(tokenOwner == from, "BasicNFT: wrong from address");
        require(
            msg.sender == tokenOwner ||
            msg.sender == _approved[tokenId] ||
            _operatorApprovals[tokenOwner][msg.sender],
            "BasicNFT: not authorized"
        );
        _balanceOf[from]--;
        _balanceOf[to]++;
        _ownerOf[tokenId] = to;
        delete _approved[tokenId];
        emit Transfer(from, to, tokenId);
    }
}`;

let _compiled: CompilationOutput | null = null;

export function getERC721Contract(): CompilationOutput {
  if (!_compiled) {
    const result = compileSolidity({
      contractName: 'BasicNFT',
      source: ERC721_SOURCE,
    });
    if (!result.success || result.contracts.length === 0) {
      throw new Error(
        `BasicNFT compilation failed: ${result.errors?.join(', ')}`
      );
    }
    _compiled = result.contracts[0];
  }
  return _compiled;
}
