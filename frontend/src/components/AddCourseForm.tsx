import { useState } from 'react';
import './AddCourseForm.css';

// We tell the form to expect a specific function from App.tsx
// so it knows how to refresh the screen after a successful save.
interface AddCourseFormProps {
  onCourseAdded: () => void;
}

function AddCourseForm({ onCourseAdded }: AddCourseFormProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    const courseData = {
      title: newTitle,
      description: newDescription,
      price: parseFloat(newPrice)
    };

    try {
      const response = await fetch('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        // Clear the boxes
        setNewTitle('');
        setNewDescription('');
        setNewPrice('');

        // Trigger the refresh function we got from App.tsx!
        onCourseAdded();
      }
    } catch (error) {
      console.error("Failed to add course:", error);
    }
  };

  return (
    <div className="form-container">
      <h2>Add a New Course</h2>
      <form onSubmit={handleAddCourse}>
        <div className="input-group">
          <label>Course Title</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Publish Course</button>
      </form>
    </div>
  );
}

export default AddCourseForm;