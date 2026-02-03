import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProfiles, updateProfileRole, UserProfile, getCurrentProfile } from "../cie/authClient";
import { Users, Shield, User, ArrowLeft } from "lucide-react";

export default function AdminPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfiles();
    checkCurrentUser();
  }, []);

  async function checkCurrentUser() {
    try {
      const profile = await getCurrentProfile();
      setCurrentUserRole(profile?.role || null);

      if (profile?.role !== "admin") {
        setError("Je hebt geen toegang tot deze pagina. Alleen admins kunnen gebruikers beheren.");
      }
    } catch (err) {
      console.error("Failed to check current user:", err);
    }
  }

  async function loadProfiles() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProfiles();
      setProfiles(data);
    } catch (err: any) {
      console.error("Failed to load profiles:", err);
      setError(err.message || "Kon gebruikers niet ophalen");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(profileId: string, newRole: "admin" | "client") {
    try {
      setUpdating(profileId);
      setError(null);
      await updateProfileRole(profileId, newRole);

      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p))
      );
    } catch (err: any) {
      console.error("Failed to update role:", err);
      setError(err.message || "Kon rol niet updaten");
    } finally {
      setUpdating(null);
    }
  }

  if (currentUserRole !== "admin") {
    return (
      <div className="min-h-screen bg-[#050505] text-gray-100 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-200 mb-2">Geen toegang</h1>
          <p className="text-sm text-gray-400 mb-6">
            Deze pagina is alleen toegankelijk voor administrators.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-lg bg-[#F5D66B] text-black font-semibold hover:bg-[#e8c76e] transition"
          >
            Terug naar home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#F5D66B] mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar home
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-7 h-7 text-[#F5D66B]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#F5D66B]">
              Gebruikers beheren
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            Bekijk alle gebruikers en pas hun rollen aan (admin of client).
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-400">Gebruikers laden...</p>
          </div>
        )}

        {/* Users table */}
        {!loading && profiles.length === 0 && (
          <div className="bg-[#0B0B0B] border border-[#222] rounded-2xl p-8 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Geen gebruikers gevonden</p>
          </div>
        )}

        {!loading && profiles.length > 0 && (
          <div className="bg-[#0B0B0B] border border-[#222] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a0a0a] border-b border-[#222]">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Bedrijf
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Aangemaakt
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-[#0a0a0a] transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-300">{profile.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-400">
                          {profile.company_name || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            profile.role === "admin"
                              ? "bg-[#F5D66B]/10 text-[#F5D66B] border border-[#F5D66B]/30"
                              : "bg-gray-800 text-gray-400 border border-gray-700"
                          }`}
                        >
                          {profile.role === "admin" && <Shield className="w-3 h-3" />}
                          {profile.role === "admin" ? "Admin" : "Client"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-gray-500">
                          {new Date(profile.created_at).toLocaleDateString("nl-NL")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={profile.role}
                          onChange={(e) =>
                            handleRoleChange(profile.id, e.target.value as "admin" | "client")
                          }
                          disabled={updating === profile.id}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[#050505] border border-[#333] text-gray-300 hover:border-[#F5D66B] focus:outline-none focus:border-[#F5D66B] disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <option value="client">Client</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        {!loading && profiles.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-6">
              <div>
                Totaal gebruikers: <span className="font-semibold text-gray-300">{profiles.length}</span>
              </div>
              <div>
                Admins:{" "}
                <span className="font-semibold text-[#F5D66B]">
                  {profiles.filter((p) => p.role === "admin").length}
                </span>
              </div>
              <div>
                Clients:{" "}
                <span className="font-semibold text-gray-400">
                  {profiles.filter((p) => p.role === "client").length}
                </span>
              </div>
            </div>
            <button
              onClick={loadProfiles}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#333] hover:border-[#F5D66B] transition"
            >
              Ververs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
