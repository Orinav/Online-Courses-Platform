export interface Lesson {
  id?: number;
  title: string;
  videoUrl: string;
  durationSeconds: number;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  instructor: string;
  imageUrl?: string; // השדה של התמונה נוסף כאן
  lessons: Lesson[];
}

export interface User {
  id: number;
  email: string;
  role: string;
}