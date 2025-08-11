import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      required: [true, 'Please add a student ID'],
      unique: true,
      trim: true,
      maxlength: [20, 'Student ID cannot be more than 20 characters'],
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
    year: {
      type: Number,
      required: [true, 'Please add an academic year'],
      min: [1, 'Year must be at least 1'],
      max: [4, 'Year cannot be more than 4'],
    },
    semester: {
      type: Number,
      required: [true, 'Please add a semester'],
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot be more than 8'],
    },
    section: {
      type: String,
      required: [true, 'Please add a section'],
      uppercase: true,
      maxlength: [1, 'Section cannot be more than 1 character'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please add a date of birth'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Please select a gender'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', null],
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    contactNumber: {
      type: String,
      maxlength: [15, 'Phone number cannot be longer than 15 characters'],
    },
    parentName: {
      type: String,
      required: [true, 'Please add parent/guardian name'],
    },
    parentContact: {
      type: String,
      required: [true, 'Please add parent/guardian contact number'],
    },
    admissionDate: {
      type: Date,
      default: Date.now,
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

// Create student ID from department and year
StudentSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  
  const yearLastTwo = new Date().getFullYear().toString().slice(-2);
  const deptCode = this.department
    .split(' ')
    .map((word) => word[0].toUpperCase())
    .join('');
  
  // Find the count of students in the same department and year
  const count = await this.constructor.countDocuments({
    department: this.department,
    year: this.year,
  });
  
  this.studentId = `${yearLastTwo}${deptCode}${(count + 1)
    .toString()
    .padStart(3, '0')}`;
  
  next();
});

// Cascade delete courses when a student is deleted
StudentSchema.pre('remove', async function (next) {
  await this.model('Enrollment').deleteMany({ student: this._id });
  next();
});

// Reverse populate with virtuals
StudentSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'student',
  justOne: false,
});

export default mongoose.model('Student', StudentSchema);
