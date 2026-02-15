import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ENABLE_UNIFIED_SURFACE } from "@/config/featureFlags";

interface UnifiedSurfaceGuardProps {
  target?: string;
}

export default function UnifiedSurfaceGuard({
  target = "/aurelius/control-surface",
}: UnifiedSurfaceGuardProps) {
  const location = useLocation();

  if (!ENABLE_UNIFIED_SURFACE) return <Outlet />;
  if (location.pathname === target) return <Outlet />;

  return <Navigate to={target} replace state={{ from: location.pathname }} />;
}
