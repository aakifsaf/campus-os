import { useState, useCallback } from 'react';
import { validateForm } from '../utils/validation';
import { showError } from '../utils/notifications';

const useForm = (initialValues, validationSchema, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setValues(prevValues => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  }, [errors]);

  // Handle blur event for touched fields
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true,
    }));

    // Validate field on blur if there's a schema
    if (validationSchema) {
      validateField(name);
    }
  }, [validationSchema]);

  // Validate a single field
  const validateField = useCallback(async (fieldName) => {
    if (!validationSchema) return true;
    
    try {
      const fieldSchema = validationSchema.pick([fieldName]);
      await fieldSchema.validate(values[fieldName], { abortEarly: false });
      
      setErrors(prevErrors => ({
        ...prevErrors,
        [fieldName]: null,
      }));
      
      return true;
    } catch (err) {
      const fieldError = err.inner.find(error => error.path === fieldName);
      
      if (fieldError) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [fieldName]: fieldError.message,
        }));
      }
      
      return false;
    }
  }, [validationSchema, values]);

  // Validate entire form
  const validateFormFields = useCallback(async () => {
    if (!validationSchema) return { isValid: true, errors: {} };
    
    const { isValid, errors: validationErrors } = await validateForm(validationSchema, values);
    
    setErrors(validationErrors);
    
    // Mark all fields as touched to show errors
    const newTouched = {};
    Object.keys(values).forEach(key => {
      newTouched[key] = true;
    });
    setTouched(newTouched);
    
    return { isValid, errors: validationErrors };
  }, [validationSchema, values]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Validate form if schema is provided
      if (validationSchema) {
        const { isValid } = await validateFormFields();
        if (!isValid) {
          setIsSubmitting(false);
          return { success: false, errors };
        }
      }
      
      // Call the onSubmit callback with form values
      const result = await onSubmit(values, { setErrors, setValues });
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Form submission error:', error);
      showError(error.message || 'An error occurred while submitting the form');
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, values, validationSchema, validateFormFields, errors]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Set field value manually
  const setFieldValue = useCallback((name, value) => {
    setValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);

  // Set field touched manually
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: isTouched,
    }));
  }, []);

  // Get field props for controlled components
  const getFieldProps = (name) => ({
    name,
    value: values[name] ?? '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] ? errors[name] : undefined,
  });

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldTouched,
    setValues,
    setErrors,
    getFieldProps,
    validateField,
    validateForm: validateFormFields,
  };
};

export default useForm;
