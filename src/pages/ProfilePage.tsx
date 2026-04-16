import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success("Profile updated");
      setEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-lg">
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">Profile</h1>

      <div className="border border-border rounded-md p-6">
        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                minLength={3}
                maxLength={30}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {loading ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm border border-border rounded-md text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Username</p>
              <p className="text-foreground font-medium">{user?.username}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Email</p>
              <p className="text-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Role</p>
              <p className="text-foreground capitalize">{user?.role}</p>
            </div>
            {user?.addresses && user.addresses.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Addresses</p>
                {user.addresses.map((addr) => (
                  <p key={addr._id} className="text-sm text-foreground">{addr.address}, {addr.city}, {addr.state} {addr.zip}, {addr.country}</p>
                ))}
              </div>
            )}
            <button onClick={() => setEditing(true)} className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
