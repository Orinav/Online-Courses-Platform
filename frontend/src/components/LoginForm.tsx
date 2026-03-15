import { useState } from 'react';
import './LoginForm.css';

interface LoginFormProps {
  // We need to tell App.tsx when the login is successful so it can update the screen
  onLoginSuccess: (token: string, role: string) => void;
}

function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any old errors

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Pass the real token and role back up to App.tsx
        onLoginSuccess(data.token, data.user.role);
      } else {
        // Show the error from the backend (like "Invalid password")
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className="login-container">
      <h2>Log In to Your Account</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Log In</button>
      </form>
    </div>
  );
}

export default LoginForm;