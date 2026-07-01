import { useState } from "react";
import "./App.css";
import ClientRequestPage from "./pages/ClientRequestPage";
import RequestsListPage from "./pages/RequestsListPage";

function App() {
  const [activePage, setActivePage] = useState("request");

  // Shows the client request form page.
  const showRequestPage = () => {
    setActivePage("request");
  };

  // Shows the submitted requests list page.
  const showRequestsListPage = () => {
    setActivePage("requests");
  };

  return activePage === "request" ? (
    <ClientRequestPage onViewRequests={showRequestsListPage} />
  ) : (
    <RequestsListPage onNewRequest={showRequestPage} />
  );
}

export default App;
