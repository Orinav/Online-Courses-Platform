import React, { useState } from 'react';
import './AddCourseForm.css';

interface AddCourseFormProps { onCourseAdded: () => void; token: string | null; }

function AddCourseForm({ onCourseAdded, token }: AddCourseFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [instructor, setInstructor] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // הסטייט לתמונה
  const [lessons, setLessons] = useState([{ title: '', videoUrl: '', durationStr: '' }]);

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

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("אנא התחבר כמנהל.");

    const processedLessons = lessons.map(l => ({
      title: l.title, videoUrl: l.videoUrl, durationSeconds: parseTimeToSeconds(l.durationStr)
    }));

    try {
      const response = await fetch('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        // שליחת התמונה לשרת
        body: JSON.stringify({ title, description, price: parseFloat(price), instructor, imageUrl, lessons: processedLessons }),
      });
      if (response.ok) onCourseAdded();
      else alert("הוספת הקורס נכשלה.");
    } catch (error) {}
  };

  return (
    <div className="form-container">
      <h2>יצירת קורס חדש</h2>
      <form onSubmit={handleAddCourse}>
        <div className="input-group"><label>שם הקורס</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
        <div className="input-group"><label>שם המנחה / מרצה</label><input type="text" value={instructor} onChange={(e) => setInstructor(e.target.value)} required /></div>

        {/* השדה החדש לתמונה */}
        <div className="input-group">
          <label>קישור לתמונת הקורס (אופציונלי)</label>
          <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" dir="ltr" />
        </div>

        <div className="input-group"><label>תיאור הקורס</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3}/></div>
        <div className="input-group"><label>מחיר (₪)</label><input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required dir="ltr" /></div>

        <div className="lessons-section">
          <h3>שיעורי הקורס</h3>
          {lessons.map((lesson, index) => (
            <div key={index} className="lesson-input-group">
              <div className="lesson-header">
                <h4>שיעור {index + 1}</h4>
                {lessons.length > 1 && <button type="button" className="remove-lesson-btn" onClick={() => setLessons(lessons.filter((_, i) => i !== index))}>הסר שיעור</button>}
              </div>
              <div className="input-group"><label>כותרת השיעור</label><input type="text" value={lesson.title} onChange={(e) => handleLessonChange(index, 'title', e.target.value)} required /></div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="input-group" style={{ flex: 2 }}><label>קישור לוידאו</label><input type="url" value={lesson.videoUrl} onChange={(e) => handleLessonChange(index, 'videoUrl', e.target.value)} required dir="ltr" /></div>
                <div className="input-group" style={{ flex: 1 }}><label>אורך (MM:SS)</label><input type="text" placeholder="למשל 22:03" value={lesson.durationStr} onChange={(e) => handleLessonChange(index, 'durationStr', e.target.value)} required dir="ltr" /></div>
              </div>
            </div>
          ))}
          <button type="button" className="add-lesson-btn" onClick={() => setLessons([...lessons, { title: '', videoUrl: '', durationStr: '' }])}>+ הוסף שיעור</button>
        </div>
        <button type="submit" className="submit-btn" style={{ backgroundColor: '#2563eb' }}>צור קורס</button>
      </form>
    </div>
  );
}

export default AddCourseForm;