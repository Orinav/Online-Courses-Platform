import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditCourse.css';

interface EditCourseProps {
  token: string | null;
  onCourseUpdated: () => void;
}

interface FormLesson {
  id?: number;
  title: string;
  videoUrl: string;
  durationString: string;
}

function EditCourse({ token, onCourseUpdated }: EditCourseProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [instructor, setInstructor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [lessons, setLessons] = useState<FormLesson[]>([]);
  const [loading, setLoading] = useState(true);

  const formatSecondsToTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/courses/${id}`);
        if (response.ok) {
          const course = await response.json();
          setTitle(course.title);
          setDescription(course.description);
          setPrice(course.price);
          setInstructor(course.instructor || '');
          setImageUrl(course.imageUrl || '');

          const formattedLessons = course.lessons.map((l: any) => ({
            id: l.id,
            title: l.title,
            videoUrl: l.videoUrl,
            durationString: formatSecondsToTime(l.durationSeconds || 0)
          }));
          setLessons(formattedLessons);
        } else {
          alert('הקורס לא נמצא');
          navigate('/');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert('נא להתחבר');

    const formattedLessons = lessons.map(l => ({
      title: l.title,
      videoUrl: l.videoUrl,
      durationSeconds: parseTimeToSeconds(l.durationString)
    }));

    try {
      const response = await fetch(`http://localhost:3000/api/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, price, instructor, imageUrl, lessons: formattedLessons })
      });
      if (response.ok) {
        alert('הקורס עודכן בהצלחה!');
        onCourseUpdated();
      } else {
        alert('שגיאה בעדכון הקורס');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLessonChange = (index: number, field: keyof FormLesson, value: string) => {
    const newLessons = [...lessons];
    newLessons[index][field] = value as never;
    setLessons(newLessons);
  };

  const addLesson = () => {
    setLessons([...lessons, { title: '', videoUrl: '', durationString: '00:00' }]);
  };

  const removeLesson = (index: number) => {
    const newLessons = [...lessons];
    newLessons.splice(index, 1);
    setLessons(newLessons);
  };

  if (loading) return <div className="loading-text">טוען נתונים...</div>;

  return (
    <div className="edit-course-container">
      <h2 className="edit-course-title">עריכת קורס</h2>

      <form onSubmit={handleUpdate}>
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
          <button type="button" onClick={() => navigate('/')} className="btn-cancel">
            ביטול
          </button>
          <button type="submit" className="btn-save">
            שמור שינויים
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditCourse;