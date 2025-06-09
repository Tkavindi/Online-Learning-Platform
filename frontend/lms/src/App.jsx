import { Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CoursePage from "./pages/CoursePage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import EnrolledCoursesPage from "./pages/EnrolledCoursesPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleBasedRoute from "./routes/RoleBasedRoute";
import LandingPage from "./pages/LandingPage";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Chatbot from "./components/ChatBot";


function App() {
  return (
    <>
      
      <NavBar/>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursePage />
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute>
              <CourseDetailsPage />
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/enrolled-courses"
          element={
            <RoleBasedRoute allowedRoles={["student"]}>
              <EnrolledCoursesPage />
              <Chatbot />
            </RoleBasedRoute>
          }
        />
      </Routes>
      
      <Footer/>
    </>
  );
}

export default App;
