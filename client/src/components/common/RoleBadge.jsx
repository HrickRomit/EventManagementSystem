function RoleBadge({ role }) {
  return <span className={`role-badge role-badge-${role}`}>{role}</span>;
}

export default RoleBadge;
