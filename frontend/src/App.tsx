import { useEffect, useState } from 'react'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'


type Poll = {
  id: number
  question: string
  options: string[]
  votes: Record<string, number>
  hasVoted: boolean
  userIsCreator: boolean
}

function App() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRegister, setShowRegister] = useState(false)

  
  // Fetch all polls


useEffect(() => {
  setLoading(true)
  fetch('/api/polls', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    }
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch polls')
      return res.json()
    })
    .then(data => {
const validPolls = (Array.isArray(data) ? data : [data]).filter(
    poll => poll && poll.question
  )
  setPolls(validPolls)
  setLoading(false)
    })
    .catch(err => {
      setError(err.message)
      setLoading(false)
    })
}, [])
    if (!user) {
    if (showRegister) {
      return (
        <RegisterForm
          onRegister={() => setShowRegister(false)} // Redirect to login after registering
        />
      )
    }
    return (
      <LoginForm
        onLogin={setUser}
        onShowRegister={() => setShowRegister(true)}
      />
    )
  }


if (loading) return <div>Loading...</div>
if (error) return <div>Error: {error}</div>

  // Create Poll
  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault()
    fetch('/api/polls', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json' },
      body: JSON.stringify({ question, options: options.filter(o => o.trim() !== '') }),
    })
      .then(res => res.json())
      .then(newPoll => {
        setPolls([...polls, newPoll])
        setQuestion('')
        setOptions(['', ''])
      })
      .catch(err => console.error(err))
  }

  const handleDeletePoll = (pollId: number) => {
  fetch(`/api/polls/${pollId}/delete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
      setPolls(polls.filter(p => p.id !== data.deleted_id))
    })
    .catch(err => console.error(err))
}

  // Vote
  const handleVote = (pollId: number, option: string) => {
    fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: {     'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json' },
      body: JSON.stringify({ option }),
    })
      .then(res => res.json())
      .then(updatedPoll => {
        setPolls(polls.map(p => (p.id === updatedPoll.id ? updatedPoll : p)))
      })
      .catch(err => console.error(err))
  }

  // Add option input
  const addOption = () => setOptions([...options, ''])

  // Update option value
  const updateOption = (idx: number, value: string) => {
    setOptions(options.map((opt, i) => (i === idx ? value : opt)))
  }

  return (
    <div>
      <h1>Polls</h1>
      <form onSubmit={handleCreatePoll} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          required
        />
        {options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            placeholder={`Option ${idx + 1}`}
            value={opt}
            onChange={e => updateOption(idx, e.target.value)}
            required
            style={{ marginLeft: 8 }}
          />
        ))}
        <button type="button" onClick={addOption} style={{ marginLeft: 8 }}>
          +
        </button>
        <button type="submit" style={{ marginLeft: 8 }}>
          Create Poll
        </button>
      </form>
      {polls.length === 0 && <p>No polls found.</p>}
      {polls.map(poll => (
        <div key={poll.id} style={{ border: '1px solid #ccc', margin: 8, padding: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <h2 style={{ margin: 0 }}>{poll.question}</h2>
      {poll.userIsCreator && (
      <button
        onClick={() => handleDeletePoll(poll.id)}
        style={{
          background: '#a00',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          padding: '4px 12px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        DELETE
      </button>
      )}
    </div>
          <ul>
            {poll.options.map(option => (
              <li key={option}>
                {option} 
                      {poll.hasVoted && <> — Votes: {poll.votes?.[option] ?? 0}</>}

                <button onClick={() => handleVote(poll.id, option)}>Vote</button>
              </li>
              
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default App