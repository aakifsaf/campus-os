import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'Please add a student'],
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'Please add a course'],
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['enrolled', 'completed', 'dropped', 'failed'],
      default: 'enrolled',
    },
    grade: {
      type: String,
      enum: [
        'A+',
        'A',
        'A-',
        'B+',
        'B',
        'B-',
        'C+',
        'C',
        'C-',
        'D+',
        'D',
        'F',
        'I', // Incomplete
        'W', // Withdrawn
        'AU', // Audit
        null,
      ],
    },
    attendance: [
      {
        date: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          enum: ['present', 'absent', 'late', 'excused'],
          required: true,
        },
        notes: String,
      },
    ],
    assignments: [
      {
        title: {
          type: String,
          required: true,
        },
        description: String,
        dueDate: Date,
        submittedDate: Date,
        status: {
          type: String,
          enum: ['not_submitted', 'submitted', 'graded', 'late'],
          default: 'not_submitted',
        },
        score: Number,
        maxScore: Number,
        feedback: String,
        fileUrl: String,
      },
    ],
    exams: [
      {
        title: {
          type: String,
          required: true,
        },
        examType: {
          type: String,
          enum: ['quiz', 'midterm', 'final', 'project', 'presentation'],
          required: true,
        },
        date: Date,
        score: Number,
        maxScore: Number,
        weightage: Number,
        notes: String,
      },
    ],
    finalGrade: {
      type: String,
      enum: [
        'A+',
        'A',
        'A-',
        'B+',
        'B',
        'B-',
        'C+',
        'C',
        'C-',
        'D+',
        'D',
        'F',
        'I',
        'W',
        'AU',
        null,
      ],
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

// Prevent duplicate enrollments
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Calculate final grade based on assignments and exams
EnrollmentSchema.methods.calculateFinalGrade = async function () {
  // Implementation for calculating final grade
  // This is a simplified example - adjust based on your grading policy
  
  const assignmentsTotal = this.assignments.reduce(
    (sum, assignment) => sum + (assignment.score || 0),
    0
  );
  
  const examsTotal = this.exams.reduce(
    (sum, exam) => sum + (exam.score || 0),
    0
  );
  
  const totalScore = assignmentsTotal + examsTotal;
  
  // Simple grading scale - adjust as needed
  if (totalScore >= 90) return 'A';
  if (totalScore >= 80) return 'B';
  if (totalScore >= 70) return 'C';
  if (totalScore >= 60) return 'D';
  return 'F';
};

// Calculate attendance percentage
EnrollmentSchema.virtual('attendancePercentage').get(function () {
  if (!this.attendance || this.attendance.length === 0) return 0;
  
  const presentCount = this.attendance.filter(
    (a) => a.status === 'present' || a.status === 'late'
  ).length;
  
  return Math.round((presentCount / this.attendance.length) * 100);
});

// Calculate current grade percentage
EnrollmentSchema.virtual('currentGradePercentage').get(function () {
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // Calculate assignments
  this.assignments.forEach((assignment) => {
    if (assignment.score !== undefined && assignment.maxScore) {
      totalScore += assignment.score;
      maxPossibleScore += assignment.maxScore;
    }
  });
  
  // Calculate exams
  this.exams.forEach((exam) => {
    if (exam.score !== undefined && exam.maxScore) {
      totalScore += exam.score;
      maxPossibleScore += exam.maxScore;
    }
  });
  
  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
});

// Update course's average cost when enrollment is saved
EnrollmentSchema.post('save', async function () {
  await this.constructor.getAverageCost(this.course);
});

// Update course's average cost when enrollment is removed
EnrollmentSchema.post('remove', async function () {
  await this.constructor.getAverageCost(this.course);
});

export default mongoose.model('Enrollment', EnrollmentSchema);
