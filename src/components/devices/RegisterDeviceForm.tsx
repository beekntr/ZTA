import React, { useState } from 'react';
import { Cpu } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useRegisterDevice } from '../../hooks/useDevices';
import { validateIp } from '../../services/api';

const INIT = {
  ip_address: '',
  mac_address: '',
  hostname: '',
  zone: 'trusted',
};

export const RegisterDeviceForm: React.FC = () => {
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState<Partial<typeof INIT>>({});
  const { mutateAsync: registerDevice, isPending } = useRegisterDevice();
  const { success, error } = useToast();

  const set = (key: keyof typeof INIT) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: '' }));
  };

  const validate = () => {
    const errs: Partial<typeof INIT> = {};
    if (!form.ip_address || !validateIp(form.ip_address)) errs.ip_address = 'Valid IP required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await registerDevice({
        ip_address: form.ip_address.trim(),
        mac_address: form.mac_address || undefined,
        hostname: form.hostname || undefined,
        zone: form.zone || undefined,
      });
      success('Device Registered', `${form.ip_address} added to registry`);
      setForm(INIT);
    } catch {
      error('Registration Failed', 'Could not register device');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">IP Address *</label>
        <input
          type="text"
          value={form.ip_address}
          onChange={set('ip_address')}
          placeholder="e.g. 192.168.1.100"
          className={`w-full px-3 py-2 rounded-lg bg-border/40 border text-slate-300 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono ${
            errors.ip_address ? 'border-red-500/60' : 'border-border'
          }`}
        />
        {errors.ip_address && <p className="text-xs text-red-400 mt-1">{errors.ip_address}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">MAC Address</label>
        <input
          type="text"
          value={form.mac_address}
          onChange={set('mac_address')}
          placeholder="AA:BB:CC:DD:EE:FF"
          className="w-full px-3 py-2 rounded-lg bg-border/40 border border-border text-slate-300 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Hostname</label>
        <input
          type="text"
          value={form.hostname}
          onChange={set('hostname')}
          placeholder="e.g. workstation-01"
          className="w-full px-3 py-2 rounded-lg bg-border/40 border border-border text-slate-300 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Zone</label>
        <select
          value={form.zone}
          onChange={set('zone')}
          className="w-full px-3 py-2 rounded-lg bg-border/40 border border-border text-slate-300 text-sm focus:outline-none focus:border-cyan-500/50"
        >
          <option value="trusted">Trusted</option>
          <option value="untrust">Untrust</option>
          <option value="dmz">DMZ</option>
        </select>
      </div>
      <Button
        type="submit"
        variant="primary"
        loading={isPending}
        icon={<Cpu className="w-4 h-4" />}
        className="w-full justify-center"
      >
        Register Device
      </Button>
    </form>
  );
};
