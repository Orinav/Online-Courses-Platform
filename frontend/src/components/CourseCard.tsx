import { useNavigate } from 'react-router-dom';
import type { Course } from '../types';
import './CourseCard.css';

interface CourseCardProps {
  course: Course;
  isAdmin: boolean;
  onDelete: (id: number) => void;
}

function CourseCard({ course, isAdmin, onDelete }: CourseCardProps) {
  const lessonCount = course.lessons?.length || 0;
  const navigate = useNavigate();

  return (
    <div className="course-card">
      <div className="course-image-placeholder">
        <span>Course Image</span>
      </div>

      <div className="course-info">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>

        <div className="course-lessons-badge">
          📚 {lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}
        </div>

        <div className="course-footer">
          <span className="course-price">${course.price}</span>

          {/* הפיצול של הכפתורים - מנהל מול לקוח רגיל */}
          {isAdmin ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="view-course-btn"
                onClick={() => navigate(`/edit-course/${course.id}`)}
                style={{ backgroundColor: '#f7f9fa', color: '#1c1d1f', border: '1px solid #1c1d1f' }}
              >
                Edit
              </button>
              <button className="delete-btn" onClick={() => onDelete(course.id)}>
                Delete
              </button>
            </div>
          ) : (
            <button className="view-course-btn" onClick={() => navigate(`/course/${course.id}`)}>
              View Details
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

export default CourseCard;