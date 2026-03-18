import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const app = express();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

interface AuthRequest extends Request { user?: any; }

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

app.post('/api/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email in use.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, password: hashedPassword, role: 'CUSTOMER' } });
    res.status(201).json({ message: 'User created' });
  } catch (error) { res.status(500).json({ error: 'Registration failed' }); }
});

app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ error: 'Login failed' }); }
});

app.post('/api/auth/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const email = ticket.getPayload()?.email;
    if (!email) return res.status(400).json({ error: "לא התקבל אימייל מגוגל." });
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await prisma.user.create({ data: { email, password: hashedPassword, role: 'CUSTOMER' } });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ error: "ההתחברות דרך גוגל נכשלה." }); }
});

app.get('/api/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/courses', async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({ include: { lessons: true } });
    res.json(courses);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch courses' }); }
});

app.get('/api/courses/:id', async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: Number(req.params.id) }, include: { lessons: true } });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch course' }); }
});

app.post('/api/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  try {
    const { title, description, price, instructor, imageUrl, lessons } = req.body;
    const course = await prisma.course.create({
      data: {
        title, description, price, instructor: instructor || "לא צוין", imageUrl: imageUrl || "",
        lessons: {
          create: lessons.map((lesson: any) => ({
            title: lesson.title, videoUrl: lesson.videoUrl, durationSeconds: lesson.durationSeconds || 0
          }))
        }
      },
      include: { lessons: true }
    });
    res.status(201).json(course);
  } catch (error) { res.status(500).json({ error: 'Failed to create course' }); }
});

app.put('/api/courses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  try {
    const id = Number(req.params.id);
    const { title, description, price, instructor, imageUrl, lessons } = req.body;
    await prisma.lesson.deleteMany({ where: { courseId: id } });
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title, description, price, instructor: instructor || "לא צוין", imageUrl: imageUrl || "",
        lessons: {
          create: lessons.map((lesson: any) => ({
            title: lesson.title, videoUrl: lesson.videoUrl, durationSeconds: lesson.durationSeconds || 0
          }))
        }
      },
      include: { lessons: true }
    });
    res.json(updatedCourse);
  } catch (error) { res.status(500).json({ error: 'Failed to update course' }); }
});

app.delete('/api/courses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  try {
    await prisma.course.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Course deleted successfully' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete course' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));