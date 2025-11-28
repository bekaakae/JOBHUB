JobHub - Job Board Application Documentation
📋 Table of Contents
Project Overview

Live Deployment

Quick Start

API Documentation

User Guide

Technical Architecture

Development Setup

Deployment Guide

🚀 Project Overview
JobHub is a comprehensive MERN stack job board application that connects job seekers with employers. The platform allows admins to post job opportunities across various categories while enabling users to browse, search, and engage with job listings through comments and likes.

Key Features
For Job Seekers: Browse jobs, search/filter, real-time comments & likes, deadline alerts

For Employers/Admins: Job posting, category management, analytics dashboard

Technical: Real-time updates, secure authentication, responsive design, CI/CD pipelines

Tech Stack
Frontend: React, Vite, Tailwind CSS, Socket.io Client, Clerk Authentication

Backend: Node.js, Express, MongoDB, Socket.io, JWT, Clerk

Deployment: Render (Backend & Frontend), MongoDB Atlas

🌐 Live Deployment
Production URLs
Frontend: https://jobhub-frontend-6e6g.onrender.com

Backend API: https://jobhub-backend-540l.onrender.com/api

Health Check: https://jobhub-backend-540l.onrender.com/api/health

Admin Access
Admin Users: Nicholas Morang'a & Renick Maina

Admin Features: Job posting, category management, analytics dashboard

⚡ Quick Start
Prerequisites
Node.js 18+

MongoDB (Local or Atlas)

Clerk Account

Local Development
bash
# 1. Clone repository
git clone https://github.com/bekaakae/JOBHUB.git
cd JOBHUB

# 2. Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev

# 3. Frontend setup (new terminal)
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
Environment Variables
Backend (.env)

env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobhub
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
FRONTEND_URL=http://localhost:5173
Frontend (.env)

env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
📚 API Documentation
Base URL
text
https://jobhub-backend-540l.onrender.com/api
Authentication
All protected endpoints require Clerk authentication. Include the Clerk session token in requests.

Key Endpoints
Jobs
Method	Endpoint	Description	Auth Required
GET	/jobs	Get all jobs with filtering	No
GET	/jobs/:id	Get single job details	No
POST	/jobs	Create new job	Admin only
PUT	/jobs/:id	Update job	Admin only
DELETE	/jobs/:id	Delete job	Admin only
Categories
Method	Endpoint	Description	Auth Required
GET	/categories	Get all categories	No
POST	/categories	Create category	Admin only
Comments
Method	Endpoint	Description	Auth Required
GET	/comments/job/:jobId	Get comments for job	No
POST	/comments	Create comment	Yes
DELETE	/comments/:id	Delete comment	Author/Admin
Likes
Method	Endpoint	Description	Auth Required
POST	/likes/toggle	Toggle like on job	Yes
GET	/likes/job/:jobId/status	Get like status	Yes
Request/Response Examples
Get All Jobs with Filtering

http
GET /api/jobs?search=developer&category=tech&location=remote&page=1
Response:

json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
Create Job (Admin)

http
POST /api/jobs
Authorization: Bearer <clerk-token>
Content-Type: application/json

{
  "title": "Senior Frontend Developer",
  "description": "We are looking for...",
  "company": "Tech Corp",
  "location": "Remote",
  "salary": {"min": 80000, "max": 120000},
  "jobType": "full-time",
  "deadline": "2024-12-31",
  "category": "category_id",
  "applicationLink": "https://company.com/apply"
}
👥 User Guide
For Job Seekers
Browsing Jobs
Homepage: View featured jobs and categories

Jobs Page: Use filters (search, category, location, salary)

Job Details: Click any job card for full details

Job Interactions
Likes: Click heart icon to like jobs

Comments: Add comments to discuss opportunities

Applications: Click "Apply Now" to visit company application page

Search & Filters
Text Search: Search in job titles, companies, descriptions

Category Filter: Browse by technology, business, education, etc.

Location Filter: Filter by city, state, or remote

Salary Range: Set minimum and maximum salary

Job Type: Full-time, part-time, contract, internship, remote

For Admins
Admin Dashboard
Access: Special admin access for Nicholas and Renick

Statistics: View total jobs, applications, comments, likes

Job Management: Create, edit, delete job postings

Posting Jobs
Navigate to Admin Dashboard → "Post Job"

Fill Details: Title, description, company, location, salary, deadline

Add Metadata: Category, job type, experience level

Application Link: Provide external application URL

Publish: Submit to make job live

Category Management
Create and manage job categories

Set category colors and icons

Organize jobs by industry/field

🏗️ Technical Architecture
System Architecture
text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Database      │
│   (React)       │◄──►│   (Express)      │◄──►│   (MongoDB)     │
│                 │    │                  │    │                 │
│ - Vite          │    │ - REST API       │    │ - Job Models    │
│ - Tailwind CSS  │    │ - Socket.io      │    │ - User Models   │
│ - Clerk Auth    │    │ - Auth Middleware│    │ - Category Models
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                         ┌──────────────────┐
                         │   Real-time      │
                         │   (Socket.io)    │
                         │                  │
                         │ - Live Comments  │
                         │ - Like Updates   │
                         └──────────────────┘
Database Schema
Jobs Collection
javascript
{
  title: String, required,
  description: String, required,
  company: String, required,
  location: String, required,
  salary: { min: Number, max: Number },
  jobType: String, enum: ['full-time', 'part-time', ...],
  deadline: Date, required,
  category: ObjectId, ref: 'Category',
  applicationLink: String, required,
  requirements: [String],
  benefits: [String],
  isActive: Boolean, default: true,
  views: Number, default: 0,
  applicationCount: Number, default: 0
}
Categories Collection
javascript
{
  name: String, required, unique,
  description: String,
  color: String, default: "#10B981",
  icon: String,
  jobCount: Number, default: 0,
  isActive: Boolean, default: true
}
Authentication Flow
User Signup/Login via Clerk

Session Management handled by Clerk

Backend Verification using Clerk middleware

Role-based Access for admin features

Real-time Features
Socket.io for live comments and likes

Room-based architecture (per job)

Automatic reconnection handling

🛠️ Development Setup
Local Development
bash
# Backend development
cd backend
npm run dev  # Runs on http://localhost:5000

# Frontend development  
cd frontend
npm run dev  # Runs on http://localhost:5173
Testing
bash

# Backend (Render handles this)
npm run build

# Frontend
cd frontend
npm run build  # Creates dist/ folder
🚀 Deployment Guide
Render Deployment
Backend Deployment
Connect GitHub repository to Render

Create Web Service with these settings:

Build Command: npm install

Start Command: npm start

Environment: node

Root Directory: backend

Frontend Deployment
Create Static Site on Render

Configure these settings:

Build Command: npm run build

Publish Directory: dist

Root Directory: frontend

Environment Variables (Production)
Backend on Render:

text
NODE_ENV=production
MONGO_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
FRONTEND_URL=https://jobhub-frontend-6e6g.onrender.com
Frontend on Render:

text
VITE_API_URL=https://jobhub-backend-540l.onrender.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
CI/CD Pipeline
The project includes GitHub Actions for:

Automated testing on push/PR

Security scanning with npm audit

Auto-deployment to Render on main branch


🔧 Troubleshooting
Common Issues
Database Connection
bash
# Check MongoDB connection
mongosh "mongodb+srv://..."
CORS Issues
Verify FRONTEND_URL in backend environment variables

Check CORS configuration in server.js

Authentication Problems
Verify Clerk keys in both frontend and backend

Check redirect URLs in Clerk dashboard

Getting Help
Check Render deployment logs

Review browser console errors

Test API endpoints directly

Check MongoDB Atlas connection

👨‍💻 Development Team
Nicholas Morang'a - Full Stack Development

Renick Maina - Backend & Database Architecture

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

Live Application: https://jobhub-frontend-6e6g.onrender.com
API Documentation: https://jobhub-backend-540l.onrender.com/api/health