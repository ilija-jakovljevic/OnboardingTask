import { useState } from 'react'

export default function RegisterForm({ onRegister }: { onRegister: (user: any) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }
    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid credentials')
        return res.json()
      }).then(data => {
    localStorage.setItem('token', data.token)
    onRegister(data)
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
      <input
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        type="password"
        placeholder="Confirm Password"
        required
      />
      <button type="submit">Register</button>
    </form>
  )
}