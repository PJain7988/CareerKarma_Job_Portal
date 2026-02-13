# 🚀 MERN Job Portal AI

An AI-powered full-stack Job Portal built using the MERN stack.  
This platform connects job seekers and recruiters with smart AI-based features for resume screening and job matching.

---

## 📌 Overview

MERN Job Portal AI is a modern recruitment platform that allows:

- Job Seekers to create profiles and apply for jobs  
- Recruiters to post and manage job listings  
- Admin to manage users and monitor activity  
- AI-powered resume analysis and job recommendations  

This project demonstrates complete full-stack development using MongoDB, Express, React, and Node.js.

---

## 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS / Bootstrap
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt.js
- OpenAI API (Optional AI features)

---

## 📂 Project Structure

```
MERN-Job-Portal-AI/
│
├── server/              # Express + MongoDB Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── seed.js
│   └── server.js
│
├── client/              # Vite + React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── api/
│   │   └── App.jsx
│   └── vite.config.js
│
└── README.md
```

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure JWT-based login & registration
- Role-based access control (Admin, Recruiter, User)
- Protected routes

### 💼 Job Management
- Create job listings
- Edit and delete jobs
- Search and filter jobs
- View job details

### 📄 Application System
- Apply for jobs
- Upload resume
- Track application status
- Recruiter can shortlist/reject applicants

### 🤖 AI Integration
- Resume analysis
- Smart job recommendations
- AI-generated job descriptions (Optional)

### 📊 Dashboard
- Recruiter dashboard
- User dashboard
- Admin management panel

---

## ⚙️ Installation & Setup

## 🔹 Backend Setup

```bash
cd server
cp .env.example .env
```

Add the following variables inside `.env`:

```
PORT=5001
MONGO_URI=mongodb+srv://PJain:PJain1234@cluster0.jsomqau.mongodb.net/Project_0
CLIENT_URL=http://localhost:5173
EMAIL_USER=72062priya@gmail.com
EMAIL_PASS="aprk xoxj zqbi ohyw"
VITE_API_URL=http://localhost:5001

```

Install dependencies and start server:

```bash
npm install
npm run seed     # Optional - adds sample data
npm run dev
```

Server runs at:
```
http://localhost:5000
```

---

## 🔹 Frontend Setup

```bash
cd client
npm install
npm run dev
```

Client runs at:
```
http://localhost:5173
```

The frontend proxies `/api` requests to the backend using `vite.config.js`.

---

## 🌱 Sample Seed Data

Running:

```bash
npm run seed
```

Creates sample users:


Recruiter  
Email: priyajain7988@gmail.com 
Password: 123456  

Job Seeker  
Email: 96716.sushil@gmail.com  
Password: 123456 

Sample Jobs:
- MERN Stack Developer
- Frontend Developer
- Backend Developer
- Data Analyst

---

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
```

### Jobs
```
GET    /api/jobs
POST   /api/jobs
PUT    /api/jobs/:id
DELETE /api/jobs/:id
GET    /api/jobs/:id
```

### Applications
```
POST   /api/applications/apply
GET    /api/applications/user
GET    /api/applications/job/:id
PUT    /api/applications/status/:id
```

---

## 🚀 Deployment

### Backend Hosting
- Render
- Railway
- AWS EC2

### Frontend Hosting
- Vercel
- Netlify

Make sure to update:
- API base URL in frontend
- Environment variables in hosting dashboard

---

## 📸 Screenshots

Add your screenshots here:

```
/screenshots/home.png
/screenshots/recuriter.png
/screenshots/HR.png
```

---

## 🧠 Learning Outcomes

- Full-stack MERN development
- REST API design
- Secure authentication using JWT
- MongoDB schema design
- AI API integration
- Deployment & environment configuration

---

## 🔮 Future Enhancements

- Real-time notifications
- Resume parsing with NLP
- Advanced job filtering
- Payment integration
- In-app chat system

---

## 👩‍💻 Author

Priya Jain  
B.Tech Computer Science Engineering  
Full Stack Developer | DSA Enthusiast | AI Explorer  

GitHub: https://github.com/PJain7988 
LinkedIn: https://www.linkedin.com/in/priya72062/

---

## ⭐ Support

If you found this project helpful, consider giving it a star ⭐ on GitHub.
