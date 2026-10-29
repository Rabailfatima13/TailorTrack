import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store";
import type { Role } from "../types";

interface Props {
  children: ReactNode;
  role?: Role;
}

function ProtectedRoute({ children, role }: Props) {
  const { user, checked } = useAppSelector((state) => state.auth);

  if (!checked) {
    return <p className="p-6 text-center text-gray-500">Loading...</p>;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export default ProtectedRoute;
