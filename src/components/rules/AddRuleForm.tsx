import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useAddRule } from '../../hooks/useRules';
import { errorMessage, validateIp } from '../../services/api';
import type { RuleCreate } from '../../types';

const RULE_NAME = /^[A-Za-z0-9 _.,:/()#+-]{1,64}$/;

const INIT = {
  rule_name: '',
  src_ip: '',
  dst_ip: '',
  protocol: 'tcp',
  dst_port: '',
  action: 'block',
  direction: 'input',
};

export const AddRuleForm: React.FC = () => {
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState<Partial<typeof INIT>>({});
  const { mutateAsync: addRule, isPending } = useAddRule();
  const { success, error } = useToast();

  const portEnabled = form.protocol === 'tcp' || form.protocol === 'udp';

  const set = (key: keyof typeof INIT) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: '' }));
  };

  const validate = () => {
    const errs: Partial<typeof INIT> = {};
    if (!form.rule_name.trim()) errs.rule_name = 'Required';
    else if (!RULE_NAME.test(form.rule_name.trim())) errs.rule_name = 'Letters, digits, spaces and . , : / ( ) # + - only';
    if (form.src_ip && !validateIp(form.src_ip, true)) errs.src_ip = 'Invalid IP/CIDR (/16 or narrower)';
    if (form.dst_ip && !validateIp(form.dst_ip, true)) errs.dst_ip = 'Invalid IP/CIDR (/16 or narrower)';
    if (form.dst_port && portEnabled) {
      const port = parseInt(form.dst_port);
      if (isNaN(port) || port < 1 || port > 65535) errs.dst_port = '1–65535';
    }
    if (!form.src_ip && !form.dst_ip && !(form.dst_port && portEnabled) && form.protocol === 'any') {
      errs.rule_name = 'Give an IP, protocol or port — a rule must not match all traffic';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await addRule({
        rule_name: form.rule_name.trim(),
        src_ip: form.src_ip || undefined,
        dst_ip: form.dst_ip || undefined,
        protocol: form.protocol || undefined,
        dst_port: form.dst_port && portEnabled ? parseInt(form.dst_port) : undefined,
        action: form.action as RuleCreate['action'],
        direction: form.direction as RuleCreate['direction'],
      });
      success('Rule Added', `"${form.rule_name}" is now active`);
      setForm(INIT);
    } catch (err) {
      error('Failed to Add Rule', errorMessage(err));
    }
  };

  const field = (key: keyof typeof INIT, label: string, placeholder: string, type = 'text', disabled = false) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 rounded-lg bg-[#1e2a45]/40 border text-slate-300 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 disabled:opacity-40 ${
          errors[key] ? 'border-red-500/60' : 'border-[#1e2a45]'
        }`}
      />
      {errors[key] && <p className="text-xs text-red-400 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field('rule_name', 'Rule Name *', 'e.g. Block China Range')}
      <div className="grid grid-cols-2 gap-3">
        {field('src_ip', 'Source IP', '0.0.0.0/0 or blank')}
        {field('dst_ip', 'Destination IP', '0.0.0.0/0 or blank')}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {/* Protocol */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Protocol</label>
          <select
            value={form.protocol}
            onChange={set('protocol')}
            className="w-full px-3 py-2 rounded-lg bg-[#1e2a45]/40 border border-[#1e2a45] text-slate-300 text-sm focus:outline-none focus:border-cyan-500/50"
          >
            <option value="tcp">TCP</option>
            <option value="udp">UDP</option>
            <option value="icmp">ICMP</option>
            <option value="any">Any</option>
          </select>
        </div>
        {/* Port */}
        {field('dst_port', 'Dst Port', portEnabled ? '1–65535' : 'TCP/UDP only', 'number', !portEnabled)}
        {/* Action */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Action</label>
          <select
            value={form.action}
            onChange={set('action')}
            className="w-full px-3 py-2 rounded-lg bg-[#1e2a45]/40 border border-[#1e2a45] text-slate-300 text-sm focus:outline-none focus:border-cyan-500/50"
          >
            <option value="block">Block</option>
            <option value="allow">Allow</option>
          </select>
        </div>
      </div>
      {/* Direction */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Direction</label>
        <div className="flex gap-2">
          {(['input', 'forward', 'output', 'all'] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => setForm((f) => ({ ...f, direction: dir }))}
              className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                form.direction === dir
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                  : 'bg-[#1e2a45]/30 border-[#1e2a45] text-slate-500 hover:text-slate-300'
              }`}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>
      <Button
        type="submit"
        variant="primary"
        loading={isPending}
        icon={<Plus className="w-4 h-4" />}
        className="w-full justify-center"
      >
        Add Rule
      </Button>
    </form>
  );
};
