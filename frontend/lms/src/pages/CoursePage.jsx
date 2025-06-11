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
  }, [token, user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");
      let response;

      if (user?.role === "instructor") {
        // Fetch courses created only by this instructor
        response = await axios.get(`${BASE_URL}/api/courses/instructor/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Fetch all courses for students
        response = await axios.get(`${BASE_URL}/api/courses/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const data = response.data?.courses || response.data || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      const status = err.response?.status;
      if (status && status !== 404) {
        console.error("Error fetching courses:", err.response?.data || err.message);
        setError("Failed to load courses. Please try again.");
      } else {
        // If 404 or no courses found, treat as empty list without error
        setCourses([]);
        setError("");
      }
    } finally {
      setLoading(false);
    }
  };

  // -- rest of your code remains unchanged --

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
      <div className="border-b border-gray-100 py-4 px-6 md:px-10">
        <h2 className="font-semibold text-xl text-black">Courses</h2>
      </div>

      {/* Create Course button (only for instructors) */}
      {user?.role === "instructor" && !showCreateForm && courses.length === 0 && (
        <div className="p-6">
          <p className="mb-4 text-gray-700">You have no courses yet. Create your first course now!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800"
          >
            Create First Course
          </button>
        </div>
      )}

      {/* Show course creation/edit form */}
      {showCreateForm && (
        <CourseForm
          course={editingCourse}
          onCancel={cancelEdit}
          onSubmit={handleSubmitCourse}
        />
      )}

      {/* Show list of courses */}
      {!showCreateForm && (
        <>
          {displayCourses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No courses available.</div>
          ) : (
            <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {displayCourses.map((course) => (
                <div
                  key={course._id}
                  className="border rounded-lg p-4 cursor-pointer hover:shadow-lg"
                  onClick={() => handleCourseClick(course._id)}
                >
                  <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  {user?.role === "student" && (
                    <button
                      onClick={(e) => handleEnroll(course._id, course.title, e)}
                      className="px-3 py-1 bg-black text-white rounded-md hover:bg-gray-800"
                    >
                      Enroll
                    </button>
                  )}
                  {user?.role === "instructor" && (
                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={(e) => startEdit(course, e)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => showDeleteConfirmation(course._id, course.title, e)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <Dialog {...dialog} onClose={closeDialog} />
      <DeleteConfirmationDialog
        show={deleteConfirm.show}
        courseTitle={deleteConfirm.courseTitle}
        onConfirm={confirmDeleteCourse}
        onCancel={closeDeleteConfirmation}
      />
    </div>
  );
};

export default CoursePage;
