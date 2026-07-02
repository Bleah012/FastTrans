import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import AppLayout from "./components/AppLayout";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import ClientRequestPage from "./pages/ClientRequestPage";
import RequestsListPage from "./pages/RequestsListPage";
import NotFoundPage from "./pages/NotFoundPage";

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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ClientDashboardPage />} />
          <Route path="/requests/new" element={<ClientRequestRoute />} />
          <Route path="/requests" element={<RequestsListRoute />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
