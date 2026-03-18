import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../components/AddCourseForm.css';

interface EditCourseProps { token: string | null; onCourseUpdated: () => void; }

function EditCourse({ token, onCourseUpdated }: EditCourseProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [instructor, setInstructor] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // סטייט התמונה
  const [lessons, setLessons] = useState<{title: string, videoUrl: string, durationStr: string}[]>([]);
  const [loading, setLoading] = useState(true);

  const formatSecondsToTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/courses/${id}`);
        if (response.ok) {
          const data = await response.json();
          setTitle(data.title); setDescription(data.description); setPrice(data.price.toString()); setInstructor(data.instructor || '');
          setImageUrl(data.imageUrl || ''); // טעינת התמונה מהשרת
          setLessons(data.lessons?.map((lesson: any) => ({
            title: lesson.title, videoUrl: lesson.videoUrl, durationStr: formatSecondsToTime(lesson.durationSeconds || 0)
          })) || []);
        } else navigate('/');
      } catch (error) {} finally { setLoading(false); }
    };
    fetchCourse();
  }, [id, navigate]);

  const handleLessonChange = (index: number, field: string, value: string) => {
    const updatedLessons = [...lessons];
    updatedLessons[index] = { ...updatedLessons[index], [field]: value };
    setLessons(updatedLessons);
  };

  const parseTimeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    if (!timeStr.includes(':')) return parseInt(timeStr) * 60;
    const [mins, secs] = timeStr.split(':');
    return (parseInt(mins) || 0) * 60 + (parseInt(secs) || 0);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const processedLessons = lessons.map(l => ({
      title: l.title, videoUrl: l.videoUrl, durationSeconds: parseTimeToSeconds(l.durationStr)
    }));

    try {
      const response = await fetch(`http://localhost:3000/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, description, price: parseFloat(price), instructor, imageUrl, lessons: processedLessons }),
      });
      if (response.ok) { onCourseUpdated(); navigate('/'); }
      else alert("עדכון הקורס נכשל.");
    } catch (error) {}
  };

  if (loading) return <div>טוען...</div>;

  return (
    <div className="form-container" style={{ marginTop: '40px' }}>
      <h2>עריכת קורס: {title}</h2>
      <form onSubmit={handleUpdateCourse}>
        <div className="input-group"><label>שם הקורס</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
        <div className="input-group"><label>שם המנחה</label><input type="text" value={instructor} onChange={(e) => setInstructor(e.target.value)} required /></div>

        {/* שדה עריכת התמונה */}
        <div className="input-group">
          <label>קישור לתמונת הקורס (אופציונלי)</label>
          <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} dir="ltr" />
        </div>

        <div className="input-group"><label>תיאור</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} /></div>
        <div className="input-group"><label>מחיר</label><input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required dir="ltr" /></div>

        <div className="lessons-section">
          <h3>שיעורי הקורס</h3>
          {lessons.map((lesson, index) => (
            <div key={index} className="lesson-input-group">
              <div className="lesson-header">
                <h4>שיעור {index + 1}</h4>
                <button type="button" className="remove-lesson-btn" onClick={() => setLessons(lessons.filter((_, i) => i !== index))}>הסר</button>
              </div>
              <div className="input-group"><label>כותרת השיעור</label><input type="text" value={lesson.title} onChange={(e) => handleLessonChange(index, 'title', e.target.value)} required /></div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="input-group" style={{ flex: 2 }}><label>קישור</label><input type="url" value={lesson.videoUrl} onChange={(e) => handleLessonChange(index, 'videoUrl', e.target.value)} required dir="ltr" /></div>
                <div className="input-group" style={{ flex: 1 }}><label>אורך (MM:SS)</label><input type="text" value={lesson.durationStr} onChange={(e) => handleLessonChange(index, 'durationStr', e.target.value)} required dir="ltr" /></div>
              </div>
            </div>
          ))}
          <button type="button" className="add-lesson-btn" onClick={() => setLessons([...lessons, { title: '', videoUrl: '', durationStr: '' }])}>+ הוסף שיעור</button>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="submit" className="submit-btn" style={{ backgroundColor: '#10b981', flex: 1 }}>שמור</button>
          <button type="button" className="submit-btn" style={{ backgroundColor: '#6b7280', flex: 1 }} onClick={() => navigate('/')}>ביטול</button>
        </div>
      </form>
    </div>
  );
}

export default EditCourse;