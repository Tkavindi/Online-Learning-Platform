const Course = require('../models/courseModel');
const User = require('../models/userModel');
const Enrollment = require('../models/enrollmentModel');


// Create a new course 
const createCourse = async (req, res) => {
  try {
    const { title, description, content } = req.body;
    const course = await Course.create({
      title,
      description,
      content,
      instructor: req.user.id
    });
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Create Course Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a course
const updateCourse = async (req,res) =>{
    try {
        const { id } = req.params;
        const instructorId = req.user.id;
    
        const course = await Course.findById(id);
    
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
    
        // Check if the logged-in user is the course's instructor
        if (course.instructor.toString() !== instructorId) {
          return res.status(403).json({ message: 'You are not authorized to update this course' });
        }

        const { title, description, content } = req.body;

        const updateData = {};

        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (content) updateData.content = content;

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        if(!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course updated successfully', course: updatedCourse });
}
    catch (error) {
        console.error('Update Course Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a course
const deleteCourse = async (req, res) =>{
    try{
        const { id } = req.params;
        const instructorId = req.user.id;
    
        const course = await Course.findById(id);
    
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
    
        // Check if the logged-in user is the course's instructor
        if (course.instructor.toString() !== instructorId) {
          return res.status(403).json({ message: 'You are not authorized to update this course' });
        }

        const deletedCourse = await Course.findByIdAndDelete(id);
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully' });
    }
    catch (error){
        console.error('Delete Course Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single course by Id
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const courses = await Course.findById(id);
        if (!courses) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ course: courses });
    }
    catch (error) {
        console.error('Get Course By Id Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all courses from a specific instructor
const getCoursesByInstructor = async (req, res) => {
    try {
        const { instructorId } = req.params;
        const courses = await Course.find({ instructor: instructorId });
        if (courses.length === 0) {
            return res.status(404).json({ message: 'No courses found for this instructor' });
        }
        res.status(200).json({ courses });

    }
    catch (error) {
        console.error('Get Courses By Instructor Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all courses - Modified to handle role-based filtering
const getAllCourses = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        let courses;
        
        if (userRole === 'instructor') {
            // Instructors see only their own courses
            courses = await Course.find({ instructor: userId });
        } else {
            // Students and other roles see all courses
            courses = await Course.find();
        }

        // Always return courses array, even if empty
        if (courses.length === 0) {
            return res.status(200).json({ courses: [] });
        }

        if (userRole === 'student') {
            // For students, check enrollment status
            const enrollments = await Enrollment.find({ student: userId });
            const enrolledCourseIds = new Set(enrollments.map(e => e.course.toString()));

            const coursesWithEnrollment = courses.map(course => ({
                ...course.toObject(),
                isEnrolled: enrolledCourseIds.has(course._id.toString())
            }));

            return res.status(200).json({ courses: coursesWithEnrollment });
        } else {
            // For instructors, return courses as is
            return res.status(200).json({ courses });
        }
    } catch (error) {
        console.error('Get All Courses Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseById,
  getCoursesByInstructor,
  getAllCourses
}