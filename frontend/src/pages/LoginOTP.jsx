import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { Mail, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginOTP = () => {
  const { backendUrl, setToken } = useContext(ShopContext);
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const email = localStorage.getItem("loginEmail");
  const userId = localStorage.getItem("loginUserId");

  useEffect(() => {
    if (!email || !userId) return;
    setTimer(60);
    setCanResend(false);
  }, [email, userId]);

  // TIMER COUNTDOWN
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const countdown = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(countdown);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!userId) return toast.error("No pending login found. Please login again.");

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${backendUrl}/api/user/verify-login-otp`,
        { userId, otp }
      );

      if (response.data?.success) {
        toast.success("Login successful!");

        const token = response.data.token;
        setToken(token);
        localStorage.setItem("token", token);

        localStorage.removeItem("loginEmail");
        localStorage.removeItem("loginUserId");

        navigate("/");
      } else {
        toast.error(response.data?.message || "OTP verification failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  // RESEND OTP
  const resendOTP = async () => {
    if (!userId) return toast.error("No pending login found. Please login again.");
    try {
      setResending(true);
      const res = await axios.post(`${backendUrl}/api/user/resend-login-otp`, { userId });

      if (res.data?.success) {
        toast.success("OTP resent successfully!");
        setTimer(60);
        setCanResend(false);
      } else {
        toast.error(res.data?.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4 shadow-lg">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Verify OTP</h2>
          <p className="text-gray-600">Enter the OTP sent to your email to continue.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <p className="text-center text-gray-600 mb-1">
            OTP sent to <strong>{email || "—"}</strong>
          </p>

          <p className="text-center text-gray-500 text-sm mb-4">
            {canResend ? (
              <button
                onClick={resendOTP}
                className={`text-black font-medium hover:underline ${resending ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={resending}
              >
                Resend OTP
              </button>
            ) : (
              <>Resend OTP in {timer}s</>
            )}
          </p>

          {!email || !userId ? (
            <div className="text-center">
              <p className="text-sm text-red-600 mb-4">No pending login found. Please go back and login again.</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-black text-white px-4 py-2 rounded-lg"
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Enter Login OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
              />

              <button
                type="submit"
                disabled={submitting}
                className={`w-full bg-black text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group
                  ${submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-800 hover:shadow-lg transform hover:-translate-y-0.5"}`}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying…
                  </>
                ) : (
                  <>
                    Verify & Login
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm text-gray-600 hover:text-black transition-colors font-medium"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginOTP;
