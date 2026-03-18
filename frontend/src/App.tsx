import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import EditCourse from './pages/EditCourse';
import LoginForm from './components/LoginForm';
import AddCourseForm from './components/AddCourseForm';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const navigate = useNavigate();

  const handleLoginSuccess = (newToken: string, newRole: string) => {
    setToken(newToken); setRole(newRole);
    localStorage.setItem('token', newToken); localStorage.setItem('role', newRole);
    navigate('/');
  };

  const handleLogout = () => {
    setToken(null); setRole(null); localStorage.clear(); navigate('/');
  };

  return (
    <div dir="rtl">
      <header className="app-header" style={{ padding: '15px 30px', backgroundColor: '#1f2937', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '24px' }}>מערכת קורסים</Link>
        <div>
          {token ? (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>שלום, {role === 'ADMIN' ? 'מנהל' : 'לקוח'}</span>
              <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>התנתק</button>
            </div>
          ) : (
            <Link to="/login" style={{ backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold' }}>התחברות / הרשמה</Link>
          )}
        </div>
      </header>
      <main style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 70px)' }}>
        <Routes>
          <Route path="/" element={<Home token={token} role={role} />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/edit-course/:id" element={<EditCourse token={token} onCourseUpdated={() => navigate('/')} />} />
          <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/add-course" element={<AddCourseForm token={token} onCourseAdded={() => navigate('/')} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;