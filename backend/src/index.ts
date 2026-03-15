import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export interface AuthRequest extends Request {
  user?: { userId: number; role: string; };
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) { res.status(401).json({ error: "Access denied." }); return; }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decodedUser) => {
    if (err) { res.status(403).json({ error: "Invalid token." }); return; }
    req.user = decodedUser as { userId: number; role: string };
    next();
  });
};

app.post('/api/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) { res.status(400).json({ error: "Email in use." }); return; }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.json({ id: newUser.id, email: newUser.email, role: newUser.role });
  } catch (error) { res.status(500).json({ error: "Registration failed." }); }
});

app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { res.status(401).json({ error: "Invalid credentials." }); return; }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) { res.status(401).json({ error: "Invalid credentials." }); return; }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ error: "Login failed." }); }
});

app.get('/api/courses', async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({ include: { lessons: true } });
    res.json(courses);
  } catch (error) { res.status(500).json({ error: "Failed to fetch courses" }); }
});

app.get('/api/courses/:id', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id as string);
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: true }
    });
    if (!course) { res.status(404).json({ error: "Course not found" }); return; }
    res.json(course);
  } catch (error) { res.status(500).json({ error: "Failed to fetch course" }); }
});

app.post('/api/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') { res.status(403).json({ error: "Admins only." }); return; }
    const { title, description, price, lessons } = req.body;
    if (!lessons || lessons.length === 0) { res.status(400).json({ error: "Need 1 video." }); return; }

    const newCourse = await prisma.course.create({
      data: { title, description, price, lessons: { create: lessons } },
      include: { lessons: true }
    });
    res.json(newCourse);
  } catch (error) { res.status(500).json({ error: "Failed to create course" }); }
});

app.delete('/api/courses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') { res.status(403).json({ error: "Admins only." }); return; }
    const courseId = parseInt(req.params.id as string);
    const deletedCourse = await prisma.course.delete({ where: { id: courseId } });
    res.json(deletedCourse);
  } catch (error) { res.status(500).json({ error: "Failed to delete course." }); }
});

// PUT: Update an existing course (Protected)
app.put('/api/courses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') { res.status(403).json({ error: "Admins only." }); return; }

    const courseId = parseInt(req.params.id as string);
    const { title, description, price, lessons } = req.body;

    if (!lessons || lessons.length === 0) {
      res.status(400).json({ error: "Need at least 1 video." });
      return;
    }

    // פריזמה מעדכנת את הקורס, מוחקת את השיעורים הישנים ויוצרת את החדשים ששלחנו
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        price,
        lessons: {
          deleteMany: {}, // מנקה את רשימת הסרטונים הישנה
          create: lessons.map((lesson: any) => ({
            title: lesson.title,
            videoUrl: lesson.videoUrl
          }))
        }
      },
      include: { lessons: true }
    });

    res.json(updatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update course" });
  }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));