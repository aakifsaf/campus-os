import express from 'express';
const uploadRouter = express.Router();
import { protect, authorize } from '../middleware/auth.js';
import { fileUpload, fileSizeFormatter } from '../middleware/upload.js';
import path from 'path';
import fs from 'fs';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from 'express-async-handler';

// @desc    Upload file
// @route   POST /api/v1/upload
// @access  Private
export const uploadFile = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.file;

  // Check file size
  if (file.size > parseInt(process.env.MAX_FILE_UPLOAD || 1000000)) {
    // Remove the uploaded file if it's too large
    fs.unlinkSync(file.path);
    return next(
      new ErrorResponse(
        `Please upload an file less than ${fileSizeFormatter(
          parseInt(process.env.MAX_FILE_UPLOAD || 1000000)
        )}`,
        400
      )
    );
  }

  res.status(200).json({
    success: true,
    data: {
      fileName: file.filename,
      filePath: `/uploads/${file.filename}`,
      fileSize: fileSizeFormatter(file.size),
    },
  });
});

// @desc    Delete file
// @route   DELETE /api/v1/upload/:filename
// @access  Private
export const deleteFile = asyncHandler(async (req, res, next) => {
  const filePath = path.join(
    process.env.FILE_UPLOAD_PATH || './public/uploads',
    req.params.filename
  );

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem deleting file`, 500));
      }
      res.status(200).json({
        success: true,
        data: {},
      });
    });
  } else {
    return next(
      new ErrorResponse(`File not found with name ${req.params.filename}`, 404)
    );
  }
});

// Initialize upload middleware with different configurations
const upload = fileUpload.single('file');

// Route for general file uploads
uploadRouter.post('/', protect, (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      return next(new ErrorResponse(`Error uploading file: ${err.message}`, 400));
    }
    next();
  });
}, uploadFile);

// Route for deleting files
uploadRouter.delete('/:filename', protect, deleteFile);

export default uploadRouter;
