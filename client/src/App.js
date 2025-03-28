import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MainLayout from "./layouts/MainLayout";
import AdminRoutes from "./admin/AdminRoutes";

import Login from "./components/Login";
import Home from "./components/Home";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./components/ForgotPassword";
import SchedulePage from "./pages/SchedulePage";
import Profile from "./components/Profile";
import ChangePassword from "./components/ChangePassword";
import Teachers from "./components/Teachers";
import AdminHome from "./admin/Home";
import AdminStudents from "./admin/Students";
import AdminSubjects from "./admin/Subjects";
import AdminSchedules from "./admin/Schedules";
import AdminChats from "./admin/Chats";
import AdminSettings from "./admin/Settings";
import Events from "./admin/Events";
import StudentEvents from "./components/Events";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Home />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <PrivateRoute>
                <MainLayout>
                  <SchedulePage />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/events"
            element={
              <PrivateRoute>
                <MainLayout>
                  <StudentEvents />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Teachers />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <MainLayout>
                  <ChangePassword />
                </MainLayout>
              </PrivateRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute requireAdmin>
                <AdminRoutes />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
