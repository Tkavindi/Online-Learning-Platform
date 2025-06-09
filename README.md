
# **WiseLearn Documentation**

WiseLearn is an **AI-powered online learning platform** that offers course creation, enrollment, and personalized learning via GPT-based recommendations and chat support.

---

## 📁 Project Structure

```bash
wislearn/
├── backend/     # Node.js backend with Express & MongoDB
├── frontend/    # React + Vite frontend
└── README.md    # Project documentation
```

---

## 1. 🚀 Project Overview

WiseLearn enables instructors to create courses and students to enroll, interact, and receive intelligent course suggestions using AI. The platform integrates:
- Role-based authentication
- Real-time chat
- GPT-powered recommendations
- Responsive design

---

## 2. ⚙️ Tech Stack & Requirements

### Backend
- Node.js (>=18)
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- OpenAI API

### Frontend
- React 18
- Vite
- TailwindCSS
- Axios
- React Router v6
- Lucide React Icons

---

## 3. 🧰 Setup Instructions

### 📦 Backend

```bash
# 1. Clone the repository
git clone <repository-url>
cd backend

# 2. Install dependencies
npm install

# 3. Create a .env file
touch .env
# Add the following:
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key

# 4. Start the development server
npm run dev
```

### 🌐 Frontend

```bash
# 1. Navigate to frontend
cd frontend/lms

# 2. Install dependencies
npm install

# 3. Create a .env file
touch .env
# Add the following:
VITE_BASE_URL=http://localhost:3000

# 4. Start the development server
npm run dev
```

---

## 4. 🧪 API Endpoints

### 🔐 Authentication
- `POST /api/users/register` – Register a new user  
- `POST /api/users/login` – Login existing user

### 📚 Courses
- `GET /api/courses` – List all courses  
- `GET /api/courses/:id` – Get course by ID  
- `POST /api/courses` – Create course (Instructor only)  
- `PUT /api/courses/:id` – Update course (Instructor only)  
- `DELETE /api/courses/:id` – Delete course (Instructor only)

### 📝 Enrollments
- `POST /api/enrollments/:courseId` – Enroll in course  
- `GET /api/enrollments` – Get user's enrolled courses  
- `GET /api/enrollments/:courseId` – Get all students enrolled in a course

### 🤖 AI Integration
- `POST /api/gpt/recommend` – Get course recommendations

---

## 5. 🌍 Environment Variables

### Backend `.env`
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

### Frontend `.env`
```env
VITE_BASE_URL=http://localhost:3000
```

---

## 6. 🚀 Deployment

### 🛠 Backend
- Hosted on Fly.io
- Config file: `fly.toml`
```bash
fly deploy
```

### 🌐 Frontend
- Hosted on Vercel
- Config file: `vercel.json`
```bash
vercel
```

---

## 7. 🧱 Project Structure

### Backend
```
backend/
├── controllers/   # Route handlers
├── middleware/    # Auth and error middleware
├── models/        # Mongoose schemas
├── routes/        # API route definitions
├── utils/         # Helper functions
├── index.js       # App entry point
├── .env           # Environment config
└── package.json   # Node dependencies
```

### Frontend
```
frontend/
├── src/
│   ├── components/   # Reusable UI components
│   ├── context/      # Auth and chat context
│   ├── pages/        # Routes and views
│   ├── utils/        # Utility functions
│   ├── App.jsx       # Main app
│   └── main.jsx      # Entry point
├── tailwind.config.js
├── vite.config.js
├── .env
├── index.html
```

---

## 8. 🎯 Features

- 🔐 JWT Authentication
- 👥 Role-based access (Student / Instructor)
- 📚 Dynamic Course Management
- 📝 Enrollment & Progress Tracking
- 🤖 AI Recommendations (OpenAI GPT)
- 💬 AI Chat Assistant
- 📱 Responsive Design

---

## 9. 🧩 System Design

### 📘 MongoDB Schema

#### 1. **User**
```json
{
  _id, name, username, password,
  role: "student" | "instructor",
  createdAt, updatedAt
}
```

#### 2. **Course**
```json
{
  _id, title, description, instructor (ref User),
  duration, level, category,
  createdAt, updatedAt
}
```

#### 3. **Enrollment**
```json
{
  _id, student (ref User), course (ref Course),
  progress, status: "active" | "completed",
  enrolledAt, completedAt
}
```

#### 4. **Chat**
```json
{
  _id, user (ref User),
  messages: [{ content, role: "user" | "assistant", timestamp }],
  createdAt
}
```

### 🔗 Relationships
- `User` → `Courses` (1:n, instructor creates)
- `User` → `Enrollments` (1:n, student enrolls)
- `Course` → `Enrollments` (1:n)
- `User` → `Chats` (1:n)

