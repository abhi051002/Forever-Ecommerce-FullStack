import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [isOtp, setIsOtp] = useState(true);
  const [currentState, setCurrentState] = useState("Login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (currentState === "Sign Up") {
        // REGISTER API
        const response = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });

        if (response.data.success) {
          // Store email for OTP verification
          localStorage.setItem("verifyEmail", response.data.user.email);
          localStorage.setItem("verifyUserId", response.data.user._id);

          toast.success("OTP sent to your email.");
          navigate(`/verify-email/${response.data.user._id}`);
        } else {
          toast.error(response.data.message);
        }
      } else {
        // LOGIN API
        const response = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
          isOtp,
        });
        if (response.data.success && !response.data.token) {
          // Store email for login OTP
          localStorage.setItem("loginEmail", response.data.email);
          localStorage.setItem("loginUserId", response.data.userId);

          toast.success("OTP sent to your email.");
          navigate("/login-otp");
        } else if (response.data.success && response.data.token) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          toast.success("Login Successful");
          navigate("/");
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  const handleOTPPassword = () => {
    setIsOtp(!isOtp);
  };

  const handleFormState = (state = "Login") => {
    setCurrentState(state);
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-2xl mb-2 shadow">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-none">
                Forever
              </h1>
              <p className="text-gray-500 text-sm">Shop smart. Shop easy.</p>
            </div>
          </div>
        </div>

        {/* Header */}
        {/* <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {currentState === "Login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-600">
            {currentState === "Login"
              ? "Sign in to continue to your account"
              : "Sign up to get started"}
          </p>
        </div> */}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <form onSubmit={onSubmitHandler} className="space-y-5">
            {/* Name Input - Only for Sign Up */}
            {currentState === "Sign Up" && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
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

            {/* Password Input - Conditional */}
            {(isOtp || currentState !== "Login") && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* OTP/Password Toggle */}
            {currentState == "Login" && (
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleOTPPassword}
                  className="text-sm text-gray-600 hover:text-black transition-colors font-medium"
                >
                  Login with {isOtp ? "OTP" : "Password"} →
                </button>
              </div>
            )}

            {/* Additional Links */}
            {currentState === "Login" ? (
              <div className="flex justify-between items-center text-sm">
                <button
                  type="button"
                  className="text-gray-600 hover:text-black transition-colors font-medium"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => handleFormState("Sign Up")}
                  className="text-black hover:underline font-medium"
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div className="flex justify-end text-sm">
                <button
                  type="button"
                  onClick={() => handleFormState("Login")}
                  className="text-black hover:underline font-medium"
                >
                  Already have an account? Login
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-black text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group
                ${
                  loading
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-gray-800 hover:shadow-lg transform hover:-translate-y-0.5"
                }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  {currentState === "Login"
                    ? isOtp
                      ? "Sign In"
                      : "Send OTP"
                    : "Create Account"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <GoogleLogin
              onSuccess={(credentialResponse) => {
                // credentialResponse.credential is a JWT ID token (string)
                const idToken = credentialResponse.credential;
                // send the id token to your backend to verify / create session
                axios
                  .post(backendUrl + "/api/user/auth/google", { idToken })
                  .then((resp) => {
                    console.log(resp);
                    // resp should contain your app token or user info
                    setToken(resp.data.token);
                    localStorage.setItem("token", resp.data.token);
                    navigate("/");
                  })
                  .catch((err) => {
                    toast.error(
                      err.response?.data?.message || "Google login failed"
                    );
                  });
              }}
              onError={() => {
                toast.error("Google Sign In Failed");
              }}
            />
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

export default Login;
