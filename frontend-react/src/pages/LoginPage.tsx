import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { setSessionToken } from '../lib/authSession';

const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';
const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM || 'sos-location';
const keycloakClient = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'sos-location-frontend';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await authApi.login({ username, password });
      setSessionToken(result.token);
      navigate('/app/command-center', { replace: true });
    } catch {
      setError('Falha no login local. Confira usuário/senha ou use Keycloak SSO.');
    } finally {
      setLoading(false);
    }
  };

  const ssoLoginUrl = `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/auth?client_id=${keycloakClient}&response_type=code&scope=openid&redirect_uri=${encodeURIComponent(window.location.origin + '/login')}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-2xl border border-slate-700 bg-slate-900/90 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">sos-location</p>
          <h1 className="text-xl font-semibold text-slate-100">Acesso ao Command Center</h1>
        </div>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" placeholder="Usuário" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" placeholder="Senha" />
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button disabled={loading} className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-60">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <a href={ssoLoginUrl} className="block text-center text-sm text-cyan-300 hover:text-cyan-200">
          Entrar com Keycloak
        </a>
      </form>
    </div>
  );
}
