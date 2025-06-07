const express = require('express');
const { createCourse, updateCourse, deleteCourse, getCourseById, getCoursesByInstructor, getAllCourses } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { instructorAccess } = require('../middleware/accessControlMiddleware');


const router = express.Router();

router.use(protect);

router.post('/',instructorAccess,createCourse);
router.put('/:id',instructorAccess, updateCourse);
router.delete('/:id',instructorAccess, deleteCourse);
router.get('/:id',getCourseById);
router.get('/instructor/:instructorId', instructorAccess, getCoursesByInstructor);
router.get('/', getAllCourses);



module.exports = router;
