import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CourseEditForm from '../components/CourseDetails/CourseEditForm';
import EnrolledStudentsTable from '../components/CourseDetails/EnrolledStudentsTable';
import DeleteDialog from '../components/CourseDetails/DeleteDialog';
import Dialog from '../components/CourseDetails/Dialog';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState({ show: false, type: '', message: '', title: '' });
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(response.data.course);
      
      // If user is instructor, also fetch enrolled students
      if (user?.role === 'instructor' && response.data.course.instructor === user?.id) {
        fetchEnrolledStudents();
      }
    } catch (err) {
      setError('Failed to load course details. Please try again.');
      console.error('Error fetching course details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      setStudentsLoading(true);
      const response = await axios.get(`${BASE_URL}/api/enrollments/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrolledStudents(response.data.students);
    } catch (err) {
      console.error('Error fetching enrolled students:', err);
      // Don't show error for students fetch as it's secondary functionality
    } finally {
      setStudentsLoading(false);
    }
  };

  const showDialog = (type, title, message) => {
    setDialog({ show: true, type, title, message });
  };

  const closeDialog = () => {
    setDialog({ show: false, type: '', message: '', title: '' });
  };

  const handleEnroll = async () => {
    try {
      await axios.post(`${BASE_URL}/api/enrollments/${courseId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showDialog('success', 'Enrollment Successful!', `You have successfully enrolled in "${course.title}".`);
      fetchCourseDetails();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to enroll in the course.';
      showDialog('error', 'Enrollment Failed', errorMessage);
    }
  };

  const handleUpdateCourse = async (formData) => {
    try {
      await axios.put(`${BASE_URL}/api/courses/${courseId}`, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showDialog('success', 'Course Updated!', `Course "${formData.title}" has been updated successfully.`);
      setShowEditForm(false);
      fetchCourseDetails();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update course.';
      showDialog('error', 'Update Failed', errorMessage);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showDialog('success', 'Course Deleted!', `Course "${course.title}" has been deleted successfully.`);
      setShowDeleteDialog(false);
      // Navigate back to courses page after a delay
      setTimeout(() => {
        navigate('/courses');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete course.';
      showDialog('error', 'Deletion Failed', errorMessage);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={fetchCourseDetails}
              className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="text-gray-600 mb-4">Course not found.</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const isEnrolled = course.studentsEnrolled && course.studentsEnrolled.includes(user?.id);
  const isInstructor = user?.role === 'instructor' && course.instructor === user?.id;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Courses
            </button>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-light text-gray-900 mb-3">{course.title}</h1>
              <p className="text-gray-600 mb-4">{course.description}</p>
              
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span>Created {formatDate(course.createdAt)}</span>
                <span>•</span>
                <span>Last updated {formatDate(course.updatedAt)}</span>
              </div>
            </div>
            
            <div className="ml-6 flex-shrink-0">
              {user?.role === 'student' && (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolled}
                  className={`px-6 py-3 text-sm rounded-lg transition-colors ${
                    isEnrolled
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {isEnrolled ? 'Already Enrolled' : 'Enroll in Course'}
                </button>
              )}
              
              {isInstructor && (
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowEditForm(true)}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    Edit Course
                  </button>
                  <button 
                    onClick={() => setShowDeleteDialog(true)}
                    className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:border-red-300 transition-colors"
                  >
                    Delete Course
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Course Content</h2>
          
          {course.content ? (
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {course.content}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mb-2">No content available yet</p>
              <p className="text-sm text-gray-400">
                {isInstructor ? 'Click "Edit Course" to add content.' : 'The instructor hasn\'t added any content to this course.'}
              </p>
            </div>
          )}
        </div>

        {/* Enrolled Students Table - Only for Instructors */}
        {isInstructor && (
          <div className="mt-8">
            <EnrolledStudentsTable 
              students={enrolledStudents} 
              loading={studentsLoading}
            />
          </div>
        )}

        
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <CourseEditForm
          course={course}
          onSubmit={handleUpdateCourse}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        show={showDeleteDialog}
        courseName={course?.title}
        onConfirm={handleDeleteCourse}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* Dialog */}
      <Dialog
        show={dialog.show}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onClose={closeDialog}
      />
    </div>
  );
};

export default CourseDetailsPage;