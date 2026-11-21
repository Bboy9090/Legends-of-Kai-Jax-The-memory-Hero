import { FormEvent, useEffect, useRef, useState } from 'react';
import { adminLogin } from '../services/adminSession';

interface Props {
  onResult: (authenticated: boolean) => void;
}

/** Runtime-only operator sign-in. The secret is held in component state just long enough to POST it. */
export function AdminLoginDialog({ onResult }: Props) {
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onResult(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onResult]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!secret || busy) return;
    setBusy(true);
    setError(null);
    const result = await adminLogin(secret);
    setSecret('');
    setBusy(false);
    if (result.ok) onResult(true);
    else setError(result.error ?? 'Login failed.');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="admin-login-title">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-white/15 bg-slate-950 p-5 shadow-2xl" data-testid="admin-login">
        <h2 id="admin-login-title" className="text-lg font-semibold text-white">Administrator sign-in</h2>
        <p className="mt-1 text-sm text-slate-300">Asset imports and character reconstruction need the server administrator secret. It is sent once and never stored in this app.</p>
        <label className="mt-4 block text-xs uppercase tracking-wide text-slate-300" htmlFor="admin-secret">Administrator secret</label>
        <input
          ref={inputRef}
          id="admin-secret"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={secret}
          onChange={(ev) => setSecret(ev.target.value)}
          className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-2 text-white outline-none focus:border-amber-400"
        />
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => onResult(false)} className="min-h-[44px] rounded-md border border-white/20 px-4 text-sm text-slate-200 hover:bg-white/10">
            Cancel
          </button>
          <button type="submit" disabled={busy || !secret} className="min-h-[44px] rounded-md bg-amber-500 px-4 text-sm font-semibold text-black disabled:opacity-50">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
