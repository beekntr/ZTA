import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDevices, registerDevice, getDeviceTrust } from '../services/api';
import type { DeviceRegister } from '../types';

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: ({ signal }) => getDevices(signal),
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}

export function useRegisterDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (device: DeviceRegister) => registerDevice(device),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devices'] }),
  });
}

export function useDeviceTrust(ip: string, enabled: boolean) {
  return useQuery({
    queryKey: ['device-trust', ip],
    queryFn: ({ signal }) => getDeviceTrust(ip, signal),
    enabled: enabled && ip.length > 0,
    staleTime: 30_000,
  });
}
