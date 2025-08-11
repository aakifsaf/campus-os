# Campus OS Backend API

This is the backend API for the Campus OS (College Management System) built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization (JWT)
- Role-based access control (Admin, Faculty, Student)
- Student management
- Faculty management
- Course management
- Enrollment system
- Attendance tracking
- Assignment submission and grading
- File uploads
- API documentation with Swagger

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (v6 or higher) or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/campus-os.git
   cd campus-os/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/campus_os
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   MAX_FILE_UPLOAD=1000000
   FILE_UPLOAD_PATH=./public/uploads
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_EMAIL=your_email@example.com
   SMTP_PASSWORD=your_email_password
   FROM_EMAIL=noreply@campusos.com
   FROM_NAME='Campus OS'
   ```

4. Create the uploads directory:
   ```bash
   mkdir -p public/uploads
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The API will be available at `http://localhost:5000`

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:5000/api-docs`
- API JSON: `http://localhost:5000/api-docs.json`

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Lint the code
- `npm run format` - Format the code with Prettier

## Project Structure

```
backend/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── models/             # Database models
├── routes/             # API routes
├── utils/              # Utility functions
├── public/             # Public files (uploads)
│   └── uploads/        # Uploaded files
├── .env                # Environment variables
├── .eslintrc.js        # ESLint configuration
├── .prettierrc         # Prettier configuration
├── package.json        # Project dependencies
└── server.js           # Application entry point
```

## Authentication

Most routes require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

The API returns standardized error responses with the following format:

```json
{
  "success": false,
  "error": "Error message",
  "stack": "Error stack trace (in development)"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/campus_os |
| JWT_SECRET | JWT secret key | (required) |
| JWT_EXPIRE | JWT expiration | 30d |
| JWT_COOKIE_EXPIRE | JWT cookie expiration in days | 30 |
| MAX_FILE_UPLOAD | Max file upload size in bytes | 1000000 (1MB) |
| FILE_UPLOAD_PATH | File upload directory | ./public/uploads |
| SMTP_* | SMTP configuration for emails | (required for password reset) |
| FROM_EMAIL | Sender email address | (required for emails) |
| FROM_NAME | Sender name | Campus OS |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
