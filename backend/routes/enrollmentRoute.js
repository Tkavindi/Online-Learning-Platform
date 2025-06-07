const express = require('express');
const { enrollStudent, getEnrolledCourses, getEnrolledStudents } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');


const router = express.Router();

router.use(protect);

router.post('/:courseId', enrollStudent);
router.get('/', getEnrolledCourses);
router.get('/:courseId',getEnrolledStudents);


module.exports = router;
