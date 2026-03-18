import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import EditCourse from './pages/EditCourse';
import LoginForm from './components/LoginForm';
import AddCourseForm from './components/AddCourseForm';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUserStatus = async () => {
      if (!token) return;

      try {
        const response = await fetch('http://localhost:3000/api/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.role !== role) {
            alert("ההרשאות שלך עודכנו במערכת. אנא התחבר מחדש.");
            handleLogout();
          }
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
      }
    };

    verifyUserStatus();
  }, [token, role]);

  const handleLoginSuccess = (newToken: string, newRole: string) => {
    setToken(newToken);
    setRole(newRole);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    navigate('/');
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.clear();
    navigate('/');
  };

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="app-header" style={{ padding: '15px 30px', backgroundColor: '#1f2937', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>

        <div>
          {token ? (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', color: '#e5e7eb' }}>
                שלום, <span style={{ fontWeight: 'bold' }}>{role === 'ADMIN' ? 'מנהל' : 'אורח'}</span>
              </span>
              <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' }}>התנתק</button>
            </div>
          ) : (
            <Link to="/login" style={{ backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold' }}>התחברות / הרשמה</Link>
          )}
        </div>

        <div>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '900', fontSize: '28px', fontFamily: 'Arial, sans-serif', letterSpacing: '1px' }}>
            <span style={{ color: '#60a5fa' }}>Cours</span>ori
          </Link>
        </div>

      </header>

      <main style={{ flex: 1, padding: '20px', backgroundColor: '#f9fafb' }}>
        <Routes>
          <Route path="/" element={<Home token={token} role={role} />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/edit-course/:id" element={<EditCourse token={token} onCourseUpdated={() => navigate('/')} />} />
          <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/add-course" element={<AddCourseForm token={token} onCourseAdded={() => navigate('/')} />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;