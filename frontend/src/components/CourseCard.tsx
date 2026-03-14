import type { Course } from '../types';
import './CourseCard.css';

// 1. We added 'isAdmin' and 'onDelete' to the props blueprint
interface CourseCardProps {
  course: Course;
  isAdmin: boolean;
  onDelete: (id: number) => void;
}

function CourseCard({ course, isAdmin, onDelete }: CourseCardProps)
{
  return (
    <div className="course-card">
      <div className="course-image-placeholder">
        <span>Course Image</span>
      </div>

      <div className="course-info">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>

        <div className="course-footer">
          <span className="course-price">${course.price}</span>

          {/* 2. CONDITIONAL RENDERING:
                 If isAdmin is true, show the Delete button.
                 If false, show the View Details (Customer) button. */}
          {isAdmin ? (
            <button
              className="delete-btn"
              onClick={() => onDelete(course.id)}
            >
              Delete Course
            </button>
          ) : (
            <button className="view-course-btn">View Details</button>
          )}

        </div>
      </div>
    </div>
  );
}

export default CourseCard;