import { Routes, Route, Navigate, Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { auth } from "@/lib/auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Requests from "./pages/Requests";
import Sidebar from "@/components/Sidebar";

function Topbar() {
  const user = auth.getUser();
  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="text-lg font-bold text-blue-600">
          SlotSwapper
        </Link>
        {user ? (
          <span className="text-sm text-gray-500">{user.name}</span>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Topbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 pt-4">
          {/** Sidebar for authenticated routes */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/*"
              element={
                <div className="flex w-full">
                  <Sidebar />
                  <main className="flex-1 min-w-0">
                    <div className="py-4 md:py-6">
                      <Routes>
                        <Route
                          path="dashboard"
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="new-event"
                          element={
                            <ProtectedRoute>
                              <Dashboard showFormInitially />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="marketplace"
                          element={
                            <ProtectedRoute>
                              <Marketplace />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="requests"
                          element={
                            <ProtectedRoute>
                              <Requests />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="*"
                          element={<Navigate to="/dashboard" replace />}
                        />
                      </Routes>
                    </div>
                  </main>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
