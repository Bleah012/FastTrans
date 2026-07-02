import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import AppLayout from "./components/AppLayout";
import { getAuthUser } from "./config/auth";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import ClientRequestPage from "./pages/ClientRequestPage";
import RequestsListPage from "./pages/RequestsListPage";
import NotFoundPage from "./pages/NotFoundPage";
import OfferClientReviewPage from "./pages/OfferClientReviewPage";
import OfferManagementPage from "./pages/OfferManagementPage";
import VehicleAvailabilityPage from "./pages/VehicleAvailabilityPage";
import SchedulingAdminPage from "./pages/SchedulingAdminPage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const authUser = getAuthUser();

  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function AdminRoute({ children }) {
  const location = useLocation();
  const authUser = getAuthUser();
  const canAccessAdminArea =
    authUser?.role === "admin" || authUser?.role === "manager";

  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessAdminArea) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function ClientRequestRoute() {
  const navigate = useNavigate();

  return <ClientRequestPage onViewRequests={() => navigate("/requests")} />;
}

function RequestsListRoute() {
  const navigate = useNavigate();

  return <RequestsListPage onNewRequest={() => navigate("/requests/new")} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<ClientDashboardPage />} />
          <Route path="/requests/new" element={<ClientRequestRoute />} />
          <Route path="/requests" element={<RequestsListRoute />} />
          <Route path="/offers/review" element={<OfferClientReviewPage />} />

          <Route
            path="/offers"
            element={
              <AdminRoute>
                <OfferManagementPage />
              </AdminRoute>
            }
          />
          <Route
            path="/availability"
            element={
              <AdminRoute>
                <VehicleAvailabilityPage />
              </AdminRoute>
            }
          />
          <Route
            path="/scheduling"
            element={
              <AdminRoute>
                <SchedulingAdminPage />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
