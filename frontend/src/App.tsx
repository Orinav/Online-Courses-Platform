import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CourseCard from './components/CourseCard';
import AddCourseForm from './components/AddCourseForm'; // 1. IMPORT THE NEW COMPONENT
import type { Course } from './types';
import './App.css';

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/courses/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) fetchCourses();
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar />

      <main className="main-content">

        <div className="admin-toggle-bar">
          <label>
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            Enable Admin Mode
          </label>
        </div>

        {/* 2. THE MAGIC LINE: Only show the form if isAdmin is true */}
        {isAdmin && <AddCourseForm onCourseAdded={fetchCourses} />}

        <h2 className="section-title">What to learn next</h2>

        <div className="courses-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isAdmin={isAdmin}
              onDelete={handleDeleteCourse}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;