import { Route, Routes } from "react-router-dom";
import AdminRoute from "../components/auth/AdminRoute";
import AuthRedirect from "../components/auth/AuthRedirect";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import AboutPage from "../pages/public/AboutPage";
import EventsPage from "../pages/public/EventsPage";
import HomePage from "../pages/public/HomePage";
import HowItWorksPage from "../pages/public/HowItWorksPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import OrganizerDashboardPage from "../pages/organizer/OrganizerDashboardPage";
import ManageEventsPage from "../pages/organizer/ManageEventsPage";
import CreateEventPage from "../pages/organizer/CreateEventPage";
import ParticipantDashboardPage from "../pages/participant/ParticipantDashboardPage";
import ParticipantProfilePage from "../pages/participant/ParticipantProfilePage";
import MyRegistrationsPage from "../pages/participant/MyRegistrationsPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ManageUsersPage from "../pages/admin/ManageUsersPage";
import ActiveEventsPage from "../pages/admin/ActiveEventsPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />

      <Route element={<AuthRedirect />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["participant", "organizer"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/participant" element={<ProtectedRoute allowedRoles={["participant"]} />}>
            <Route index element={<ParticipantDashboardPage />} />
            <Route path="profile" element={<ParticipantProfilePage />} />
            <Route path="registrations" element={<MyRegistrationsPage />} />
          </Route>

          <Route path="/organizer" element={<ProtectedRoute allowedRoles={["organizer"]} />}>
            <Route index element={<OrganizerDashboardPage />} />
            <Route path="events" element={<ManageEventsPage />} />
            <Route path="events/new" element={<CreateEventPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<ManageUsersPage />} />
          <Route path="events" element={<ActiveEventsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

// export default AppRouter;
//   );
// }

export default AppRouter;
