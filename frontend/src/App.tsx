import { useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import './App.css';

type Poll = {
  id: number;
  question: string;
  options: string[];
  votes: Record<string, number>;
  hasVoted: boolean;
  userIsCreator: boolean;
};

function App() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        setUser({ token }); 
    } else {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    fetch('/api/polls', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token'); 
            setUser(null); 
            setLoading(false); 
            return Promise.reject(new Error('Session expired')); 
          }
          throw new Error('Failed to fetch polls');
        }
        return res.json();
      })
      .then(data => {
        const validPolls = (Array.isArray(data) ? data : [data]).filter(
          poll => poll && poll.question
        );
        setPolls(validPolls);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [user]);

const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/polls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        options: options.filter(o => o.trim() !== ''),
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Could not create poll');
        return res.json();
       })
      .then(newPollFromApi => {
        const completeNewPoll = {
          ...newPollFromApi,
          votes: {},
          hasVoted: false,
          userIsCreator: true,
        };
        
        setPolls([completeNewPoll, ...polls]);
        setQuestion('');
        setOptions(['', '']);
      })
      .catch(err => console.error(err));
  };

  const handleDeletePoll = (pollId: number) => {
    fetch(`/api/polls/${pollId}/delete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        setPolls(polls.filter(p => p.id !== data.deleted_id));
      })
      .catch(err => console.error(err));
  };

  const handleVote = (pollId: number, option: string) => {
    fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ option }),
    })
      .then(res => res.json())
      .then(updatedPoll => {
        setPolls(polls.map(p => (p.id === updatedPoll.id ? updatedPoll : p)));
      })
      .catch(err => console.error(err));
  };

  const addOption = () => setOptions([...options, '']);

  const updateOption = (idx: number, value: string) => {
    setOptions(options.map((opt, i) => (i === idx ? value : opt)));
  };

  if (!user) {
    return (
        <div className="auth-form">
            <h2 className="form-title">{showRegister ? 'Create Account' : 'Welcome Back'}</h2>
            {showRegister ? (
                <RegisterForm
                    onRegisterSuccess={() => setShowRegister(false)}
                    onShowLogin={() => setShowRegister(false)}
                />
            ) : (
                <LoginForm
                    onLogin={setUser}
                    onShowRegister={() => setShowRegister(true)}
                />
            )}
        </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Polls...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1 className="app-header">Polling App</h1>

      <form onSubmit={handleCreatePoll} className="create-poll-form">
        <h2 className="form-title">Create a New Poll</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="What's your question?"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div className="form-group">
          <div className="options-container">
            {options.map((opt, idx) => (
              <div key={idx} className="option-input-group">
                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={e => updateOption(idx, e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button type="button" onClick={addOption} className="button button-secondary">
            Add Option
          </button>
          <button type="submit" className="button button-primary">
            Create Poll
          </button>
        </div>
      </form>

      <div className="poll-list">
        {polls.length === 0 && <p>No polls available. Create one to get started!</p>}
        {polls.map(poll => {
          const totalVotes = Object.values(poll.votes).reduce((sum, count) => sum + count, 0);
          return (
            <div key={poll.id} className="poll-card">
              <div className="poll-header">
                <h2 className="poll-question">{poll.question}</h2>
                {poll.userIsCreator && (
                  <button onClick={() => handleDeletePoll(poll.id)} className="delete-button" title="Delete Poll">
                    &times;
                  </button>
                )}
              </div>
              <ul className="poll-options">
                {poll.options.map(option => {
                  const votes = poll.votes?.[option] ?? 0;
                  const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                  return (
                    <li
                      key={option}
                      className={`poll-option ${poll.hasVoted ? 'voted' : ''}`}
                      onClick={() => !poll.hasVoted && handleVote(poll.id, option)}
                    >
                      <div
                        className="vote-result-bar"
                        style={{ width: poll.hasVoted ? `${percentage}%` : '0%' }}
                      ></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span className="option-text">{option}</span>
                         {poll.hasVoted && (
                            <span className="vote-details">
                                {votes} votes ({percentage.toFixed(0)}%)
                            </span>
                         )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;