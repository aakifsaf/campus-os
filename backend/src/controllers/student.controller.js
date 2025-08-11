import Student from '../models/Student.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from 'express-async-handler';
import path from 'path';

// @desc    Get all students
// @route   GET /api/v1/students
// @access  Private/Admin/Faculty
export const getStudents = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single student
// @route   GET /api/v1/students/:id
// @access  Private
export const getStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id).populate({
    path: 'user',
    select: 'name email',
  });

  if (!student) {
    return next(
      new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is student owner or admin
  if (
    student.user.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'faculty'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this student`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: student,
  });
});

// @desc    Create new student
// @route   POST /api/v1/students
// @access  Private/Admin/Faculty
export const createStudent = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for existing student
  const existingStudent = await Student.findOne({ user: req.user.id });

  if (existingStudent) {
    return next(
      new ErrorResponse(
        `Student with user ${req.user.id} already exists`,
        400
      )
    );
  }

  const student = await Student.create(req.body);

  // Update user role to student if not already
  await User.findByIdAndUpdate(req.user.id, { role: 'student' });

  res.status(201).json({
    success: true,
    data: student,
  });
});

// @desc    Update student
// @route   PUT /api/v1/students/:id
// @access  Private/Admin/Faculty
export const updateStudent = asyncHandler(async (req, res, next) => {
  let student = await Student.findById(req.params.id);

  if (!student) {
    return next(
      new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is student owner or admin
  if (
    student.user.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'faculty'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this student`,
        401
      )
    );
  }

  // Update student
  student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: student,
  });
});

// @desc    Delete student
// @route   DELETE /api/v1/students/:id
// @access  Private/Admin
export const deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(
      new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is admin
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this student`,
        401
      )
    );
  }

  await student.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get current logged in student profile
// @route   GET /api/v1/students/me/profile
// @access  Private/Student
export const getStudentProfile = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user.id }).populate({
    path: 'user',
    select: 'name email',
  });

  if (!student) {
    return next(
      new ErrorResponse(`No student found for user ${req.user.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: student,
  });
});

// @desc    Upload photo for student
// @route   PUT /api/v1/students/:id/photo
// @access  Private/Admin/Faculty
export const uploadStudentPhoto = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(
      new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is student owner or admin
  if (
    student.user.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'faculty'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this student`,
        401
      )
    );
  }

  if (!req.file) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${student._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Student.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
