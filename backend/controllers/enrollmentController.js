const Enrollment = require('../models/enrollmentModel');

// Enroll a student in a course
const enrollStudent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId
    });

    res.status(201).json({ message: 'Enrollment successful', enrollment });
  } catch (error) {
    console.error('Enroll Student Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get list of enrolled courses by specific student
const getEnrolledCourses = async (req, res) => {
  
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({ student: studentId }).populate('course');

  const courses = enrollments
  .filter(enrollment => enrollment.course !== null)
  .map(enrollment => ({
    courseId: enrollment.course._id,
    title: enrollment.course.title,
    description: enrollment.course.description,
    enrolledAt: enrollment.enrolledAt,
    progress: enrollment.progress
  }));


    res.status(200).json({ courses });
} catch (error) {
    console.error('Get Enrolled Courses Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get list of students enrolled in a specific course
const getEnrolledStudents = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const enrollments = await Enrollment.find({ course: courseId }).populate('student');

    const students = enrollments.map(enrollment => ({
      studentId: enrollment.student._id,
      name: enrollment.student.name,
      username: enrollment.student.username,
      enrolledAt: enrollment.enrolledAt
    }));

    res.status(200).json({ students });
  } catch (error) {
    console.error('Get Enrolled Students Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  enrollStudent,
  getEnrolledCourses,
  getEnrolledStudents
};

