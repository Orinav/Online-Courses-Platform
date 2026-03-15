export interface Lesson {
  id?: number;
  title: string;
  videoUrl: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  lessons: Lesson[];
}