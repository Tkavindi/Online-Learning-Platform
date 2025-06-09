import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EnrolledCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/enrollments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update state with the courses from the response
      setCourses(response.data.courses);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch enrolled courses.');
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Enrolled Courses</h1>
        {loading && (
          <div className="text-center">
            <div className="w-8 h-8 border-t-2 border-black rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        )}
        {error && (
          <div className="text-center mb-6 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {!loading && courses.length === 0 && (
          <p className="text-center text-gray-500">No courses enrolled yet.</p>
        )}
        <ul className="space-y-6">
          {courses.map((course) => (
            <li
              key={course.courseId}
              className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors cursor-pointer bg-white shadow-sm"
              onClick={() => handleCourseClick(course.courseId)}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{course.description}</p>
              <p className="text-sm text-gray-500">
                Enrolled At: <span className="font-medium">{new Date(course.enrolledAt).toLocaleDateString()}</span>
              </p>
              <p className="text-sm text-gray-500">
                Progress: <span className="font-medium">{course.progress}%</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EnrolledCoursesPage;