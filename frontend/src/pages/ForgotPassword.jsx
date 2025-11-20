import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Mail } from "lucide-react";

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
      // Keep behaviour same as before: don't reveal whether the email exists
      toast.success(
        "If an account exists for this email, you’ll receive a reset link shortly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4 shadow-lg">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Forgot Password
          </h2>
          <p className="text-gray-600">
            Enter your email and we will send a reset link.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <form onSubmit={onSubmitHandler} className="space-y-5">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full bg-black text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group
                ${
                  submitting
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-gray-800 hover:shadow-lg transform hover:-translate-y-0.5"
                }`}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending…
                </>
              ) : (
                <>Send reset link</>
              )}
            </button>

            <p className="text-xs text-gray-500 mt-2 text-center">
              We’ll email a link to reset your password, if your email is
              registered.
            </p>
            <div className="text-center mt-4">
              <a
                href="/login"
                className="text-sm text-black font-medium hover:underline"
              >
                Back to Login
              </a>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
