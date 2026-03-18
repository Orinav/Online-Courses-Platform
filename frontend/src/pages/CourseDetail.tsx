import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Course, Lesson } from '../types';
import './CourseDetail.css';

function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/courses/${id}`);
        if (!response.ok) { navigate('/'); return; }

        const data = await response.json();
        setCourse(data);
        if (data.lessons && data.lessons.length > 0) setCurrentLesson(data.lessons[0]);

        if (token) {
          const accessRes = await fetch(`http://localhost:3000/api/purchases/check/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          let accessData = null;
          if (accessRes.ok) {
            accessData = await accessRes.json();
            setHasAccess(accessData.hasAccess);
          }

          if (accessData?.hasAccess || role === 'ADMIN') {
             const progressRes = await fetch(`http://localhost:3000/api/progress/course/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (progressRes.ok) {
                const completedIds = await progressRes.json();
                setCompletedLessons(completedIds);
              }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, token, role]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleCompletion = async () => {
    if (!token || !currentLesson || !currentLesson.id) return;
    try {
      const response = await fetch(`http://localhost:3000/api/progress/lesson/${currentLesson.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.completed) {
          setCompletedLessons(prev => [...prev, currentLesson.id!]);
        } else {
          setCompletedLessons(prev => prev.filter(lessonId => lessonId !== currentLesson.id));
        }
      }
    } catch (error) { console.error("שגיאה בעדכון התקדמות"); }
  };

  const handlePurchase = async () => {
    if (!token) {
      alert("יש להתחבר למערכת כדי לבצע רכישה.");
      navigate('/login');
      return;
    }

    setPurchaseLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/purchases/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert("תודה על הרכישה! הקורס פתוח עבורך.");
        setHasAccess(true);
      } else {
        alert("שגיאה בתהליך הרכישה.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) return <div className="loading-text">טוען את הקורס...</div>;
  if (!course) return <div className="error-text">הקורס לא נמצא</div>;

  const currentIndex = course.lessons?.findIndex(l => l.id === currentLesson?.id) ?? -1;
  const hasNext = currentIndex !== -1 && currentIndex < (course.lessons?.length || 0) - 1;
  const hasPrev = currentIndex > 0;
  const isCurrentCompleted = currentLesson?.id ? completedLessons.includes(currentLesson.id) : false;

  const handleNextLesson = () => { if (hasNext && course.lessons) setCurrentLesson(course.lessons[currentIndex + 1]); };
  const handlePrevLesson = () => { if (hasPrev && course.lessons) setCurrentLesson(course.lessons[currentIndex - 1]); };

  return (
    <div className="course-detail-container">

      <div className="course-header">
        <h1 className="course-title">{course.title}</h1>
        <p className="course-description">{course.description}</p>
        <div className="course-instructor">מנחה: {course.instructor}</div>
      </div>

      <div className="course-layout">

        <div className="video-section">
          {!hasAccess ? (
            <div className="paywall-box">
              <h2 className="paywall-title">תוכן סגור לצפייה 🔒</h2>
              <p className="paywall-desc">כדי לצפות בווידאו ולגשת לכל חומרי הקורס, יש לבצע רכישה.</p>

              <div className="paywall-price">
                {course.price} ₪
              </div>

              <button
                onClick={handlePurchase}
                disabled={purchaseLoading}
                className="purchase-btn"
              >
                {purchaseLoading ? 'מעבד רכישה...' : 'רכוש עכשיו וקבל גישה'}
              </button>
            </div>
          ) : currentLesson ? (
            <div className="video-container">
              {currentLesson.videoUrl.includes('youtube.com') || currentLesson.videoUrl.includes('youtu.be') ? (
                <iframe
                  width="100%" height="100%"
                  src={currentLesson.videoUrl.replace('watch?v=', 'embed/').split('&')[0]}
                  title={currentLesson.title} frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                ></iframe>
              ) : (
                <video width="100%" height="100%" controls src={currentLesson.videoUrl}>
                  הדפדפן שלך אינו תומך בניגון וידאו.
                </video>
              )}
            </div>
          ) : (
            <div className="no-lessons-box">אין שיעורים זמינים.</div>
          )}

          {hasAccess && currentLesson && (
            <div className="lesson-info-section">
              <h2 className="lesson-main-title">{currentIndex + 1}. {currentLesson.title}</h2>
              <div className="lesson-controls">
                <button onClick={handleNextLesson} disabled={!hasNext} className="nav-btn next">
                  השיעור הבא {hasNext && '←'}
                </button>
                <button
                  onClick={toggleCompletion}
                  className={`complete-btn ${isCurrentCompleted ? 'completed' : 'not-completed'}`}
                >
                  {isCurrentCompleted ? '✓ הושלם' : 'סמן כהושלם'}
                </button>
                <button onClick={handlePrevLesson} disabled={!hasPrev} className="nav-btn prev">
                  {hasPrev && '→'} קודם
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <div className="lessons-card">
            <h3 className="sidebar-title">תוכן הקורס</h3>
            <div className="lessons-list">
              {course.lessons?.map((lesson, index) => {
                const isActive = currentLesson?.id === lesson.id;
                const isCompleted = lesson.id ? completedLessons.includes(lesson.id) : false;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => { if (hasAccess) setCurrentLesson(lesson); }}
                    className={`lesson-item ${hasAccess ? 'has-access' : 'no-access'} ${isActive && hasAccess ? 'active' : 'inactive'}`}
                  >
                    <div className="lesson-item-left">
                      <span className={`lesson-number ${isActive && hasAccess ? 'active' : 'inactive'}`}>
                        {index + 1}
                      </span>
                      <span className={`lesson-title ${isActive && hasAccess ? 'active' : 'inactive'}`}>
                        {lesson.title}
                      </span>
                    </div>
                    <div className="lesson-item-right">
                      <div className="lesson-duration">
                        {!hasAccess && '🔒 '}
                        {formatTime(lesson.durationSeconds || 0)}
                      </div>
                      {hasAccess && isCompleted && <div className="completed-check">✓</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CourseDetail;