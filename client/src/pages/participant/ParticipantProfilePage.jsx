import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateCurrentUser } from "../../services/auth";

function ParticipantProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || "",
    phoneNumber: user.phoneNumber || ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const { user: updatedUser } = await updateCurrentUser(form);
      updateUser(updatedUser);
      setSuccess("Profile updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="dashboard-content-grid">
      <article className="dashboard-card dashboard-card-hero">
        <p className="dashboard-card-kicker">Participant profile</p>
        <h2>{user.name}</h2>
        <p>{user.email || user.phoneNumber}</p>
      </article>

      <form className="dashboard-card dashboard-card-wide profile-edit-form" onSubmit={handleSubmit}>
        <p className="dashboard-card-kicker">Account details</p>
        <h3>Edit profile</h3>
        {error ? <div className="alert alert-error">{error}</div> : null}
        {success ? <div className="alert alert-success">{success}</div> : null}

        <div className="form-grid">
          <label className="form-group">
            <span>Name</span>
            <input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
          </label>
          <label className="form-group">
            <span>Phone number</span>
            <input value={form.phoneNumber} onChange={(event) => updateField("phoneNumber", event.target.value)} />
          </label>
          <label className="form-group">
            <span>Email</span>
            <input value={user.email || ""} disabled />
          </label>
          <label className="form-group">
            <span>Role</span>
            <input value="participant" disabled />
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ParticipantProfilePage;
