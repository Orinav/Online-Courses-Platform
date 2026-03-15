import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CourseCard from '../components/CourseCard';
import AddCourseForm from '../components/AddCourseForm';
import LoginForm from '../components/LoginForm';
import type { Course } from '../types';

function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole'));

  const isAdmin = userRole === 'ADMIN';

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleLoginSuccess = (newToken: string, role: string) => {
    setToken(newToken);
    setUserRole(role);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setToken(null);
    setUserRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  };

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm("Delete course?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchCourses();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        {!token && <LoginForm onLoginSuccess={handleLoginSuccess} />}
        {token && (
          <div className="admin-toggle-bar" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Logged in as: <strong>{userRole}</strong></span>
            <button onClick={handleLogout}>Log Out</button>
          </div>
        )}
        {isAdmin && token && <AddCourseForm onCourseAdded={fetchCourses} token={token} />}
        <h2 className="section-title">Available Courses</h2>
        <div className="courses-grid">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} isAdmin={isAdmin} onDelete={handleDeleteCourse} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default Home;