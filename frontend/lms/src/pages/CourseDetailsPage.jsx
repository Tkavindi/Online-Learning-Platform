import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState({ show: false, type: '', message: '', title: '' });
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourse(response.data.course);
    } catch (err) {
      setError('Failed to load course details. Please try again.');
      console.error('Error fetching course details:', err);
    } finally {
      setLoading(false);
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
      await axios.post(
        `${BASE_URL}/api/enrollments/${courseId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showDialog('success', 'Enrollment Successful!', `You have successfully enrolled in "${course.title}".`);
      fetchCourseDetails(); // Refresh course details after enrolling
    } catch (err) {
      console.error('Error enrolling in course:', err);
      
      let errorMessage = 'Failed to enroll in the course. Please try again.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'You are not authorized. Please log in again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to enroll in this course.';
        } else if (err.response.status === 409) {
          errorMessage = 'You are already enrolled in this course.';
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      showDialog('error', 'Enrollment Failed', errorMessage);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  // Dialog Component
  const Dialog = ({ show, type, title, message, onClose }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center mb-4">
              {type === 'success' ? (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  type === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
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
            className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
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
                <span>
                  {course.studentsEnrolled?.length || 0} student
                  {(course.studentsEnrolled?.length || 0) !== 1 ? 's' : ''} enrolled
                </span>
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
                  <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    Edit Course
                  </button>
                  <button className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:border-red-300 transition-colors">
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
              <p className="text-sm text-gray-400">The instructor hasn't added any content to this course.</p>
            </div>
          )}
        </div>

        {/* Additional Course Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Course Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Course ID:</span>
                <span className="text-gray-900 font-mono">{course._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Instructor ID:</span>
                <span className="text-gray-900 font-mono">{course.instructor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Enrolled:</span>
                <span className="text-gray-900">{course.studentsEnrolled?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900">{formatDate(course.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated:</span>
                <span className="text-gray-900">{formatDate(course.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Enrollment Status</h3>
            <div className="space-y-3">
              {isEnrolled ? (
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">You are enrolled in this course</span>
                </div>
              ) : user?.role === 'student' ? (
                <div className="flex items-center text-gray-500">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Click "Enroll in Course" to join</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Only students can enroll in courses</span>
                </div>
              )}
              
              {isInstructor && (
                <div className="flex items-center text-blue-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="font-medium">You are the instructor of this course</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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