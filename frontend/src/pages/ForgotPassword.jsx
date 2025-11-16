import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";

export const ForgotPassword = () => {
  const { backendUrl } = useContext(ShopContext);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await axios.post(backendUrl + "/api/user/forgot", { email });
      toast.success(
        res.data?.message ||
          "If an account exists for this email, you’ll receive a reset link shortly."
      );
      setEmail("");
    } catch (error) {
      toast.success(
        "If an account exists for this email, you’ll receive a reset link shortly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Forgot Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <input
        type="email"
        className="w-full py-2 px-3 border border-gray-800"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <button
        className="bg-black text-white font-light px-8 py-2 mt-2 hover:rounded-lg disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-xs text-gray-500 mt-2 text-center">
        We’ll email a link to reset your password, if your email is registered.
      </p>
    </form>
  );
};
