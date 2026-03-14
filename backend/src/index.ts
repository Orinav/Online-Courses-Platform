import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import cors from 'cors';

const app = express();
const port = 3000;
app.use(cors());

// Look how much cleaner this is! No more 'pg' Pool mismatch.
// We just pass the connection string directly to the adapter.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});
const prisma = new PrismaClient({ adapter });

app.use(express.json());

app.get('/api/courses', async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany();
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

app.post('/api/courses', async (req: Request, res: Response) => {
  try {
    // 1. Grab the data sent by the user
    const { title, description, price } = req.body;

    // 2. Tell Prisma to create a new row in the database
    const newCourse = await prisma.course.create({
      data: {
        title: title,
        description: description,
        price: price,
      },
    });

    // 3. Send the newly created course back as a success message
    res.json(newCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create course" });
  }
});

app.delete('/api/courses/:id', async (req: Request, res: Response) => {
  try {
    // 1. Grab the ID from the URL and convert it into a number
    const courseId = parseInt(req.params.id as string);

    // 2. Tell Prisma to find the course with this exact ID and delete it
    const deletedCourse = await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    // 3. Send back the deleted course data as confirmation
    res.json(deletedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete course. It might not exist." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});