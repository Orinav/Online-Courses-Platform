import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import EditCourse from './pages/EditCourse'; // 1. מייבאים את העמוד החדש
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/course/:id" element={<CourseDetail />} />

      {/* 2. מוסיפים את הנתיב לעמוד העריכה */}
      <Route path="/edit-course/:id" element={<EditCourse />} />
    </Routes>
  );
}

export default App;