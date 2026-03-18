import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './LoginForm.css';

interface LoginFormProps {
  onLoginSuccess: (token: string, role: string) => void;
}

function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/login' : '/api/register';
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (isLogin) {
          onLoginSuccess(data.token, data.user.role);
        } else {
          alert('הרשמה בוצעה בהצלחה! כעת תוכל/י להתחבר.');
          setIsLogin(true);
        }
      } else {
        alert(data.error || 'שגיאה בתהליך');
      }
    } catch (error) {
      console.error(error);
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
        alert(data.error || 'ההתחברות דרך גוגל נכשלה');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <GoogleOAuthProvider clientId="7179166992-viq91j16b2gaqedhumstdq7039bu2fkb.apps.googleusercontent.com">
      <div className="auth-container">

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : 'inactive'}`}
            onClick={() => setIsLogin(true)}
          >
            התחברות
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : 'inactive'}`}
            onClick={() => setIsLogin(false)}
          >
            הרשמה
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          <button type="submit" className="auth-submit-btn">
            {isLogin ? 'היכנס' : 'הרשם'}
          </button>
        </form>

        <div className="auth-divider">או</div>

        {/* התיקון כאן: הוספנו dir="ltr" כדי להכריח את הרכיב של גוגל להסתדר משמאל לימין */}
        <div className="google-btn-wrapper" dir="ltr">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Google Login Failed')}
            theme="filled_blue"
            text={isLogin ? "signin_with" : "signup_with"}
          />
        </div>

      </div>
    </GoogleOAuthProvider>
  );
}

export default LoginForm;