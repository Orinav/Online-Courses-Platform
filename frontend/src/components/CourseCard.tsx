import { useNavigate } from 'react-router-dom';
import type { Course } from '../types';
import './CourseCard.css';

interface CourseCardProps { course: Course; isAdmin: boolean; onDelete: (id: number) => void; }

function CourseCard({ course, isAdmin, onDelete }: CourseCardProps) {
  const lessonCount = course.lessons?.length || 0;
  const navigate = useNavigate();

  const totalSeconds = course.lessons?.reduce((sum, lesson) => sum + (lesson.durationSeconds || 0), 0) || 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let timeDisplay = "";
  if (hours > 0) timeDisplay += `${hours} שעות, `;
  if (minutes > 0 || hours > 0) timeDisplay += `${minutes} דקות `;
  if (seconds > 0) timeDisplay += `ו-${seconds} שניות`;
  if (totalSeconds === 0) timeDisplay = "0 דקות";

  return (
    <div className="course-card">
      {course.imageUrl ? (
        <img
          src={course.imageUrl}
          alt={course.title}
          style={{ width: '100%', height: '180px', objectFit: 'cover', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
        />
      ) : (
        <div className="course-image-placeholder">
          <span>תמונת קורס</span>
        </div>
      )}

      <div className="course-info">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-instructor" style={{ color: '#2563eb', fontSize: '0.9rem', margin: '-5px 0 10px 0', fontWeight: 'bold' }}>מנחה: {course.instructor || "לא צוין"}</p>
        <p className="course-description">{course.description}</p>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div className="course-lessons-badge" style={{ margin: 0 }}>📚 {lessonCount} {lessonCount === 1 ? 'שיעור' : 'שיעורים'}</div>
          <div className="course-lessons-badge" style={{ margin: 0 }}>⏱️ {timeDisplay}</div>
        </div>

        <div className="course-footer">
          <div className="course-actions">
            <button className="btn-view" onClick={() => navigate(`/course/${course.id}`)}>צפה</button>
            {isAdmin && (
              <>
                <button className="btn-edit" onClick={() => navigate(`/edit-course/${course.id}`)}>ערוך</button>
                <button className="btn-delete" onClick={() => onDelete(course.id)}>מחק</button>
              </>
            )}
          </div>
          <div className="course-price-container">
            {/* כאן התבצע השינוי: הש"ח מופיע עכשיו משמאל למחיר */}
            <span className="course-price" dir="ltr">₪ {course.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;