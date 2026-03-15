import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Course, Lesson } from '../types';
import Navbar from '../components/Navbar';
import './CourseDetail.css';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/courses/${id}`);
        if (!response.ok) throw new Error("Course not found");
        const data = await response.json();
        setCourse(data);
        if (data.lessons && data.lessons.length > 0) {
          setActiveLesson(data.lessons[0]);
        }
      } catch (error) { console.error("Failed to load course", error); }
    };
    fetchCourse();
  }, [id]);

  // Helper function to extract the standard YouTube ID and format it for an iframe
  const getEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch { return url; }
  };

  if (!course) return <div className="loading">Loading course...</div>;

  return (
    <div className="app-wrapper">
      <Navbar />

      <div className="course-detail-container">
        <button className="back-btn" onClick={() => navigate('/')}>&larr; Back to Courses</button>

        <div className="course-header">
          <h1>{course.title}</h1>
          <p>{course.description}</p>
        </div>

        <div className="course-content-grid">
          <div className="video-player-section">
            {activeLesson ? (
              <div className="video-wrapper">
                <div className="player-container">
                  {/* Bulletproof Native HTML Iframe instead of ReactPlayer */}
                  <iframe
                    width="100%"
                    height="100%"
                    src={getEmbedUrl(activeLesson.videoUrl)}
                    title={activeLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="react-player"
                  ></iframe>
                </div>
                <h2>{activeLesson.title}</h2>
              </div>
            ) : (
              <div className="no-video">No lessons available yet.</div>
            )}
          </div>

          <div className="lessons-sidebar">
            <h3>Course Content</h3>
            <div className="lessons-list">
              {course.lessons && course.lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  className={`lesson-item-btn ${activeLesson?.id === lesson.id ? 'active' : ''}`}
                  onClick={() => setActiveLesson(lesson)}
                >
                  <span className="lesson-number">{index + 1}</span>
                  <span className="lesson-title">{lesson.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;