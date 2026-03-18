import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../types';
import './Home.css';

interface HomeProps {
  token: string | null;
  role: string | null;
}

function Home({ token, role }: HomeProps) {
  const [courses, setCourses] = useState<Course[]>([]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק קורס זה?')) return;
    try {
      await fetch(`http://localhost:3000/api/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  // פונקציה חכמה שמציגה גם שעות במידת הצורך
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="home-container">

      {/* אזור הכותרת עם כפתור ההוספה למנהלים */}
      <div className="home-header">
        <h1 className="home-title">הקורסים שלנו</h1>
        {role === 'ADMIN' && (
          <Link to="/add-course" className="btn-add-course-main">+ הוסף קורס חדש</Link>
        )}
      </div>

      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">

            {course.imageUrl ? (
              <img src={course.imageUrl} alt={course.title} className="course-image" />
            ) : (
              <div className="course-image-placeholder">אין תמונה</div>
            )}

            <div className="course-content">
              <h2 className="course-card-title">{course.title}</h2>
              <div className="course-instructor">מנחה: {course.instructor}</div>
              <p className="course-desc">{course.description}</p>

              <div className="course-stats">
                <span className="stat-item">📚 {course.lessons?.length || 0} שיעורים</span>
                <span className="stat-item">
                  ⏱ {formatTime(course.lessons?.reduce((acc, l) => acc + (l.durationSeconds || 0), 0) || 0)}
                </span>
              </div>

              <div className="course-price-container">
                <div className="course-price">
                  <span>₪</span> {course.price}
                </div>
              </div>

              <div className="course-actions">
                <Link to={`/course/${course.id}`} className="btn-action btn-primary">צפה בקורס</Link>
                {role === 'ADMIN' && (
                  <>
                    <Link to={`/edit-course/${course.id}`} className="btn-action btn-edit">ערוך</Link>
                    <button onClick={() => handleDelete(course.id!)} className="btn-action btn-delete">מחק</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;