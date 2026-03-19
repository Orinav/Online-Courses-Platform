# 🎓 Coursori - E-Learning Platform

Coursori is a modern, full-stack platform designed for selling and managing online courses in computer science, mathematics, and enrichment topics. The system provides a seamless learning experience for students, alongside powerful management tools for content administrators, with a strong emphasis on clean code architecture, security, and performance.

## ✨ Key Features

* **Authentication & Authorization:**
  * Secure registration and login using email and password (`bcrypt` encryption).
  * Quick and seamless login using Google accounts (Google OAuth 2.0).
  * Secure token-based session management (`JWT`).
  * Strict role-based access control (RBAC) separating ADMIN and CUSTOMER permissions.

* **Paywall & Access Control:**
  * Smart content locking mechanism: Users can browse the course catalog and view the syllabus, but the video player is locked for users who haven't purchased the course.
  * Simulated checkout process that instantly grants access to the purchased content without requiring a page refresh.

* **Continuous Learning Experience (Binge-Watching):**
  * Quick navigation between lessons using "Next" and "Previous" controls.
  * Personalized progress tracking system that allows users to mark lessons as completed and saves their progress.
  * Smart time formatting (displays lesson duration in `MM:SS` or `HH:MM:SS` format depending on the length of the video).

* **Admin Dashboard:**
  * Dedicated interface for adding, editing, and deleting courses.
  * Dynamic management of lesson lists within courses, including duration inputs, instructor names, and media links.

* **UI/UX & Architecture:**
  * Clean, responsive, and modern design.
  * Full Right-to-Left (RTL) support tailored for the target audience.
  * Strict separation of styling from logic—100% clean `.tsx` files completely free of Inline CSS, utilizing modular CSS architecture.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React.js, Vite
* **Language:** TypeScript
* **Routing:** React Router DOM
* **Styling:** Custom CSS (Modular & Clean Architecture)
* **Additional Tools:** `@react-oauth/google` for social login

### Backend
* **Environment:** Node.js, Express.js
* **Language:** TypeScript
* **Database:** PostgreSQL (managed via Docker and pgAdmin4)
* **ORM:** Prisma (including a full Migrations system for tracking schema changes)
* **Security:** `jsonwebtoken` (JWT), `bcrypt`

---

## 🗄️ Database Schema

The system is built on a smart relational model:
1. **User:** Manages users, credentials, and roles (ADMIN/CUSTOMER).
2. **Course:** Stores general course details (title, description, price, preview image, instructor).
3. **Lesson:** Specific lessons linked to a course (including video URL and duration).
4. **Purchase:** A join table tracking which user has purchased which course.
5. **LessonProgress:** A tracking table saving the completion status of specific lessons for each user.

---

## 🚀 Getting Started

### Prerequisites:
* Node.js installed on your local machine.
* Docker running in the background (for the PostgreSQL server).

### Installation:
1. Clone the repository.
2. Install dependencies for both the backend and frontend:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/courses_db"
JWT_SECRET="your_secret_key"
GOOGLE_CLIENT_ID="your_google_client_id"

cd backend
npx prisma migrate dev

One-Click Start:
For maximum convenience, an automated script is provided to launch both servers simultaneously.
Simply double-click the run.bat file located in the root directory.
The script will open two terminal windows:

The Backend server will run on port 3000.

The Frontend client will run on port 5173.

Open your browser and navigate to: http://localhost:5173