import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3000;

// --- SETUP ---
app.use(cors());
app.use(express.json());

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});
const prisma = new PrismaClient({ adapter });

// --- AUTHENTICATION MIDDLEWARE (THE BOUNCER) ---
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decodedUser) => {
    if (err) {
      res.status(403).json({ error: "Invalid token." });
      return;
    }

    req.user = decodedUser as { userId: number; role: string };
    next();
  });
};


// --- USER AUTHENTICATION ROUTES ---

// 1. Register a new user
app.post('/api/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
       res.status(400).json({ error: "This email is already in use." });
       return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    res.json({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register user." });
  }
});

// 2. Login an existing user
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to log in." });
  }
});


// --- COURSE ROUTES ---

// GET: Anyone can view courses (Public)
app.get('/api/courses', async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany();
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// POST: Only Admins can add courses (Protected)
app.post('/api/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: "Only admins can add courses." });
      return;
    }

    const { title, description, price } = req.body;
    const newCourse = await prisma.course.create({
      data: { title, description, price },
    });
    res.json(newCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create course" });
  }
});

// DELETE: Only Admins can delete courses (Protected)
app.delete('/api/courses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: "Only admins can delete courses." });
      return;
    }

    const courseId = parseInt(req.params.id as string);
    const deletedCourse = await prisma.course.delete({
      where: { id: courseId },
    });
    res.json(deletedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete course." });
  }
});


// --- START SERVER ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});