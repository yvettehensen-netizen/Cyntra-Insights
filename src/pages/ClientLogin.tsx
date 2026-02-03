import { supabase } from "@/lib/supabaseClient";

export default function ClientLogin() {
  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5173/portal/dashboard",
      },
    });

    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <button
        onClick={login}
        className="px-6 py-3 bg-white text-black rounded-lg"
      >
        Login met Google
      </button>
    </div>
  );
}
