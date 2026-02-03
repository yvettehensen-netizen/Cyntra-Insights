import React from "react";

export type Role = "EXECUTIVE" | "CONSULTANT" | "VIEWER";

export default function RoleGate({
  role,
  allow,
  children,
}: {
  role: Role;
  allow: Role[];
  children: React.ReactNode;
}) {
  if (!allow.includes(role)) return null;
  return <>{children}</>;
}
