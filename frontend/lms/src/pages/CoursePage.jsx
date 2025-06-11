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

      let url;
      if (user?.role === "instructor") {
        url = `${BASE_URL}/api/courses/instructor/${user._id}`;
      } else {
        url = `${BASE_URL}/api/courses/`;
      }

      const response = await axios.get(url, {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error && !courses.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {user?.role === "instructor" ? "My Courses" : "Available Courses"}
      </h1>

      {user?.role === "instructor" && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create Course
        </button>
      )}

      {courses.map((course) => (
        <div
          key={course._id}
          onClick={() => handleCourseClick(course._id)}
          className="border p-4 rounded mb-4 hover:bg-gray-50 cursor-pointer"
        >
          <h2 className="text-lg font-semibold">{course.title}</h2>
          <p className="text-sm text-gray-600">{course.description}</p>
          {user?.role === "student" && (
            <button
              onClick={(e) => handleEnroll(course._id, course.title, e)}
              className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded"
            >
              {course.isEnrolled ? "Enrolled" : "Enroll"}
            </button>
          )}
          {user?.role === "instructor" && (
            <div className="mt-2 space-x-2">
              <button onClick={(e) => startEdit(course, e)} className="px-3 py-1 border rounded text-sm">
                Edit
              </button>
              <button
                onClick={(e) => showDeleteConfirmation(course._id, course.title, e)}
                className="px-3 py-1 text-red-600 border border-red-300 rounded text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}

      {(showCreateForm || editingCourse) && (
        <CourseForm
          isEditing={!!editingCourse}
          onSubmit={handleSubmitCourse}
          onCancel={cancelEdit}
          initialData={editingCourse}
          showDialog={showDialog}
        />
      )}
    </div>
  );
};

export default CoursePage;
