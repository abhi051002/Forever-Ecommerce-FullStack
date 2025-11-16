import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const Profile = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);
  const [name, setName] = useState("");

  const fetchMe = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/user/me`, {
        headers: { token },
      });
      if (res.data.success) {
        setMe(res.data.user);
        setName(res.data.user.name || "");
      } else {
        toast.error(res.data.message || "Failed to load profile");
      }
    } catch (e) {
      toast.error(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const saveName = async () => {
    if (!name.trim()) return toast.error("Name cannot be empty");
    try {
      setSaving(true);
      const res = await axios.patch(
        `${backendUrl}/api/user/name`,
        { name: name.trim() },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Profile updated");
        setMe((m) => ({ ...m, name: name.trim() }));
      } else {
        toast.error(res.data.message || "Failed to update profile");
      }
    } catch (e) {
      toast.error(e.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <div className="pt-16">
        <div className="max-w-3xl mx-auto p-4">
          <h2 className="text-xl font-semibold mb-2">My Profile</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      <div className="max-w-3xl mx-auto p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">My Profile</h2>

        {loading ? (
          <p className="text-gray-600">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  className="w-full border rounded-md p-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  className="w-full border rounded-md p-2 bg-gray-100"
                  value={me?.email || ""}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Verified</label>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs ${
                    me?.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {me?.isVerified ? "Yes" : "No"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="px-5 py-2 rounded-md bg-black text-white hover:opacity-90 disabled:opacity-60"
                onClick={saveName}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>

            <hr className="my-8" />

            <div>
              <h3 className="text-lg font-semibold mb-3">Security</h3>
              <p className="text-sm text-gray-600 mb-3">
                To change your password, use the “Forgot password” flow on the login page.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
