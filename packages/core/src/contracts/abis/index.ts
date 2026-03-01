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
 * Standard Contract ABIs
 *
 * Provides commonly used contract interfaces for:
 * - ERC20: Fungible tokens (base + extended with mint/burn/pause/permit)
 * - ERC721: Non-fungible tokens (base + extended with enumerable/royalties)
 * - ERC1155: Multi-token standard
 * - ERC2612: Permit extension for ERC-20
 * - ERC4626: Tokenised vault standard
 *
 * All ABIs are sourced from @cfxdevkit/contracts (generated from audited Solidity).
 */

// Additional standard ABIs available directly from @cfxdevkit/contracts:
export {
  ERC2612_ABI,
  ERC4626_ABI,
  erc2612Abi,
  erc4626Abi,
} from '@cfxdevkit/contracts';
export {
  ERC20_ABI,
  ERC20_EXTENDED_ABI,
  erc20Abi,
  erc20ExtendedAbi,
} from './erc20.js';
export {
  ERC721_ABI,
  ERC721_EXTENDED_ABI,
  erc721Abi,
  erc721ExtendedAbi,
} from './erc721.js';
export { ERC1155_ABI, erc1155Abi } from './erc1155.js';
