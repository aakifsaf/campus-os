import authService from './authService';
import studentService from './studentService';
import facultyService from './facultyService';
import courseService from './courseService';
import fileService from './fileService';

export {
  authService,
  studentService,
  facultyService,
  courseService,
  fileService,
};

export default {
  auth: authService,
  students: studentService,
  faculty: facultyService,
  courses: courseService,
  files: fileService,
};
