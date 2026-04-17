import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [status, setStatus] = useState("Checking backend...");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`);

        if (!response.ok) {
          throw new Error("Backend responded with an error.");
        }

        const data = await response.json();
        setStatus(`${data.message} at ${new Date(data.timestamp).toLocaleString()}`);
      } catch (err) {
        setError("Could not reach the backend. Make sure the server is running.");
      }
    };

    checkApi();
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">MERN Stack</p>
        <h1>Project setup is ready.</h1>
        <p className="lead">
          React is serving from the client, Express is wired on the server, and MongoDB
          is ready to connect through Mongoose.
        </p>
        <div className="status-box">
          <strong>API status:</strong>
          <span>{error || status}</span>
        </div>
      </section>
    </main>
  );
}

export default App;
