import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const LoginOTP = () => {
  const { backendUrl, setToken, navigate } = useContext(ShopContext);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const email = localStorage.getItem("loginEmail");
  const userId = localStorage.getItem("loginUserId");

  // TIMER COUNTDOWN
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const countdown = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(countdown);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        backendUrl + "/api/user/verify-login-otp",
        { userId, otp }
      );

      if (response.data.success) {
        toast.success("Login successful!");

        const token = response.data.token;
        setToken(token);
        localStorage.setItem("token", token);

        localStorage.removeItem("loginEmail");

        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    }
  };

  // RESEND OTP
  const resendOTP = async () => {
    try {
        console.log(userId);
      const res = await axios.post(
        backendUrl + "/api/user/resend-login-otp",
        { userId }
      );

      if (res.data.success) {
        toast.success("OTP resent successfully!");
        setTimer(60);
        setCanResend(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-20">
      <h2 className="text-2xl font-semibold text-center mb-6">Verify OTP</h2>

      <p className="text-center text-gray-600 mb-1">
        OTP sent to <strong>{email}</strong>
      </p>

      <p className="text-center text-gray-500 text-sm mb-4">
        {canResend ? (
          <button
            onClick={resendOTP}
            className="text-blue-600 underline"
          >
            Resend OTP
          </button>
        ) : (
          <>Resend OTP in {timer}s</>
        )}
      </p>

      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter Login OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border p-2 px-3"
          required
        />

        <button className="bg-black text-white py-2 hover:rounded-md">
          Verify & Login
        </button>
      </form>
    </div>
  );
};

export default LoginOTP;
