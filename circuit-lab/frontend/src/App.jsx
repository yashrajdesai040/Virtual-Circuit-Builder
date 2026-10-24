import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomCursor from "./components/CustomCursor";
import PageTransition from "./components/PageTransition";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Components from "./pages/Components";
import Builder from "./pages/Builder";
import Tutorials from "./pages/Tutorials";
import Share from "./pages/Share";
import CircuitView from "./pages/CircuitView";
import Profile from "./pages/Profile";
import FollowList from "./components/FollowList";
import PeopleSearch from "./components/PeopleSearch";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition><Dashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/components"
          element={
            <ProtectedRoute>
              <PageTransition><Components /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <PageTransition><Builder /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder/:id"
          element={
            <ProtectedRoute>
              <PageTransition><Builder /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutorials"
          element={
            <ProtectedRoute>
              <PageTransition><Tutorials /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/share"
          element={
            <ProtectedRoute>
              <PageTransition><Share /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/circuits/:id"
          element={
            <ProtectedRoute>
              <PageTransition><CircuitView /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/u/:username"
          element={
            <ProtectedRoute>
              <PageTransition><Profile /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/u/:username/followers"
          element={
            <ProtectedRoute>
              <PageTransition><FollowList /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/u/:username/following"
          element={
            <ProtectedRoute>
              <PageTransition><FollowList /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/people"
          element={
            <ProtectedRoute>
              <PageTransition><PeopleSearch /></PageTransition>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <ThemeProvider>
          <CustomCursor />
          <AuthProvider>
            <AnimatedRoutes />
          </AuthProvider>
        </ThemeProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}