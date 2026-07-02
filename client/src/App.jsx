import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import AppLayout from "./components/AppLayout";
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
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<ClientDashboardPage />} />
          <Route path="/requests/new" element={<ClientRequestRoute />} />
          <Route path="/requests" element={<RequestsListRoute />} />
          <Route path="/offers" element={<OfferManagementPage />} />
          <Route path="/offers/review" element={<OfferClientReviewPage />} />
          <Route path="/availability" element={<VehicleAvailabilityPage />} />
          <Route path="/scheduling" element={<SchedulingAdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
