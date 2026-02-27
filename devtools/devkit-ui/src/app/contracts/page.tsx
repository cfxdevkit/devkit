'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { FileCode2, Hammer, Upload } from 'lucide-react';
import { contractsApi, type CompileResult, type ContractTemplate } from '@/lib/api';

const DEFAULT_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string public message = "Hello, Conflux!";

    function setMessage(string calldata _msg) external {
        message = _msg;
    }
}
`;

export default function ContractsPage() {
  const [tab, setTab] = useState<'templates' | 'custom'>('templates');
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [contractName, setContractName] = useState('HelloWorld');
  const [compiled, setCompiled] = useState<CompileResult | null>(null);
  const [deployChain, setDeployChain] = useState<'evm' | 'core'>('evm');
  const [deployArgs, setDeployArgs] = useState('');
  const [deployResult, setDeployResult] = useState('');

  const { data: templates = [] } = useQuery({
    queryKey: ['contracts', 'templates'],
    queryFn: contractsApi.templates,
  });

  const compileMutation = useMutation({
    mutationFn: () => contractsApi.compile(source, contractName),
    onSuccess: (d) => setCompiled(d),
  });

  const deployMutation = useMutation({
    mutationFn: () => {
      if (!compiled) throw new Error('Compile first');
      let args: unknown[] = [];
      if (deployArgs.trim()) {
        try {
          args = JSON.parse(deployArgs);
        } catch {
          throw new Error('Invalid JSON for constructor args');
        }
      }
      return contractsApi.deploy({
        bytecode: compiled.bytecode,
        abi: compiled.abi,
        args,
        chain: deployChain,
      });
    },
    onSuccess: (d) =>
      setDeployResult(`✓ Deployed at ${d.address} (tx: ${d.txHash})`),
    onError: (e) => setDeployResult(`✗ ${e.message}`),
  });

  async function loadTemplate(name: string) {
    const t = await contractsApi.template(name);
    setSource(t.source);
    setContractName(name);
    setTab('custom');
    setCompiled(null);
    setDeployResult('');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Contracts</h1>
        <p className="mt-1 text-sm text-slate-400">
          Compile and deploy Solidity contracts
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-[#2a3147] bg-[#161b27] p-1 w-fit">
        {(['templates', 'custom'] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={`rounded-md px-4 py-1.5 text-sm capitalize transition-colors ${
              tab === t
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'templates' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {(templates as ContractTemplate[]).map((tpl) => (
            <div key={tpl.name} className="card flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <FileCode2 className="h-4 w-4 text-blue-400" />
                  {tpl.name}
                </div>
                <pre className="mt-2 max-h-32 overflow-auto text-xs text-slate-400">
                  {tpl.source.slice(0, 200)}…
                </pre>
              </div>
              <button
                type="button"
                className="btn-secondary shrink-0"
                onClick={() => loadTemplate(tpl.name)}
              >
                Use
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Editor */}
          <div>
            <label className="label">Solidity Source</label>
            <textarea
              className="input h-56 resize-y font-mono"
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setCompiled(null);
              }}
            />
          </div>
          <div className="flex items-end gap-3">
            <div className="w-48">
              <label className="label">Contract Name</label>
              <input
                className="input"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-secondary"
              disabled={compileMutation.isPending}
              onClick={() => compileMutation.mutate()}
            >
              <Hammer className="h-4 w-4" />
              {compileMutation.isPending ? 'Compiling…' : 'Compile'}
            </button>
          </div>

          {compileMutation.error && (
            <div className="rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-400">
              {compileMutation.error.message}
            </div>
          )}

          {/* Deploy section */}
          {compiled && (
            <div className="card space-y-3">
              <div className="text-sm font-medium text-green-400">
                ✓ Compiled: {compiled.contractName} ({compiled.abi.length} ABI entries)
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="label">Constructor Args (JSON array)</label>
                  <input
                    className="input"
                    value={deployArgs}
                    onChange={(e) => setDeployArgs(e.target.value)}
                    placeholder='e.g. ["Hello", 42]'
                  />
                </div>
                <div>
                  <label className="label">Chain</label>
                  <select
                    className="input"
                    value={deployChain}
                    onChange={(e) =>
                      setDeployChain(e.target.value as 'evm' | 'core')
                    }
                  >
                    <option value="evm">EVM</option>
                    <option value="core">Core</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={deployMutation.isPending}
                    onClick={() => deployMutation.mutate()}
                  >
                    <Upload className="h-4 w-4" />
                    {deployMutation.isPending ? 'Deploying…' : 'Deploy'}
                  </button>
                </div>
              </div>
              {deployResult && (
                <p
                  className={`text-sm ${
                    deployResult.startsWith('✓')
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {deployResult}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
