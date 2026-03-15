import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import type { Lesson } from '../types';
import '../components/AddCourseForm.css'; // משתמשים באותו העיצוב בדיוק!

function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // 1. ברגע שהעמוד עולה, מושכים את פרטי הקורס כדי למלא את הטופס
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/courses/${id}`);
        if (!response.ok) throw new Error("Course not found");
        const data = await response.json();

        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price.toString());
        setLessons(data.lessons.length > 0 ? data.lessons : [{ title: '', videoUrl: '' }]);
      } catch (error) {
        console.error("Failed to load course", error);
      }
    };
    fetchCourse();
  }, [id]);

  // פונקציות לניהול מערך הסרטונים הדינמי (בדיוק כמו בהוספה)
  const handleLessonChange = (index: number, field: 'title' | 'videoUrl', value: string) => {
    const updatedLessons = [...lessons];
    updatedLessons[index][field] = value;
    setLessons(updatedLessons);
  };

  const addLessonField = () => setLessons([...lessons, { title: '', videoUrl: '' }]);
  const removeLessonField = (index: number) => setLessons(lessons.filter((_, i) => i !== index));

  // 2. שמירת השינויים ושליחתם לשרת
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${id}`, {
        method: 'PUT', // שים לב שאנחנו משתמשים ב-PUT לעדכון
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, price: parseFloat(price), lessons }),
      });

      if (response.ok) {
        navigate('/'); // אם הצליח, חוזרים למסך הבית
      } else {
        alert("Failed to update course.");
      }
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  if (!token) return <div style={{padding: 50, textAlign: 'center'}}>Access Denied. Admins only.</div>;

  return (
    <div className="app-wrapper">
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <button className="back-btn" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>&larr; Cancel Edit</button>

        <div className="form-container" style={{ margin: 0 }}>
          <h2>Edit Course</h2>
          <form onSubmit={handleUpdateCourse}>
            <div className="input-group">
              <label>Course Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="input-group">
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="input-group">
              <label>Price ($)</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>

            <div className="lessons-section">
              <h3>Course Lessons</h3>
              {lessons.map((lesson, index) => (
                <div key={index} className="lesson-input-group">
                  <div className="lesson-header">
                    <h4>Lesson {index + 1}</h4>
                    {lessons.length > 1 && (
                      <button type="button" className="remove-lesson-btn" onClick={() => removeLessonField(index)}>Remove</button>
                    )}
                  </div>
                  <div className="input-group">
                    <label>Lesson Title</label>
                    <input type="text" value={lesson.title} onChange={(e) => handleLessonChange(index, 'title', e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Video URL</label>
                    <input type="url" value={lesson.videoUrl} onChange={(e) => handleLessonChange(index, 'videoUrl', e.target.value)} required />
                  </div>
                </div>
              ))}
              <button type="button" className="add-lesson-btn" onClick={addLessonField}>+ Add Another Lesson</button>
            </div>

            <button type="submit" className="submit-btn" style={{ backgroundColor: '#2563eb' }}>Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditCourse;