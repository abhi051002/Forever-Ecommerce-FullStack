import React, { useContext, useMemo, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";

const SetPassword = () => {
  const { backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!token) return toast.error("Invalid or missing token");
    if (!password || !confirm) return toast.error("Please fill both fields");
    if (password !== confirm) return toast.error("Passwords do not match");
    if (password.length < 8)
      return toast.error("Password must be at least 8 characters");

    try {
      setSubmitting(true);
      const res = await axios.post(`${backendUrl}/api/user/reset-password`, {
        token,
        password,
        confirmPassword: confirm,
      });
      if (res.data.success) {
        toast.success("Password updated. Please log in.");
        navigate("/login");
      } else {
        toast.error(res.data.message || "Failed to set password");
      }
    } catch (err) {
      toast.error(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Set New Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {!token && (
        <p className="text-red-600 text-sm">
          Invalid reset link. Request a new one.
        </p>
      )}

      <div className="relative w-full">
        <input
          type={show ? "text" : "password"}
          className="w-full py-2 px-3 border border-gray-800"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!token}
          required
        />
        <span
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer select-none"
        >
          {show ? "Hide" : "Show"}
        </span>
      </div>

      <input
        type="password"
        className="w-full py-2 px-3 border border-gray-800"
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        disabled={!token}
        required
      />

      <button
        className="bg-black text-white font-light px-8 py-2 mt-2 hover:rounded-lg disabled:opacity-60"
        disabled={!token || submitting}
      >
        {submitting ? "Updating…" : "Set Password"}
      </button>
    </form>
  );
};

export default SetPassword;
