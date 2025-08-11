import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Please add an employee ID'],
      unique: true,
      trim: true,
      maxlength: [20, 'Employee ID cannot be more than 20 characters'],
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
    designation: {
      type: String,
      required: [true, 'Please add a designation'],
      enum: [
        'Professor',
        'Associate Professor',
        'Assistant Professor',
        'Lecturer',
        'Visiting Faculty',
        'Adjunct Faculty',
      ],
    },
    qualification: {
      type: String,
      required: [true, 'Please add qualifications'],
      enum: [
        'Ph.D',
        'M.Tech',
        'M.E',
        'M.Sc',
        'B.Tech',
        'B.E',
        'M.Phil',
        'MS',
        'MBA',
      ],
    },
    specialization: {
      type: [String],
      required: [true, 'Please add at least one specialization'],
    },
    dateOfJoining: {
      type: Date,
      required: [true, 'Please add date of joining'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please add date of birth'],
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
    emergencyContact: {
      name: String,
      relationship: String,
      contactNumber: String,
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

// Create employee ID from department and year of joining
FacultySchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  
  const yearLastTwo = new Date(this.dateOfJoining).getFullYear().toString().slice(-2);
  const deptCode = this.department
    .split(' ')
    .map((word) => word[0].toUpperCase())
    .join('');
  
  // Find the count of faculty in the same department and year
  const count = await this.constructor.countDocuments({
    department: this.department,
    dateOfJoining: {
      $gte: new Date(new Date().getFullYear(), 0, 1),
      $lt: new Date(new Date().getFullYear() + 1, 0, 1),
    },
  });
  
  this.employeeId = `F${yearLastTwo}${deptCode}${(count + 1)
    .toString()
    .padStart(3, '0')}`;
  
  next();
});

// Reverse populate with virtuals
FacultySchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'faculty',
  justOne: false,
});

// Cascade delete courses when a faculty is deleted
FacultySchema.pre('remove', async function (next) {
  await this.model('Course').deleteMany({ faculty: this._id });
  next();
});

export default mongoose.model('Faculty', FacultySchema);
