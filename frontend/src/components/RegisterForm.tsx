import { useState } from 'react';

type RegisterFormProps = {
  onRegisterSuccess: () => void;
  onShowLogin: () => void;
};

export default function RegisterForm({ onRegisterSuccess, onShowLogin }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Username may already be taken.');
        }
        return res.json();
      })
      .then(() => {
        onRegisterSuccess();
      })
      .catch(err => {
        setError(err.message);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <div className="form-group">
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          className="input-field"
          required
        />
      </div>
      <div className="form-group">
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="input-field"
          required
        />
      </div>
      <div className="form-group">
        <input
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          type="password"
          placeholder="Confirm Password"
          className="input-field"
          required
        />
      </div>
      <button type="submit" className="button button-primary" style={{ width: '100%' }}>
        Create Account
      </button>
      <div className="auth-toggle">
        <p>
          Already have an account?{' '}
          <button type="button" onClick={onShowLogin}>
            Login
          </button>
        </p>
      </div>
    </form>
  );
}