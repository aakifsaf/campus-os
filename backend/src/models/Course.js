import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a course title'],
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Please add a course code'],
      unique: true,
      trim: true,
      maxlength: [20, 'Code cannot be more than 20 characters'],
    },
    credits: {
      type: Number,
      required: [true, 'Please add number of credits'],
      min: [1, 'Credits must be at least 1'],
      max: [10, 'Credits cannot be more than 10'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    department: {
      type: String,
      required: [true, 'Please add a department'],
      enum: [
        'Computer Science',
        'Information Technology',
        'Electronics and Communication',
        'Electrical and Electronics',
        'Mechanical',
        'Civil',
        'Biotechnology',
        'Aeronautical',
        'Automobile',
        'Mechatronics',
      ],
    },
    faculty: {
      type: mongoose.Schema.ObjectId,
      ref: 'Faculty',
      required: [true, 'Please add a faculty member'],
    },
    semester: {
      type: Number,
      required: [true, 'Please add a semester'],
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot be more than 8'],
    },
    academicYear: {
      type: String,
      required: [true, 'Please add an academic year'],
      match: [/^\d{4}-\d{4}$/, 'Please use format YYYY-YYYY'],
    },
    maxStudents: {
      type: Number,
      required: [true, 'Please add maximum number of students'],
      min: [1, 'Maximum students must be at least 1'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Reverse populate with virtuals
CourseSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course',
  justOne: false,
});

// Cascade delete enrollments when a course is deleted
CourseSchema.pre('remove', async function (next) {
  await this.model('Enrollment').deleteMany({ course: this._id });
  next();
});

// Static method to get average cost of course tuitions
CourseSchema.statics.getAverageCost = async function (courseId) {
  const obj = await this.aggregate([
    {
      $match: { course: courseId },
    },
    {
      $group: {
        _id: '$course',
        averageCost: { $avg: '$tuition' },
      },
    },
  ]);

  try {
    await this.model('Course').findByIdAndUpdate(courseId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.course);
});

// Call getAverageCost before remove
CourseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.course);
});

export default mongoose.model('Course', CourseSchema);
