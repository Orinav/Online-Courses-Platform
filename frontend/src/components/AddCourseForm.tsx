import { useState } from 'react';
import './AddCourseForm.css';

interface AddCourseFormProps {
  token: string | null;
  onCourseAdded: () => void;
}

interface FormLesson {
  title: string;
  videoUrl: string;
  durationString: string;
}

function AddCourseForm({ token, onCourseAdded }: AddCourseFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [instructor, setInstructor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [lessons, setLessons] = useState<FormLesson[]>([]);

  const parseTimeToSeconds = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parts[0] || 0;
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert('נא להתחבר');

    const formattedLessons = lessons.map(l => ({
      title: l.title,
      videoUrl: l.videoUrl,
      durationSeconds: parseTimeToSeconds(l.durationString)
    }));

    try {
      const response = await fetch('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, price, instructor, imageUrl, lessons: formattedLessons })
      });
      if (response.ok) {
        alert('הקורס נוסף בהצלחה!');
        onCourseAdded();
      } else {
        alert('שגיאה ביצירת הקורס');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLessonChange = (index: number, field: keyof FormLesson, value: string) => {
    const newLessons = [...lessons];
    newLessons[index][field] = value;
    setLessons(newLessons);
  };

  const addLesson = () => {
    setLessons([...lessons, { title: '', videoUrl: '', durationString: '' }]);
  };

  const removeLesson = (index: number) => {
    const newLessons = [...lessons];
    newLessons.splice(index, 1);
    setLessons(newLessons);
  };

  return (
    <div className="add-course-container">
      <h2 className="add-course-title">הוספת קורס חדש</h2>

      <form onSubmit={handleAddCourse}>
        <div className="form-group">
          <label className="form-label">שם הקורס</label>
          <input className="form-input" type="text" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">תיאור הקורס</label>
          <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>

        <div className="lesson-inputs-row">
          <div className="form-group">
            <label className="form-label">מחיר (₪)</label>
            <input className="form-input" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required />
          </div>
          <div className="form-group">
            <label className="form-label">שם המנחה</label>
            <input className="form-input" type="text" value={instructor} onChange={e => setInstructor(e.target.value)} placeholder="לדוגמה: אורי" />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '20px' }}>
          <label className="form-label">קישור לתמונה מקדימה</label>
          <input className="form-input" type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="URL לתמונה מיוטיוב או מהרשת" />
        </div>

        <div className="lessons-section">
          <h3 className="lessons-title">רשימת שיעורים</h3>

          {lessons.map((lesson, index) => (
            <div key={index} className="lesson-card">
              <div className="lesson-card-header">
                <h4 className="lesson-card-title">שיעור {index + 1}</h4>
                <button type="button" onClick={() => removeLesson(index)} className="btn-remove-lesson">
                  הסר שיעור
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">כותרת השיעור</label>
                <input className="form-input" type="text" value={lesson.title} onChange={e => handleLessonChange(index, 'title', e.target.value)} required />
              </div>

              <div className="lesson-inputs-row">
                <div className="form-group">
                  <label className="form-label">קישור לווידאו</label>
                  <input className="form-input" type="text" value={lesson.videoUrl} onChange={e => handleLessonChange(index, 'videoUrl', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">אורך</label>
                  <input className="form-input" type="text" placeholder="1:02:47 או 22:03" value={lesson.durationString} onChange={e => handleLessonChange(index, 'durationString', e.target.value)} required />
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addLesson} className="btn-add-lesson">
            + הוסף שיעור
          </button>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCourseAdded} className="btn-cancel">
            ביטול
          </button>
          <button type="submit" className="btn-save">
            שמור קורס
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCourseForm;