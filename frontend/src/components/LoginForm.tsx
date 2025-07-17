import { useState } from 'react'

  type LoginFormProps = {
  onLogin: (user: any) => void
  onShowRegister: () => void
}

export default function LoginForm({ onLogin, onShowRegister }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid credentials')
        return res.json()
      }).then(data => {
    localStorage.setItem('token', data.token)
    onLogin(data)
  })
      .catch(err => alert(err.message))
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        value={password}
        onChange={e => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      <button type="button" onClick={onShowRegister} style={{ marginLeft: 8 }}>
        Register
      </button>
    </form>
  )
}