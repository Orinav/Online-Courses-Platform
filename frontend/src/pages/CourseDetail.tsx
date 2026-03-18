import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Course, Lesson } from '../types';

function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/courses/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
          if (data.lessons && data.lessons.length > 0) {
            setCurrentLesson(data.lessons[0]);
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, navigate]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px' }}>טוען את הקורס...</div>;
  if (!course) return <div style={{ textAlign: 'center', marginTop: '50px' }}>הקורס לא נמצא</div>;

  // --- לוגיקה למציאת השיעור הבא והקודם ---
  const currentIndex = course.lessons?.findIndex(l => l.id === currentLesson?.id) ?? -1;
  const hasNext = currentIndex !== -1 && currentIndex < (course.lessons?.length || 0) - 1;
  const hasPrev = currentIndex > 0;

  const handleNextLesson = () => {
    if (hasNext && course.lessons) setCurrentLesson(course.lessons[currentIndex + 1]);
  };

  const handlePrevLesson = () => {
    if (hasPrev && course.lessons) setCurrentLesson(course.lessons[currentIndex - 1]);
  };

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

        {/* אזור הווידאו */}
        <div style={{ flex: '1 1 65%', minWidth: '300px' }}>
          {currentLesson ? (
            <div style={{ backgroundColor: 'black', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              {currentLesson.videoUrl.includes('youtube.com') || currentLesson.videoUrl.includes('youtu.be') ? (
                <iframe
                  width="100%" height="100%"
                  src={currentLesson.videoUrl.replace('watch?v=', 'embed/').split('&')[0]}
                  title={currentLesson.title} frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video width="100%" height="100%" controls src={currentLesson.videoUrl}>
                  הדפדפן שלך אינו תומך בניגון וידאו.
                </video>
              )}
            </div>
          ) : (
            <div style={{ backgroundColor: '#f3f4f6', borderRadius: '12px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              אין שיעורים זמינים בקורס זה עדיין.
            </div>
          )}

          {currentLesson && (
            <div style={{ marginTop: '20px' }}>
              <h2 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '15px' }}>{currentIndex + 1}. {currentLesson.title}</h2>

              {/* --- אזור כפתורי הניווט (הבא/הקודם) --- */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>

                <button
                  onClick={handleNextLesson}
                  disabled={!hasNext}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: hasNext ? '#3b82f6' : '#d1d5db',
                    color: hasNext ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: hasNext ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  השיעור הבא {hasNext && '←'}
                </button>

                <button
                  onClick={handlePrevLesson}
                  disabled={!hasPrev}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: hasPrev ? '#f3f4f6' : '#f9fafb',
                    color: hasPrev ? '#4b5563' : '#d1d5db',
                    border: '1px solid',
                    borderColor: hasPrev ? '#d1d5db' : '#e5e7eb',
                    borderRadius: '8px',
                    cursor: hasPrev ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {hasPrev && '→'} השיעור הקודם
                </button>

              </div>
            </div>
          )}
        </div>

        {/* אזור רשימת השיעורים */}
        <div style={{ flex: '1 1 30%', minWidth: '300px' }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1f2937', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px' }}>
              תוכן הקורס
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto', paddingLeft: '5px' }}>
              {course.lessons?.map((lesson, index) => {
                const isActive = currentLesson?.id === lesson.id;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => setCurrentLesson(lesson)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: isActive ? '#eff6ff' : '#f9fafb',
                      border: isActive ? '1px solid #bfdbfe' : '1px solid #f3f4f6',
                      borderRight: isActive ? '4px solid #3b82f6' : '1px solid #f3f4f6',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{
                        backgroundColor: isActive ? '#3b82f6' : '#1f2937',
                        color: 'white',
                        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', fontSize: '14px', flexShrink: 0
                      }}>
                        {index + 1}
                      </span>
                      <span style={{ fontWeight: isActive ? 'bold' : 'normal', color: isActive ? '#1e3a8a' : '#4b5563', fontSize: '15px' }}>
                        {lesson.title}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>
                      {formatTime(lesson.durationSeconds || 0)}
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