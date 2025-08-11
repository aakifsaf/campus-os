import Faculty from '../models/Faculty.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from 'express-async-handler';
import path from 'path';

// @desc    Get all faculty
// @route   GET /api/v1/faculty
// @access  Private/Admin
export const getFaculty = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single faculty
// @route   GET /api/vaculty/:id
// @access  Private
export const getSingleFaculty = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.findById(req.params.id).populate({
    path: 'user',
    select: 'name email',
  });

  if (!faculty) {
    return next(
      new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is faculty owner or admin
  if (
    faculty.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this faculty`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: faculty,
  });
});

// @desc    Create new faculty
// @route   POST /api/v1/faculty
// @access  Private/Admin
export const createFaculty = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for existing faculty
  const existingFaculty = await Faculty.findOne({ user: req.user.id });

  if (existingFaculty) {
    return next(
      new ErrorResponse(
        `Faculty with user ${req.user.id} already exists`,
        400
      )
    );
  }

  const faculty = await Faculty.create(req.body);

  // Update user role to faculty
  await User.findByIdAndUpdate(req.user.id, { role: 'faculty' });

  res.status(201).json({
    success: true,
    data: faculty,
  });
});

// @desc    Update faculty
// @route   PUT /api/v1/faculty/:id
// @access  Private/Admin
export const updateFaculty = asyncHandler(async (req, res, next) => {
  let faculty = await Faculty.findById(req.params.id);

  if (!faculty) {
    return next(
      new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is faculty owner or admin
  if (faculty.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this faculty`,
        401
      )
    );
  }

  faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: faculty,
  });
});

// @desc    Delete faculty
// @route   DELETE /api/v1/faculty/:id
// @access  Private/Admin
export const deleteFaculty = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.findById(req.params.id);

  if (!faculty) {
    return next(
      new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is admin
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this faculty`,
        401
      )
    );
  }

  await faculty.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Upload photo for faculty
// @route   PUT /api/v1/faculty/:id/photo
// @access  Private
export const uploadFacultyPhoto = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.findById(req.params.id);

  if (!faculty) {
    return next(
      new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is faculty owner or admin
  if (faculty.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this faculty`,
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
  file.name = `photo_${faculty._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Faculty.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});

// @desc    Get faculty profile
// @route   GET /api/v1/faculty/me/profile
// @access  Private/Faculty
export const getFacultyProfile = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.findOne({ user: req.user.id }).populate({
    path: 'user',
    select: 'name email',
  });

  if (!faculty) {
    return next(
      new ErrorResponse(`No faculty found for user ${req.user.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: faculty,
  });
});
