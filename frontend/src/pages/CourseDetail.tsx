import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Course, Lesson } from '../types';

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
        // משיכת פרטי הקורס (פתוח לכולם)
        const response = await fetch(`http://localhost:3000/api/courses/${id}`);
        if (!response.ok) { navigate('/'); return; }

        const data = await response.json();
        setCourse(data);
        if (data.lessons && data.lessons.length > 0) setCurrentLesson(data.lessons[0]);

        // אם המשתמש מחובר, נבדוק אם יש לו גישה לקורס ואת ההתקדמות שלו
        if (token) {
          const accessRes = await fetch(`http://localhost:3000/api/purchases/check/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (accessRes.ok) {
            const accessData = await accessRes.json();
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
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px' }}>טוען את הקורס...</div>;
  if (!course) return <div style={{ textAlign: 'center', marginTop: '50px' }}>הקורס לא נמצא</div>;

  const currentIndex = course.lessons?.findIndex(l => l.id === currentLesson?.id) ?? -1;
  const hasNext = currentIndex !== -1 && currentIndex < (course.lessons?.length || 0) - 1;
  const hasPrev = currentIndex > 0;
  const isCurrentCompleted = currentLesson?.id ? completedLessons.includes(currentLesson.id) : false;

  const handleNextLesson = () => { if (hasNext && course.lessons) setCurrentLesson(course.lessons[currentIndex + 1]); };
  const handlePrevLesson = () => { if (hasPrev && course.lessons) setCurrentLesson(course.lessons[currentIndex - 1]); };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>

      <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #e5e7eb' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '32px' }}>{course.title}</h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>{course.description}</p>
        <div style={{ marginTop: '10px', display: 'inline-block', backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
          מנחה: {course.instructor}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexDirection: 'row', flexWrap: 'wrap' }}>

        <div style={{ flex: '1 1 65%', minWidth: '300px' }}>
          {/* מנגנון ה-Paywall */}
          {!hasAccess ? (
            <div style={{
              backgroundColor: '#1f2937', borderRadius: '12px', aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', padding: '20px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>תוכן סגור לצפייה 🔒</h2>
              <p style={{ color: '#9ca3af', marginBottom: '25px', fontSize: '16px', maxWidth: '400px' }}>
                כדי לצפות בווידאו ולגשת לכל חומרי הקורס, יש לבצע רכישה.
              </p>

              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '25px', color: '#10b981' }}>
                ₪ {course.price}
              </div>

              <button
                onClick={handlePurchase}
                disabled={purchaseLoading}
                style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: purchaseLoading ? 'not-allowed' : 'pointer', transition: '0.2s', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)' }}
              >
                {purchaseLoading ? 'מעבד רכישה...' : 'רכוש עכשיו וקבל גישה'}
              </button>
            </div>
          ) : currentLesson ? (
            <div style={{ backgroundColor: 'black', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
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
            <div style={{ backgroundColor: '#f3f4f6', borderRadius: '12px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              אין שיעורים זמינים.
            </div>
          )}

          {hasAccess && currentLesson && (
            <div style={{ marginTop: '20px' }}>
              <h2 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '15px' }}>{currentIndex + 1}. {currentLesson.title}</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  onClick={handleNextLesson} disabled={!hasNext}
                  style={{ padding: '10px 20px', backgroundColor: hasNext ? '#3b82f6' : '#d1d5db', color: hasNext ? 'white' : '#9ca3af', border: 'none', borderRadius: '8px', cursor: hasNext ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
                >
                  השיעור הבא {hasNext && '←'}
                </button>
                <button
                  onClick={toggleCompletion}
                  style={{ padding: '10px 20px', backgroundColor: isCurrentCompleted ? '#ecfdf5' : '#ffffff', color: isCurrentCompleted ? '#10b981' : '#6b7280', border: isCurrentCompleted ? '2px solid #10b981' : '2px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {isCurrentCompleted ? '✓ הושלם' : 'סמן כהושלם'}
                </button>
                <button
                  onClick={handlePrevLesson} disabled={!hasPrev}
                  style={{ padding: '10px 20px', backgroundColor: hasPrev ? '#f3f4f6' : '#f9fafb', color: hasPrev ? '#4b5563' : '#d1d5db', border: '1px solid', borderColor: hasPrev ? '#d1d5db' : '#e5e7eb', borderRadius: '8px', cursor: hasPrev ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
                >
                  {hasPrev && '→'} קודם
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 30%', minWidth: '300px' }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1f2937', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px' }}>תוכן הקורס</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto', paddingLeft: '5px' }}>
              {course.lessons?.map((lesson, index) => {
                const isActive = currentLesson?.id === lesson.id;
                const isCompleted = lesson.id ? completedLessons.includes(lesson.id) : false;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      if (hasAccess) setCurrentLesson(lesson);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', transition: 'all 0.2s',
                      cursor: hasAccess ? 'pointer' : 'not-allowed',
                      backgroundColor: isActive && hasAccess ? '#eff6ff' : '#f9fafb',
                      border: isActive && hasAccess ? '1px solid #bfdbfe' : '1px solid #f3f4f6',
                      opacity: hasAccess ? 1 : 0.6 // הרשימה נראית קצת אפורה כשאין גישה
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ backgroundColor: isActive && hasAccess ? '#3b82f6' : '#1f2937', color: 'white', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>
                        {index + 1}
                      </span>
                      <span style={{ fontWeight: isActive && hasAccess ? 'bold' : 'normal', color: isActive && hasAccess ? '#1e3a8a' : '#4b5563', fontSize: '15px' }}>
                        {lesson.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>
                        {!hasAccess && '🔒 '}
                        {formatTime(lesson.durationSeconds || 0)}
                      </div>
                      {hasAccess && isCompleted && <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>✓</div>}
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