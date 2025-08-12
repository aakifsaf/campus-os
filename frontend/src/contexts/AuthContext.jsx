import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { setAuthToken, clearAuthToken } from '../config/api';
import { toast } from 'react-hot-toast';
import { authService } from '../services';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setAuthToken(token);
          const { success, user } = await authService.getCurrentUser();
          console.log("user",user);
          if (success) {
            setUser(user);
          } else {
            // If token is invalid, clear it
            clearAuthToken();
            if (message === 'Token expired') {
              toast.error('Your session has expired. Please log in again.');
            }
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        clearAuthToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Cleanup function to handle component unmount
    return () => {
      // Any cleanup if needed
    };
  }, []);

  // Login user
const login = async ({ email, password, remember = false }) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login({ email, password, remember });
      console.log("authcontext response",response);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        
        // Store the token from the response
        setAuthToken(response.data.token);
        
        // Return the user role for redirection
        return {
          success: true,
          role: response.data.user.role // Make sure your API returns the user role
        };
      } else {
        setError(response.message || 'Login failed');
        toast.error(response.message || 'Login failed');
        return { success: false };
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
      toast.error(error.message || 'An error occurred during login');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const { success, data, message } = await api.register(userData);
      
      if (success) {
        // Don't log in automatically, wait for email verification
        toast.success('Registration successful! Please check your email to verify your account.');
        return { 
          success: true, 
          message: 'Registration successful! Please check your email to verify your account.' 
        };
      } else {
        const errorMsg = message || 'Registration failed. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.message || 'An error occurred during registration';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };
  
  // Verify email with token
  const verifyEmail = async (token) => {
    try {
      setLoading(true);
      const { success, message } = await api.verifyEmail(token);
      
      if (success) {
        toast.success(message || 'Email verified successfully!');
        return { success: true, message };
      } else {
        toast.error(message || 'Email verification failed');
        return { success: false, message };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      const errorMsg = error.response?.data?.message || 'An error occurred during email verification';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };
  
  // Resend verification email
  const resendVerificationEmail = async (email) => {
    try {
      setLoading(true);
      const { success, message } = await api.resendVerificationEmail(email);
      
      if (success) {
        toast.success(message || 'Verification email sent. Please check your inbox.');
        return { success: true, message };
      } else {
        toast.error(message || 'Failed to resend verification email');
        return { success: false, message };
      }
    } catch (error) {
      console.error('Resend verification email error:', error);
      const errorMsg = error.response?.data?.message || 'An error occurred while resending verification email';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };
  
  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const { success, message } = await api.forgotPassword(email);
      
      if (success) {
        toast.success(message || 'Password reset instructions have been sent to your email.');
        return { success: true, message };
      } else {
        toast.error(message || 'Failed to send password reset email');
        return { success: false, message };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMsg = error.response?.data?.message || 'An error occurred while processing your request';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      const { success, message } = await api.resetPassword(token, newPassword);
      
      if (success) {
        toast.success(message || 'Password has been reset successfully');
        return { success: true, message };
      } else {
        toast.error(message || 'Failed to reset password');
        return { success: false, message };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMsg = error.response?.data?.message || 'An error occurred while resetting your password';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth-related data
      setUser(null);
      clearAuthToken();
      localStorage.removeItem('userRole');
      
      // Redirect to login page with a message
      navigate('/login', { 
        state: { 
          message: 'You have been logged out successfully.' 
        } 
      });
      
      toast.success('You have been logged out successfully');
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const { success, data, message } = await api.updateProfile(userData);
      
      if (success) {
        setUser(data.user);
        toast.success(message || 'Profile updated successfully');
        return { success: true, user: data.user };
      } else {
        toast.error(message || 'Failed to update profile');
        return { success: false, message };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMsg = error.response?.data?.message || 'An error occurred while updating your profile';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };
  
  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const { success, message } = await api.updatePassword({ currentPassword, newPassword });
      
      if (success) {
        toast.success(message || 'Password updated successfully');
        return { success: true, message };
      } else {
        toast.error(message || 'Failed to update password');
        return { success: false, message };
      }
    } catch (error) {
      console.error('Update password error:', error);
      const errorMsg = error.response?.data?.message || 'An error occurred while updating your password';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user has a specific role
  const hasRole = useCallback((role) => {
    if (!user) return false;
    return user.role === role;
  }, [user]);
  
  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);
  
  // Check if user has all the specified roles (for future use with multiple roles)
  const hasAllRoles = useCallback((roles) => {
    if (!user) return false;
    return roles.every(role => user.roles?.includes(role));
  }, [user]);

  // Create the context value object
  const value = {
    // State
    user,
    loading,
    error,
    isAuthenticated: !!user,
    
    // Auth methods
    login,
    register,
    logout,
    
    // User management
    updateProfile,
    updatePassword,
    
    // Email verification
    verifyEmail,
    resendVerificationEmail,
    
    // Password reset
    forgotPassword,
    resetPassword,
    
    // Role checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Helper functions
    isAdmin: hasRole('admin'),
    isFaculty: hasRole('faculty'),
    isStudent: hasRole('student')
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context itself for class components or other use cases
export default AuthContext;
