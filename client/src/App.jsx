import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import ClientRequestPage from "./pages/ClientRequestPage";
import RequestsListPage from "./pages/RequestsListPage";

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
        <Route path="/" element={<Navigate to="/requests/new" replace />} />
        <Route path="/requests/new" element={<ClientRequestRoute />} />
        <Route path="/requests" element={<RequestsListRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
