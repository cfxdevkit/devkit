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
 * Standard ERC-721 ABI — sourced from @cfxdevkit/contracts
 *
 * `erc721Abi`         — minimal EIP-721 interface (safeTransfer, approve, tokenURI, events)
 * `erc721ExtendedAbi` — + safeMint, burn, pause, enumerable helpers (matches ERC721Base.sol)
 */
export {
  ERC721_ABI,
  ERC721_EXTENDED_ABI,
  erc721Abi,
  erc721ExtendedAbi,
} from '@cfxdevkit/contracts';
