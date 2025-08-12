import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load route components
const Login = lazy(() => import('./pages/auth/Login'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Dashboard pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const FacultyDashboard = lazy(() => import('./pages/faculty/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

// Student pages
const StudentProfile = lazy(() => import('./pages/student/Profile'));
const StudentCourses = lazy(() => import('./pages/student/Courses'));

// Faculty pages
const FacultyProfile = lazy(() => import('./pages/faculty/Profile'));
const FacultyCourses = lazy(() => import('./pages/faculty/Courses'));

// Admin pages
const Users = lazy(() => import('./pages/admin/Users'));
const Courses = lazy(() => import('./pages/admin/Courses'));
const Enrollments = lazy(() => import('./pages/admin/Enrollments'));

// Common pages
const PageNotFound = lazy(() => import('./pages/common/PageNotFound'));
const Unauthorized = lazy(() => import('./pages/common/Unauthorized'));

// Loading component
const Loading = () => <LoadingSpinner fullScreen />;

function AppContent() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute roles={['student']}>
              <Layout role="student" />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
        
        {/* Faculty Routes */}
        <Route
          path="/faculty/*"
          element={
            <ProtectedRoute roles={['faculty']}>
              <Layout role="faculty" />
            </ProtectedRoute>
          }
        >
          <Route index element={<FacultyDashboard />} />
          <Route path="profile" element={<FacultyProfile />} />
          <Route path="courses" element={<FacultyCourses />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
        
        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={['admin']}>
              <Layout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="courses" element={<Courses />} />
          <Route path="enrollments" element={<Enrollments />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
        
        {/* Redirect root to appropriate dashboard or login */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 Route */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Layout fullScreen>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Toaster position="top-right" />
              <AppContent />
            </div>
          </Layout>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
