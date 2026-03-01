import axios from 'axios';

const configuredApiBase = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').replace(/\/$/, '');

const inferApiBaseUrl = () => {
  if (configuredApiBase) return configuredApiBase;
  if (typeof window === 'undefined') return '';

  const { protocol, hostname, port } = window.location;
  if (port === '5173' || port === '4173') return `${protocol}//${hostname}:8000`;
  if (port === '8000') return `${protocol}//${hostname}:8001`;
  if (port === '8088') return `${protocol}//${hostname}:8001`;
  return `${protocol}//${hostname}:8001`;
};

export const apiClient = axios.create({
  baseURL: inferApiBaseUrl(),
  timeout: 10000,
});
