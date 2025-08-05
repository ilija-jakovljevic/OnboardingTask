import { useState } from 'react';

type LoginFormProps = {
  onLogin: (user: any) => void;
  onShowRegister: () => void;
};

export default function LoginForm({ onLogin, onShowRegister }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Invalid username or password. Please try again.');
        }
        return res.json();
      })
      .then(data => {
        localStorage.setItem('token', data.token);
        onLogin(data);
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
      <button type="submit" className="button button-primary" style={{ width: '100%' }}>
        Login
      </button>
      <div className="auth-toggle">
        <p>
          Don't have an account?{' '}
          <button type="button" onClick={onShowRegister}>
            Sign Up
          </button>
        </p>
      </div>
    </form>
  );
}