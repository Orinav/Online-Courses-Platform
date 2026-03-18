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
    <div dir="rtl" className="app-wrapper">
      <header className="app-header">

        {/* העטיפה החדשה ששומרת את התפריט במרכז (מיושר עם הקורסים) */}
        <div className="header-content">

          <div className="header-right">
            {token ? (
              <>
                <span className="header-greeting">
                  שלום, <strong>{role === 'ADMIN' ? 'מנהל' : 'אורח'}</strong>
                </span>
                <button onClick={handleLogout} className="logout-btn">התנתק</button>
              </>
            ) : (
              <Link to="/login" className="login-btn">התחברות / הרשמה</Link>
            )}
          </div>

          <div className="header-left">
            <Link to="/" className="logo-link">
              <span className="logo-blue">Cours</span>ori
            </Link>
          </div>

        </div>

      </header>

      <main className="main-content">
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