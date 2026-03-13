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
import type { SafetyConfig } from '@cfxdevkit/executor/automation';

export const DEFAULT_SAFETY_CONFIG: SafetyConfig = {
  maxSwapUsd: 10_000,
  maxSlippageBps: 500,
  maxRetries: 5,
  minExecutionIntervalSeconds: 30,
  globalPause: false,
};
