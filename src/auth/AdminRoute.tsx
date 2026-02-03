import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) return setAllowed(false);

      const role = user.user_metadata?.role;
      setAllowed(role === "admin");
    }

    check();
  }, []);

  if (allowed === null) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white">
        Checking admin access…
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
