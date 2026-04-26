import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";

function PublicLayout() {
  return (
    <main className="home-page">
      <Navbar />
      <Outlet />
    </main>
  );
}

export default PublicLayout;
