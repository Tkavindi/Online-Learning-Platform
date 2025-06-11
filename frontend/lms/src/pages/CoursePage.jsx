import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CourseForm from "../components/CourseDetails/CourseForm";
import Dialog from "../components/Common/Dialog";

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
        response = await axios.get(`${BASE_URL}/api/courses/instructor/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.get(`${BASE_URL}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCourse = async (courseData, isEditing = false) => {
    try {
      if (isEditing) {
        await axios.put(
          `${BASE_URL}/api/courses/${courseData._id}`,
          courseData,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        showDialog("success", "Success", "Course updated successfully");
      } else {
        await axios.post(
          `${BASE_URL}/api/courses`,
          courseData,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        showDialog("success", "Success", "Course created successfully");
      }
      setShowCreateForm(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      showDialog("error", "Error", "Failed to save course");
      console.error(err);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await axios.delete(`${BASE_URL}/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showDialog("success", "Success", "Course deleted successfully");
      fetchCourses();
    } catch (err) {
      showDialog("error", "Error", "Failed to delete course");
      console.error(err);
    }
    setDeleteConfirm({ show: false, courseId: "", courseTitle: "" });
  };

  const handleEnroll = async (courseId, courseTitle, e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${BASE_URL}/api/enrollments`,
        { courseId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      showDialog("success", "Success", `Successfully enrolled in ${courseTitle}`);
      fetchCourses();
    } catch (err) {
      showDialog("error", "Error", "Failed to enroll in course");
      console.error(err);
    }
  };

  const showDialog = (type, title, message) => {
    setDialog({ show: true, type, title, message });
  };

  const closeDialog = () => {
    setDialog({ show: false, type: "", message: "", title: "" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading courses...</p>
      </div>
    );
  }

  const isInstructor = user?.role === "instructor";
  const hasNoCourses = courses.length === 0;

  if (isInstructor && hasNoCourses) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-semibold mb-4">Welcome to WiseLearn!</h1>
          <p className="text-gray-600 mb-8">You haven't created any courses yet.</p>
          <div className="bg-gray-50 rounded-lg p-8 max-w-lg mx-auto">
            <div className="mb-6">
              <svg 
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
              <h2 className="text-xl font-medium mb-2">Create Your First Course</h2>
              <p className="text-gray-600 mb-6">
                Start sharing your knowledge by creating your first course. 
                Your expertise could help students achieve their goals.
              </p>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Create First Course
              </button>
            </div>
          </div>
        </div>

        {showCreateForm && (
          <CourseForm
            isEditing={false}
            onSubmit={handleSubmitCourse}
            onCancel={() => setShowCreateForm(false)}
            initialData={null}
          />
        )}

        <Dialog
          show={dialog.show}
          type={dialog.type}
          title={dialog.title}
          message={dialog.message}
          onClose={closeDialog}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold">
              {isInstructor ? "My Courses" : "Available Courses"}
            </h1>
            <p className="text-sm text-gray-500">
              {courses.length} course{courses.length !== 1 ? "s" : ""} {isInstructor ? "created" : "available"}
            </p>
          </div>
          {isInstructor && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create New Course
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium">{course.title}</h2>
                  <p className="text-sm text-gray-600">{course.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {isInstructor ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingCourse(course);
                          setShowCreateForm(true);
                        }}
                        className="text-sm px-3 py-1 text-gray-600 hover:text-black"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({
                          show: true,
                          courseId: course._id,
                          courseTitle: course.title
                        })}
                        className="text-sm px-3 py-1 text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => handleEnroll(course._id, course.title, e)}
                      disabled={course.isEnrolled}
                      className={`px-3 py-1 rounded text-sm ${
                        course.isEnrolled
                          ? "bg-gray-200 text-gray-500"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      {course.isEnrolled ? "Enrolled" : "Enroll"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreateForm && (
        <CourseForm
          isEditing={!!editingCourse}
          onSubmit={handleSubmitCourse}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingCourse(null);
          }}
          initialData={editingCourse}
        />
      )}

      <Dialog
        show={deleteConfirm.show}
        type="confirm"
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteConfirm.courseTitle}"?`}
        onConfirm={() => handleDeleteCourse(deleteConfirm.courseId)}
        onCancel={() => setDeleteConfirm({ show: false, courseId: "", courseTitle: "" })}
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