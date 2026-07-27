import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useAddRule } from '../../hooks/useRules';
import { validateIp } from '../../services/api';

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

  const set = (key: keyof typeof INIT) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: '' }));
  };

  const validate = () => {
    const errs: Partial<typeof INIT> = {};
    if (!form.rule_name.trim()) errs.rule_name = 'Required';
    if (form.src_ip && !validateIp(form.src_ip)) errs.src_ip = 'Invalid IP/CIDR';
    if (form.dst_ip && !validateIp(form.dst_ip)) errs.dst_ip = 'Invalid IP/CIDR';
    if (form.dst_port) {
      const port = parseInt(form.dst_port);
      if (isNaN(port) || port < 1 || port > 65535) errs.dst_port = '1–65535';
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
        dst_port: form.dst_port ? parseInt(form.dst_port) : undefined,
        action: form.action,
        direction: form.direction,
      });
      success('Rule Added', `"${form.rule_name}" is now active`);
      setForm(INIT);
    } catch {
      error('Failed to Add Rule', 'Operation failed — please try again');
    }
  };

  const field = (key: keyof typeof INIT, label: string, placeholder: string, type = 'text') => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg bg-[#1e2a45]/40 border text-slate-300 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 ${
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
        {field('dst_port', 'Dst Port', '1–65535', 'number')}
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
          {(['input', 'output', 'forward'] as const).map((dir) => (
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
