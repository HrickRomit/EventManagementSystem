import { useEffect, useState } from "react";
import { deleteAdminUser, getAdminUsers, updateAdminUser } from "../../services/api";
import UserEditModal from "../../components/admin/UserEditModal";

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getAdminUsers(filter);
      setUsers(data.users);
    } catch (error) {
      setError("Failed to fetch users. Please try again.");
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        setError("");
        await deleteAdminUser(userId);
        setSuccess(`${userName} has been deleted successfully.`);
        fetchUsers();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to delete user");
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleUpdate = async (userData) => {
    try {
      setError("");
      await updateAdminUser(editingUser._id, userData);
      setSuccess("User updated successfully.");
      fetchUsers();
      setEditingUser(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update user");
      console.error("Failed to update user:", error);
    }
  };

  const searchTerm = search.trim().toLowerCase();
  const displayedUsers = users.filter((user) => {
    if (!searchTerm) {
      return true;
    }

    return [user.name, user.email, user.role, user.organizationName]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(searchTerm));
  });

  return (
    <div className="manage-users-page">
      <div className="manage-users-header">
        <div>
          <h2>User Management</h2>
          <p className="manage-users-copy">
            Review all registered accounts, filter by role, and update or remove users as needed.
          </p>
        </div>
        <div className="search-container">
          <input
            type="search"
            placeholder="Search by name, email, role or organization"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filter-buttons">
        <button
          className={!filter ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter(null)}
        >
          All Users
        </button>
        <button
          className={filter === "participant" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("participant")}
        >
          Participants
        </button>
        <button
          className={filter === "organizer" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("organizer")}
        >
          Organizers
        </button>
      </div>

      <div className="table-summary">
        <span>{users.length} total users</span>
        <span>{displayedUsers.length} visible</span>
      </div>

      {loading ? (
        <p className="loading-message">Loading users...</p>
      ) : displayedUsers.length === 0 ? (
        <p className="no-users-message">
          {search ? "No users match your search." : "No users found."}
        </p>
      ) : (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Organization</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>{user.role}</span>
                  </td>
                  <td>{user.organizationName || "-"}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <button className="btn-edit" onClick={() => setEditingUser(user)}>
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(user._id, user.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingUser && (
        <UserEditModal user={editingUser} onUpdate={handleUpdate} onClose={() => setEditingUser(null)} />
      )}
    </div>
  );
}

export default ManageUsersPage;
