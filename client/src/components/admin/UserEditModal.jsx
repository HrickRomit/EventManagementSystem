import { useState } from "react";
import { useForm } from "react-hook-form";

function UserEditModal({ user, onUpdate, onClose }) {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: user
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const role = watch("role");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onUpdate(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Edit User</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" {...register("name", { required: true })} />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" {...register("email", { required: true })} />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" {...register("role", { required: true })}>
              <option value="participant">Participant</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {role === "organizer" && (
            <div className="form-group">
              <label htmlFor="organizationName">Organization Name</label>
              <input
                id="organizationName"
                type="text"
                {...register("organizationName", { required: role === "organizer" })}
              />
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserEditModal;
