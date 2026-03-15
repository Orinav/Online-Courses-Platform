import { useState } from 'react';
import './AddCourseForm.css';

interface AddCourseFormProps {
  onCourseAdded: () => void;
  token: string;
}

function AddCourseForm({ onCourseAdded, token }: AddCourseFormProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // State חדש: מערך של שיעורים. מתחילים עם שיעור אחד ריק כברירת מחדל
  const [lessons, setLessons] = useState([{ title: '', videoUrl: '' }]);

  // פונקציה לעדכון שדה ספציפי בתוך שיעור ספציפי
  const handleLessonChange = (index: number, field: 'title' | 'videoUrl', value: string) => {
    const updatedLessons = [...lessons];
    updatedLessons[index][field] = value;
    setLessons(updatedLessons);
  };

  // הוספת שיעור חדש וריק למערך
  const addLessonField = () => {
    setLessons([...lessons, { title: '', videoUrl: '' }]);
  };

  // מחיקת שיעור מהמערך
  const removeLessonField = (index: number) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    setLessons(updatedLessons);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    const courseData = {
      title: newTitle,
      description: newDescription,
      price: parseFloat(newPrice),
      lessons: lessons // שולחים את כל מערך השיעורים לשרת!
    };

    try {
      const response = await fetch('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        // איפוס הטופס
        setNewTitle('');
        setNewDescription('');
        setNewPrice('');
        setLessons([{ title: '', videoUrl: '' }]);
        onCourseAdded();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Failed to connect to the server:", error);
    }
  };

  return (
    <div className="form-container">
      <h2>Add a New Course</h2>
      <form onSubmit={handleAddCourse}>
        <div className="input-group">
          <label>Course Title</label>
          <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} required />
        </div>

        <div className="input-group">
          <label>Price ($)</label>
          <input type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} required />
        </div>

        {/* --- אזור השיעורים הדינמי --- */}
        <div className="lessons-section">
          <h3>Course Lessons</h3>
          {lessons.map((lesson, index) => (
            <div key={index} className="lesson-input-group">
              <div className="lesson-header">
                <h4>Lesson {index + 1}</h4>
                {lessons.length > 1 && (
                  <button type="button" className="remove-lesson-btn" onClick={() => removeLessonField(index)}>
                    Remove
                  </button>
                )}
              </div>

              <div className="input-group">
                <label>Lesson Title (e.g., Intro to Functions)</label>
                <input
                  type="text"
                  value={lesson.title}
                  onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Video URL</label>
                <input
                  type="url"
                  value={lesson.videoUrl}
                  onChange={(e) => handleLessonChange(index, 'videoUrl', e.target.value)}
                  required
                />
              </div>
            </div>
          ))}

          <button type="button" className="add-lesson-btn" onClick={addLessonField}>
            + Add Another Lesson
          </button>
        </div>
        {/* --------------------------- */}

        <button type="submit" className="submit-btn">Publish Course</button>
      </form>
    </div>
  );
}

export default AddCourseForm;