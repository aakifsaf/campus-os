import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export const registerSchema = yup.object().shape({
  name: yup.string().required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup
    .string()
    .oneOf(['student', 'faculty', 'admin'], 'Please select a valid role')
    .required('Role is required'),
});

export const profileSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  department: yup.string().required('Department is required'),
  studentId: yup.string().when('isStudent', {
    is: true,
    then: yup.string().required('Student ID is required'),
    otherwise: yup.string(),
  }),
});

export const announcementSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  content: yup.string().required('Content is required'),
  targetAudience: yup
    .array()
    .min(1, 'Select at least one audience')
    .required('Please select target audience'),
  priority: yup
    .string()
    .oneOf(['low', 'medium', 'high'], 'Please select a priority')
    .required('Priority is required'),
});

export const assignmentSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  dueDate: yup
    .date()
    .min(new Date(), 'Due date must be in the future')
    .required('Due date is required'),
  totalMarks: yup
    .number()
    .positive('Marks must be a positive number')
    .required('Total marks are required'),
  course: yup.string().required('Course is required'),
});

export const leaveRequestSchema = yup.object().shape({
  startDate: yup
    .date()
    .min(new Date(), 'Start date must be in the future')
    .required('Start date is required'),
  endDate: yup
    .date()
    .min(yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
  reason: yup.string().required('Please provide a reason for leave'),
  leaveType: yup
    .string()
    .oneOf(['sick', 'vacation', 'personal', 'other'], 'Please select a valid leave type')
    .required('Leave type is required'),
});

// Helper function to validate form data against a schema
export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    const errors = {};
    err.inner.forEach((error) => {
      errors[error.path] = error.message;
    });
    return { isValid: false, errors };
  }
};

export const formatValidationError = (error) => {
  if (error.response?.data?.errors) {
    return Object.values(error.response.data.errors).flat().join('\n');
  }
  return error.message || 'An error occurred';
};
