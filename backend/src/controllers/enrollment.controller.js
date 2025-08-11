import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all enrollments
// @route   GET /api/v1/enrollments
// @route   GET /api/v1/courses/:courseId/enrollments
// @route   GET /api/v1/students/:studentId/enrollments
// @access  Private
export const getEnrollments = asyncHandler(async (req, res, next) => {
  if (req.params.courseId) {
    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate({
        path: 'student',
        select: 'name studentId',
      })
      .populate({
        path: 'course',
        select: 'title code',
      });

    return res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } else if (req.params.studentId) {
    const enrollments = await Enrollment.find({ student: req.params.studentId })
      .populate({
        path: 'course',
        select: 'title code credits faculty',
        populate: {
          path: 'faculty',
          select: 'name',
        },
      })
      .populate({
        path: 'student',
        select: 'name studentId',
      });

    return res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single enrollment
// @route   GET /api/v1/enrollments/:id
// @access  Private
export const getEnrollment = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate({
      path: 'course',
      select: 'title code credits',
    })
    .populate({
      path: 'student',
      select: 'name studentId',
      populate: {
        path: 'user',
        select: 'email',
      },
    });

  if (!enrollment) {
    return next(
      new ErrorResponse(`Enrollment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is enrollment owner, admin, or faculty of the course
  if (
    enrollment.student.user._id.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    (req.user.role === 'faculty' && enrollment.course.faculty.toString() !== req.user.id)
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this enrollment`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: enrollment,
  });
});

// @desc    Create enrollment
// @route   POST /api/v1/courses/:courseId/enrollments
// @access  Private/Student
export const createEnrollment = asyncHandler(async (req, res, next) => {
  // Add course and student to req.body
  req.body.course = req.params.courseId;
  
  // Find the student associated with the user
  const student = await Student.findOne({ user: req.user.id });
  
  if (!student) {
    return next(
      new ErrorResponse(`No student found for user ${req.user.id}`, 404)
    );
  }
  
  req.body.student = student._id;

  // Check if course exists
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.courseId}`, 404)
    );
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: req.body.student,
    course: req.params.courseId,
  });

  if (existingEnrollment) {
    return next(
      new ErrorResponse(
        `Student is already enrolled in this course`,
        400
      )
    );
  }

  // Check course capacity
  const enrollmentCount = await Enrollment.countDocuments({
    course: req.params.courseId,
  });

  if (enrollmentCount >= course.maxStudents) {
    return next(
      new ErrorResponse(
        `Course has reached its maximum capacity of ${course.maxStudents} students`,
        400
      )
    );
  }

  const enrollment = await Enrollment.create(req.body);

  res.status(201).json({
    success: true,
    data: enrollment,
  });
});

// @desc    Update enrollment
// @route   PUT /api/v1/enrollments/:id
// @access  Private/Admin/Faculty
export const updateEnrollment = asyncHandler(async (req, res, next) => {
  let enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(
      new ErrorResponse(`Enrollment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is admin or faculty of the course
  if (req.user.role === 'student') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this enrollment`,
        401
      )
    );
  }

  // If faculty, make sure they are the course instructor
  if (req.user.role === 'faculty') {
    const course = await Course.findById(enrollment.course);
    if (course.faculty.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this enrollment`,
          401
        )
      );
    }
  }

  // Update enrollment
  enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // If updating grade, recalculate final grade
  if (req.body.grade) {
    const updatedEnrollment = await Enrollment.findById(req.params.id);
    updatedEnrollment.finalGrade = await updatedEnrollment.calculateFinalGrade();
    await updatedEnrollment.save();
  }

  res.status(200).json({
    success: true,
    data: enrollment,
  });
});

// @desc    Delete enrollment
// @route   DELETE /api/v1/enrollments/:id
// @access  Private/Admin/Faculty
export const deleteEnrollment = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(
      new ErrorResponse(`Enrollment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is admin or faculty of the course
  if (req.user.role === 'student') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this enrollment`,
        401
      )
    );
  }

  // If faculty, make sure they are the course instructor
  if (req.user.role === 'faculty') {
    const course = await Course.findById(enrollment.course);
    if (course.faculty.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this enrollment`,
          401
        )
      );
    }
  }

  await enrollment.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Submit assignment
// @route   PUT /api/v1/enrollments/:id/assignments/:assignmentId
// @access  Private/Student
export const submitAssignment = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(
      new ErrorResponse(`Enrollment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is the student
  const student = await Student.findOne({ user: req.user.id });
  if (enrollment.student.toString() !== student._id.toString()) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to submit this assignment`,
        401
      )
    );
  }

  const assignment = enrollment.assignments.id(req.params.assignmentId);
  if (!assignment) {
    return next(
      new ErrorResponse(
        `Assignment not found with id of ${req.params.assignmentId}`,
        404
      )
    );
  }

  // Update assignment
  assignment.status = 'submitted';
  assignment.submittedDate = Date.now();
  
  if (req.file) {
    assignment.fileUrl = `/uploads/assignments/${req.file.filename}`;
  }

  await enrollment.save();

  res.status(200).json({
    success: true,
    data: assignment,
  });
});

// @desc    Grade assignment
// @route   PUT /api/v1/enrollments/:id/assignments/:assignmentId/grade
// @access  Private/Faculty
export const gradeAssignment = asyncHandler(async (req, res, next) => {
  const { score, feedback } = req.body;
  
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(
      new ErrorResponse(`Enrollment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is the course instructor
  const course = await Course.findById(enrollment.course);
  if (course.faculty.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to grade this assignment`,
        401
      )
    );
  }

  const assignment = enrollment.assignments.id(req.params.assignmentId);
  if (!assignment) {
    return next(
      new ErrorResponse(
        `Assignment not found with id of ${req.params.assignmentId}`,
        404
      )
    );
  }

  // Update assignment
  assignment.status = 'graded';
  assignment.score = score;
  assignment.feedback = feedback;
  
  await enrollment.save();

  // Recalculate final grade
  enrollment.finalGrade = await enrollment.calculateFinalGrade();
  await enrollment.save();

  res.status(200).json({
    success: true,
    data: assignment,
  });
});

// @desc    Record attendance
// @route   POST /api/v1/enrollments/:id/attendance
// @access  Private/Faculty
export const recordAttendance = asyncHandler(async (req, res, next) => {
  const { date, status, notes } = req.body;
  
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(
      new ErrorResponse(`Enrollment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is the course instructor or admin
  const course = await Course.findById(enrollment.course);
  if (course.faculty.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to record attendance`,
        401
      )
    );
  }

  // Check if attendance already recorded for this date
  const existingAttendance = enrollment.attendance.find(
    (a) => a.date.toDateString() === new Date(date).toDateString()
  );

  if (existingAttendance) {
    // Update existing attendance
    existingAttendance.status = status;
    existingAttendance.notes = notes || existingAttendance.notes;
  } else {
    // Add new attendance record
    enrollment.attendance.push({
      date,
      status,
      notes,
    });
  }

  await enrollment.save();

  res.status(200).json({
    success: true,
    data: enrollment.attendance,
  });
});
