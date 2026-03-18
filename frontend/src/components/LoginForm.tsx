import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './LoginForm.css';

interface LoginFormProps {
  onLoginSuccess: (token: string, role: string) => void;
}

function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.error === "Invalid credentials.") setError('פרטי ההתחברות שגויים.');
        else if (data.error === "Email in use.") setError('כתובת המייל הזו כבר בשימוש.');
        else setError(data.error || 'אירעה שגיאה. אנא נסה שוב.');
        return;
      }

      if (isLogin) {
        onLoginSuccess(data.token, data.user.role);
      } else {
        setIsLogin(true);
        setError('הרשמה בוצעה בהצלחה! אנא התחבר כעת.');
        setPassword('');
      }
    } catch (err) {
      setError('שגיאת תקשורת עם השרת. אנא בדוק את החיבור.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();
      if (response.ok) {
        onLoginSuccess(data.token, data.user.role);
      } else {
        setError('שגיאה בהתחברות מול השרת.');
      }
    } catch (err) {
      setError('שגיאת תקשורת עם השרת בתהליך גוגל.');
    }
  };

  return (
    <div className="login-container">
      <h2>{isLogin ? 'התחברות למערכת' : 'הרשמה למערכת'}</h2>

      {error && (
        <div className="error-message" style={{ backgroundColor: error.includes('בהצלחה') ? '#d4edda' : '#fdecea', color: error.includes('בהצלחה') ? '#155724' : '#e74c3c' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }} dir="ltr">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('התחברות גוגל נכשלה.')}
          useOneTap
        />
      </div>

      <div style={{ textAlign: 'center', margin: '15px 0', color: '#6b7280', fontSize: '14px' }}>
        <span>או עם אימייל וסיסמה</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>דואר אלקטרוני</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" placeholder="name@example.com" />
        </div>

        <div className="input-group">
          <label>סיסמה</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
        </div>

        <button type="submit" className="submit-btn" style={{ backgroundColor: '#2563eb', color: 'white', width: '100%', padding: '12px', marginTop: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
          {isLogin ? 'התחבר' : 'הירשם'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button className="toggle-mode-btn" onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>
          {isLogin ? 'אין לך חשבון? לחץ כאן להרשמה' : 'יש לך כבר חשבון? לחץ כאן להתחברות'}
        </button>
      </div>
    </div>
  );
}

export default LoginForm;