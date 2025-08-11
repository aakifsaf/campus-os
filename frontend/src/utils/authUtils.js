import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { showError } from './notifications';

// User roles
const ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
};

// Role hierarchy (higher number means higher privileges)
const ROLE_HIERARCHY = {
  [ROLES.STUDENT]: 1,
  [ROLES.FACULTY]: 2,
  [ROLES.ADMIN]: 3,
};

/**
 * Get the current authenticated user
 * @returns {Promise<Object|null>} The current user or null if not authenticated
 */
export const getCurrentUser = async () => {
  const auth = getAuth();
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      
      if (!user) {
        resolve(null);
        return;
      }
      
      try {
        // Get additional user data from Firestore
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          resolve({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            ...userDoc.data(),
          });
        } else {
          // User document doesn't exist in Firestore
          resolve({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            role: ROLES.STUDENT, // Default role
          });
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        showError('Failed to load user data');
        resolve(null);
      }
    });
  });
};

/**
 * Check if the current user has the required role or higher
 * @param {string} requiredRole - The minimum required role
 * @param {Object} user - The user object (must contain a 'role' property)
 * @returns {boolean} True if the user has the required role or higher
 */
export const hasRole = (requiredRole, user) => {
  if (!user || !user.role) return false;
  
  const userRoleLevel = ROLE_HIERARCHY[user.role] || 0;
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;
  
  return userRoleLevel >= requiredRoleLevel;
};

/**
 * Check if the current user has any of the specified roles
 * @param {string[]} allowedRoles - Array of allowed roles
 * @param {Object} user - The user object (must contain a 'role' property)
 * @returns {boolean} True if the user has any of the allowed roles
 */
export const hasAnyRole = (allowedRoles = [], user) => {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
};

/**
 * Check if the current user is the owner of a resource
 * @param {Object} resource - The resource to check ownership of
 * @param {Object} user - The current user
 * @param {string} [idField='userId'] - The field name that contains the owner's ID
 * @returns {boolean} True if the user is the owner of the resource
 */
export const isOwner = (resource, user, idField = 'userId') => {
  if (!resource || !user) return false;
  return resource[idField] === user.uid;
};

/**
 * Check if the current user can edit a resource
 * @param {Object} resource - The resource to check edit permissions for
 * @param {Object} user - The current user
 * @param {string} [idField='userId'] - The field name that contains the owner's ID
 * @returns {boolean} True if the user can edit the resource
 */
export const canEdit = (resource, user, idField = 'userId') => {
  if (!user) return false;
  
  // Admins can edit anything
  if (hasRole(ROLES.ADMIN, user)) {
    return true;
  }
  
  // Owners can edit their own resources
  return isOwner(resource, user, idField);
};

/**
 * Check if the current user can delete a resource
 * @param {Object} resource - The resource to check delete permissions for
 * @param {Object} user - The current user
 * @param {string} [idField='userId'] - The field name that contains the owner's ID
 * @returns {boolean} True if the user can delete the resource
 */
export const canDelete = (resource, user, idField = 'userId') => {
  // For now, use the same permissions as editing
  return canEdit(resource, user, idField);
};

/**
 * Redirect to login page if user is not authenticated
 * @param {string} [redirectTo] - The URL to redirect to after login
 */
export const requireAuth = (redirectTo = null) => {
  const auth = getAuth();
  
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      
      if (!user) {
        // Not authenticated, redirect to login
        const redirectPath = redirectTo 
          ? `/login?redirect=${encodeURIComponent(redirectTo)}` 
          : '/login';
        
        window.location.href = redirectPath;
        reject(new Error('Authentication required'));
      } else {
        resolve(user);
      }
    });
  });
};

/**
 * Require a specific role for a route/action
 * @param {string} requiredRole - The minimum required role
 * @param {Function} onSuccess - Callback function to execute if the user has the required role
 * @param {Function} onError - Callback function to execute if the user doesn't have the required role
 */
export const requireRole = async (requiredRole, onSuccess, onError = null) => {
  try {
    const user = await getCurrentUser();
    
    if (user && hasRole(requiredRole, user)) {
      return onSuccess(user);
    }
    
    // User doesn't have the required role
    if (onError) {
      return onError(user);
    }
    
    // Default error handling
    showError('You do not have permission to access this resource');
    window.location.href = '/unauthorized';
  } catch (error) {
    console.error('Error checking user role:', error);
    showError('An error occurred while checking permissions');
    
    if (onError) {
      return onError(null, error);
    }
    
    window.location.href = '/error';
  }
};

/**
 * Check if the current user is authenticated
 * @returns {Promise<boolean>} True if the user is authenticated
 */
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

/**
 * Get the user's role
 * @returns {Promise<string|null>} The user's role or null if not authenticated
 */
export const getUserRole = async () => {
  const user = await getCurrentUser();
  return user?.role || null;
};

/**
 * Check if the current user is an admin
 * @returns {Promise<boolean>} True if the user is an admin
 */
export const isAdmin = async () => {
  const role = await getUserRole();
  return role === ROLES.ADMIN;
};

/**
 * Check if the current user is a faculty member
 * @returns {Promise<boolean>} True if the user is a faculty member
 */
export const isFaculty = async () => {
  const role = await getUserRole();
  return role === ROLES.FACULTY;
};

/**
 * Check if the current user is a student
 * @returns {Promise<boolean>} True if the user is a student
 */
export const isStudent = async () => {
  const role = await getUserRole();
  return role === ROLES.STUDENT;
};

export { ROLES };
