import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useRegisterDevice } from '../../hooks/useDevices';
import { errorMessage, validateIp } from '../../services/api';

const MAC = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/;
const HOSTNAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,62}$/;

const INIT = {
  ip_address: '',
  mac_address: '',
  hostname: '',
  zone: 'untrust', // zero trust: nothing is trusted by default
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
    if (form.mac_address && !MAC.test(form.mac_address.trim())) errs.mac_address = 'Format AA:BB:CC:DD:EE:FF';
    if (form.hostname && !HOSTNAME.test(form.hostname.trim())) errs.hostname = 'Letters, digits, . _ - only';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await registerDevice({
        ip_address: form.ip_address.trim(),
        mac_address: form.mac_address.trim() || undefined,
        hostname: form.hostname.trim() || undefined,
        zone: form.zone || undefined,
      });
      success('Device registered', `${form.ip_address} added to the registry`);
      setForm(INIT);
    } catch (err) {
      error('Registration failed', errorMessage(err));
    }
  };

  const input = (key: 'ip_address' | 'mac_address' | 'hostname', label: string, placeholder: string, mono = true) => (
    <div>
      <label htmlFor={`device-${key}`} className="field-label">
        {label}
      </label>
      <input
        id={`device-${key}`}
        type="text"
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        aria-invalid={errors[key] ? true : undefined}
        className={`field ${mono ? 'font-mono' : ''}`}
      />
      {errors[key] && <p className="field-error">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {input('ip_address', 'IP address', 'e.g. 192.168.20.10')}
        {input('mac_address', 'MAC address (optional)', 'AA:BB:CC:DD:EE:FF')}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {input('hostname', 'Hostname (optional)', 'e.g. workstation-01', false)}
        <div>
          <label htmlFor="device-zone" className="field-label">
            Zone
          </label>
          <select id="device-zone" value={form.zone} onChange={set('zone')} className="field">
            <option value="untrust">Untrusted</option>
            <option value="trusted">Trusted</option>
            <option value="dmz">DMZ</option>
          </select>
        </div>
      </div>
      <Button type="submit" variant="primary" loading={isPending} icon={<Plus className="h-4 w-4" />} className="w-full">
        Register device
      </Button>
    </form>
  );
};
