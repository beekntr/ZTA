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

const DIRECTIONS = [
  { value: 'input', label: 'Input' },
  { value: 'forward', label: 'Forward' },
  { value: 'output', label: 'Output' },
  { value: 'all', label: 'All' },
] as const;

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
      success('Rule added', `"${form.rule_name}" is now enforced`);
      setForm(INIT);
    } catch (err) {
      error('Could not add rule', errorMessage(err));
    }
  };

  const field = (key: keyof typeof INIT, label: string, placeholder: string, type = 'text', disabled = false) => (
    <div>
      <label htmlFor={`rule-${key}`} className="field-label">
        {label}
      </label>
      <input
        id={`rule-${key}`}
        type={type}
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={errors[key] ? true : undefined}
        className={`field ${key.includes('ip') ? 'font-mono' : ''}`}
      />
      {errors[key] && <p className="field-error">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field('rule_name', 'Rule name', 'e.g. Block scanner network')}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {field('src_ip', 'Source IP', 'Any')}
        {field('dst_ip', 'Destination IP', 'Any')}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="rule-protocol" className="field-label">
            Protocol
          </label>
          <select id="rule-protocol" value={form.protocol} onChange={set('protocol')} className="field">
            <option value="tcp">TCP</option>
            <option value="udp">UDP</option>
            <option value="icmp">ICMP</option>
            <option value="any">Any</option>
          </select>
        </div>
        {field('dst_port', 'Port', portEnabled ? '1–65535' : 'TCP/UDP only', 'number', !portEnabled)}
        <div>
          <label htmlFor="rule-action" className="field-label">
            Action
          </label>
          <select id="rule-action" value={form.action} onChange={set('action')} className="field">
            <option value="block">Block</option>
            <option value="allow">Allow</option>
          </select>
        </div>
      </div>
      <div>
        <span className="field-label">Direction</span>
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-surface-2 p-1" role="radiogroup" aria-label="Direction">
          {DIRECTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={form.direction === value}
              onClick={() => setForm((f) => ({ ...f, direction: value }))}
              className={`h-8 rounded-md text-xs font-medium transition-colors ${
                form.direction === value ? 'bg-surface text-fg shadow-card ring-1 ring-line' : 'text-fg-2 hover:text-fg'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted">
          Input: traffic to this server · Forward: traffic between zones · All: both
        </p>
      </div>
      <Button type="submit" variant="primary" loading={isPending} icon={<Plus className="h-4 w-4" />} className="w-full">
        Add rule
      </Button>
    </form>
  );
};
