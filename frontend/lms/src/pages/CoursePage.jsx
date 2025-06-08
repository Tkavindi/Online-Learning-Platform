import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState({ show: false, type: '', message: '', title: '' });
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/courses/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourses(response.data.courses || []);
    } catch (err) {
      setError('Failed to load courses. Please try again.');
      console.error('Error fetching courses:', err);
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

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleEnroll = async (courseId, courseTitle) => {
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

      showDialog('success', 'Enrollment Successful!', `You have successfully enrolled in "${courseTitle}".`);
      fetchCourses(); // Refresh courses after enrolling
    } catch (err) {
      console.error('Error enrolling in course:', err);
      
      // Handle different error scenarios
      let errorMessage = 'Failed to enroll in the course. Please try again.';
      
      if (err.response) {
        // Server responded with error status
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
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      showDialog('error', 'Enrollment Failed', errorMessage);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCourses}
            className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-gray-900 mb-2">Available Courses</h1>
              <p className="text-sm text-gray-500">
                {courses.length} course{courses.length !== 1 ? 's' : ''} available
              </p>
            </div>
            {user?.role === 'instructor' && (
              <button className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                Create Course
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No courses available yet.</p>
            {user?.role === 'instructor' && (
              <button className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                Create First Course
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => handleCourseClick(course._id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">
                      {course.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-3">
                      {course.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span>Created {formatDate(course.createdAt)}</span>
                      <span>•</span>
                      <span>
                        {course.studentsEnrolled.length} student
                        {course.studentsEnrolled.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="ml-6 flex-shrink-0">
                    {user?.role === 'student' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnroll(course._id, course.title);
                        }}
                        disabled={course.studentsEnrolled.includes(user.id)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                          course.studentsEnrolled.includes(user.id)
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                      >
                        {course.studentsEnrolled.includes(user.id)
                          ? 'Enrolled'
                          : 'Enroll'}
                      </button>
                    )}
                    {user?.role === 'instructor' && course.instructor === user.id && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:border-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Content Preview */}
                <div className="border-t border-gray-100 pt-4">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors list-none flex items-center">
                      <span>Course Content</span>
                      <svg
                        className="w-4 h-4 ml-2 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="mt-3 text-sm text-gray-600 leading-relaxed">
                      {course.content || 'No content preview available.'}
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
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

export default CoursePage;