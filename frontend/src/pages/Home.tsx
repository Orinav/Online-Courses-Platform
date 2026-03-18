import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import type { Course } from '../types';

interface HomeProps { token: string | null; role: string | null; }

function Home({ token, role }: HomeProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/courses');
      const data = await response.json();
      if (Array.isArray(data)) setCourses(data);
      else setCourses([]);
    } catch (error) { setCourses([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!window.confirm("האם אתה בטוח שברצונך למחוק קורס זה?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchCourses();
      else alert("שגיאה במחיקת הקורס");
    } catch (error) {}
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>טוען קורסים...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* כאן הכנסתי את העיצוב החדש והנוח לכותרת ולכפתור */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '28px', color: '#1f2937' }}>הקורסים שלנו</h2>
        {role === 'ADMIN' && (
          <button
            onClick={() => navigate('/add-course')}
            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
          >
            + הוסף קורס חדש
          </button>
        )}
      </div>

      {!courses || courses.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px', fontSize: '18px' }}>אין קורסים זמינים כרגע במערכת.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {courses.map(course => (
            <CourseCard key={course.id} course={course} isAdmin={role === 'ADMIN'} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;