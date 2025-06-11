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
    if (token && user) {
      fetchCourses();
    }
  }, [token, user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (user.role === "instructor") {
        response = await axios.get(`${BASE_URL}/api/courses/instructor/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.get(`${BASE_URL}/api/courses/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const data = response.data?.courses || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      const status = err.response?.status;
      if (status && status !== 404) {
        setError("Failed to load courses. Please try again.");
        console.error(err);
      } else {
        setCourses([]);
        setError("");
      }
    } finally {
      setLoading(false);
    }
  };

  const showDialog = (type, title, message) => {
    setDialog({ show: true, type, title, message });
  };

  const closeDialog = () => setDialog({ show: false, type: "", message: "", title: "" });

  const showDeleteConfirmation = (courseId, courseTitle, e) => {
    e.stopPropagation();
    setDeleteConfirm({ show: true, courseId, courseTitle });
  };

  const closeDeleteConfirmation = () => setDeleteConfirm({ show: false, courseId: "", courseTitle: "" });

  const handleCourseClick = (courseId) => navigate(`/courses/${courseId}`);

  const handleEnroll = async (courseId, courseTitle, e) => {
    e.stopPropagation();
    try {
      await axios.post(`${BASE_URL}/api/enrollments/${courseId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
          <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
          <p className="mb-6">Are you sure you want to delete <strong>{courseTitle}</strong>?</p>
          <div className="flex justify-end space-x-3">
            <button onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
            <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
          </div>
        </div>
      </div>
    );
  };

  const Dialog = ({ show, type, title, message, onClose }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
          <h2 className={`text-lg font-semibold mb-2 ${type === "success" ? "text-green-600" : "text-red-600"}`}>
            {title}
          </h2>
          <p className="mb-4">{message}</p>
          <button onClick={onClose} className={`px-4 py-2 text-white rounded ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
            OK
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading courses...</p>
      </div>
    );
  }

  if (error && !courses.length) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchCourses} className="px-4 py-2 bg-black text-white rounded">Try Again</button>
      </div>
    );
  }

  const isInstructor = user?.role === "instructor";
  const hasNoCourses = courses.length === 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4 flex justify-between items-center border-b">
        <div>
          <h1 className="text-2xl font-semibold">{isInstructor ? "My Courses" : "Available Courses"}</h1>
          <p className="text-sm text-gray-500">{courses.length} course{courses.length !== 1 ? "s" : ""} {isInstructor ? "created" : "available"}</p>
        </div>
        {isInstructor && (
          <button onClick={() => setShowCreateForm(true)} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
            Create Course
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {hasNoCourses ? (
          <div className="text-center text-gray-500">
            <p className="mb-4">{isInstructor ? "You haven't created any courses yet." : "No courses available."}</p>
            {isInstructor && (
              <button onClick={() => setShowCreateForm(true)} className="px-4 py-2 bg-black text-white rounded">
                Create First Course
              </button>
            )}
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course._id}
              className="p-4 border rounded hover:shadow cursor-pointer transition"
              onClick={() => handleCourseClick(course._id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium">{course.title}</h2>
                  <p className="text-sm text-gray-600">{course.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Created: {new Date(course.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  {user?.role === "student" && (
                    <button
                      onClick={(e) => handleEnroll(course._id, course.title, e)}
                      disabled={course.isEnrolled}
                      className={`px-3 py-1 rounded text-sm ${course.isEnrolled ? "bg-gray-200 text-gray-500" : "bg-black text-white hover:bg-gray-800"}`}
                    >
                      {course.isEnrolled ? "Enrolled" : "Enroll"}
                    </button>
                  )}
                  {isInstructor && (
                    <div className="flex space-x-2">
                      <button onClick={(e) => startEdit(course, e)} className="border px-3 py-1 text-sm rounded">Edit</button>
                      <button onClick={(e) => showDeleteConfirmation(course._id, course.title, e)} className="border px-3 py-1 text-sm text-red-600 rounded">Delete</button>
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
