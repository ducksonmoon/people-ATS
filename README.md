# People ATS - HR & Talent Acquisition System

## Overview

People ATS is a comprehensive applicant tracking system designed to streamline HR operations, recruitment processes, and workforce planning. The system manages hiring goals, job requisitions, applicant tracking, and department growth planning.

## Features

- **Department Hiring Goals:** Track and manage hiring objectives for each department
- **Job Requisition Management:** Create, update, and track job openings
- **Applicant Tracking:** Monitor candidate progress through the hiring pipeline
- **Interview Scheduling:** Organize and manage candidate interviews
- **HR Dashboard:** View key metrics and data visualization for hiring processes
- **Workforce Planning:** Project future headcount needs and growth plans

## Tech Stack

### Frontend
- React with TypeScript
- Material UI for component library
- React Router for navigation
- Axios for API communication
- Chart.js for data visualization

### Backend
- NestJS with TypeScript
- Prisma ORM for database operations
- PostgreSQL database
- JWT authentication
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL 13+
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-org/people-ats.git
   cd people-ats
   ```

2. Install dependencies:
   ```
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Configure environment variables:
   - Create `.env` file in the backend directory using `.env.example` as a template
   - Set the database connection string and other required variables

4. Run database migrations:
   ```
   cd backend
   npx prisma migrate dev
   ```

5. Start the development servers:
   ```
   # Start backend server (from backend directory)
   npm run start:dev

   # Start frontend server (from frontend directory)
   npm start
   ```

## Project Structure

```
people-ats/
├── backend/                # NestJS backend service
│   ├── prisma/             # Prisma schema and migrations
│   ├── src/                # Source code
│   │   ├── modules/        # Feature modules
│   │   ├── scripts/        # Utility scripts
│   │   └── types/          # TypeScript type definitions
│   └── test/               # Test files
├── frontend/               # React frontend application
│   ├── public/             # Static assets
│   └── src/                # Source code
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── types/          # TypeScript type definitions
└── docs/                   # Documentation
```

## Key Workflows

### Hiring Goals Management

1. HR creates hiring goals for departments
2. Recruitment team assigns recruiters to hiring goals
3. Department heads review and approve goals
4. Progress is tracked against goals in the dashboard
5. Expired goals are archived automatically

### Applicant Tracking

1. Candidates apply through job portal
2. Applications are reviewed by HR
3. Interviews are scheduled with hiring managers
4. Feedback is collected and stored
5. Offers are extended to successful candidates

## Database Schema

Key models in the system include:

- User
- Department
- Job
- Application
- Interview
- HiringGoal
- DepartmentGrowthPlan
- ActivityLog
- CompanySettings

## API Documentation

API documentation is available at `/api/docs` when running the backend server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

[Insert license information here]