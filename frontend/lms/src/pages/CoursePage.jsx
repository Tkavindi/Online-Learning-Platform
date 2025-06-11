import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CourseForm from "../components/CourseDetails/CourseForm";

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState({ show: false, type: "", message: "", title: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, courseId: "", courseTitle: "" });
  const [editingCourse, setEditingCourse] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (token) {
      fetchCourses();
    }
  }, [token]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(""); // Reset error state
      const response = await axios.get(`${BASE_URL}/api/courses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data?.courses || response.data || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      const status = err.response?.status;
      if (status && status !== 404) {
        console.error("Error fetching courses:", err.response?.data || err.message);
        setError("Failed to load courses. Please try again.");
      } else {
        setCourses([]); // Gracefully handle empty courses
        setError("");
      }
    } finally {
      setLoading(false);
    }
  };

  const showDialog = (type, title, message) => {
    setDialog({ show: true, type, title, message });
  };

  const closeDialog = () => {
    setDialog({ show: false, type: "", message: "", title: "" });
  };

  const showDeleteConfirmation = (courseId, courseTitle, e) => {
    e.stopPropagation();
    setDeleteConfirm({ show: true, courseId, courseTitle });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirm({ show: false, courseId: "", courseTitle: "" });
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleEnroll = async (courseId, courseTitle, e) => {
    e.stopPropagation();
    try {
      await axios.post(
        `${BASE_URL}/api/enrollments/${courseId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showDialog("success", "Enrollment Successful!", `You have enrolled in "${courseTitle}".`);
      fetchCourses();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to enroll in the course.";
      showDialog("error", "Enrollment Failed", errorMessage);
    }
  };

  const handleSubmitCourse = async (formData) => {
    try {
      const url = editingCourse
        ? `${BASE_URL}/api/courses/${editingCourse._id}`
        : `${BASE_URL}/api/courses/`;
      const method = editingCourse ? "put" : "post";

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const action = editingCourse ? "Updated" : "Created";
      showDialog("success", `Course ${action}!`, `Course "${formData.title}" has been ${action.toLowerCase()} successfully.`);
      setEditingCourse(null);
      setShowCreateForm(false);
      fetchCourses();
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to ${editingCourse ? "update" : "create"} course.`;
      showDialog("error", `${editingCourse ? "Update" : "Creation"} Failed`, errorMessage);
    }
  };

  const confirmDeleteCourse = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/courses/${deleteConfirm.courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showDialog("success", "Course Deleted!", `Course "${deleteConfirm.courseTitle}" has been deleted.`);
      closeDeleteConfirmation();
      fetchCourses();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete course.";
      showDialog("error", "Deletion Failed", errorMessage);
      closeDeleteConfirmation();
    }
  };

  const startEdit = (course, e) => {
    e.stopPropagation();
    setEditingCourse(course);
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingCourse(null);
    setShowCreateForm(false);
  };

  const DeleteConfirmationDialog = ({ show, courseTitle, onConfirm, onCancel }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete the course <strong>"{courseTitle}"</strong>? This action is permanent.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={onCancel} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:border-gray-400">
                Cancel
              </button>
              <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                Delete Course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Dialog = ({ show, type, title, message, onClose }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${type === "success" ? "bg-green-100" : "bg-red-100"}`}>
                <svg className={`w-5 h-5 ${type === "success" ? "text-green-600" : "text-red-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type === "success" ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end">
              <button onClick={onClose} className={`px-4 py-2 text-sm rounded-lg text-white ${type === "success" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Use courses directly as the backend now handles role-based filtering
  const displayCourses = courses;

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

  if (error && !courses.length) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchCourses} className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-light text-gray-900 mb-2">
              {user?.role === "instructor" ? "My Courses" : "Available Courses"}
            </h1>
            <p className="text-sm text-gray-500">
              {displayCourses.length} course{displayCourses.length !== 1 ? "s" : ""}
              {user?.role === "instructor" ? " created" : " available"}
            </p>
          </div>
          {user?.role === "instructor" && (
            <button onClick={() => setShowCreateForm(true)} className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800">
              Create Course
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {displayCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-6">
              {user?.role === "instructor" ? (
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {user?.role === "instructor" ? "No courses created yet" : "No courses available"}
            </h3>
            <p className="text-gray-500 mb-6">
              {user?.role === "instructor" 
                ? "Create your first course to start teaching and sharing knowledge with students." 
                : "No courses are available at the moment. Check back later for new courses."}
            </p>
            {user?.role === "instructor" && (
              <button onClick={() => setShowCreateForm(true)} className="px-6 py-3 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                Create Your First Course
              </button>
            )}
          </div>
        ) : (
          displayCourses.map((course) => (
            <div
              key={course._id}
              className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => handleCourseClick(course._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">{course.title}</h2>
                  <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <span>Created {new Date(course?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="ml-6 flex-shrink-0">
                  {user?.role === "student" && (
                    <button
                      onClick={(e) => handleEnroll(course._id, course.title, e)}
                      disabled={course.isEnrolled}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        course.isEnrolled
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      {course.isEnrolled ? "Enrolled" : "Enroll"}
                    </button>
                  )}
                  {user?.role === "instructor" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => startEdit(course, e)}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => showDeleteConfirmation(course._id, course.title, e)}
                        className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:border-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {(showCreateForm || editingCourse) && (
        <CourseForm
          isEditing={!!editingCourse}
          onSubmit={handleSubmitCourse}
          onCancel={cancelEdit}
          initialData={editingCourse}
          showDialog={showDialog}
        />
      )}

      <DeleteConfirmationDialog
        show={deleteConfirm.show}
        courseTitle={deleteConfirm.courseTitle}
        onConfirm={confirmDeleteCourse}
        onCancel={closeDeleteConfirmation}
      />

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