import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";

const Login = () => {
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [currentState, setCurrentState] = useState("Login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (currentState === "Sign Up") {
        // REGISTER API
        const response = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });

        if (response.data.success) {
          console.log(response.data.user._id);
          // Store email for OTP verification
          localStorage.setItem("verifyEmail", response.data.user.email);
          localStorage.setItem("verifyUserId", response.data.user._id);

          toast.success("OTP sent to your email.");
          navigate(`/verify-email/${response.data.user._id}`); // Redirect to OTP page
        } else {
          toast.error(response.data.message);
        }
      } else {
        // LOGIN API
        const response = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });

        if (response.data.success) {
          // Store email for login OTP
          localStorage.setItem("loginEmail", response.data.email);
          localStorage.setItem("loginUserId", response.data.userId);

          toast.success("OTP sent to your email.");
          navigate("/login-otp"); // Redirect to OTP page
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === "Login" ? null : (
        <input
          type="text"
          className="w-full py-2 px-3 border border-gray-800"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      )}

      <input
        type="email"
        className="w-full py-2 px-3 border border-gray-800"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          className="w-full py-2 px-3 border border-gray-800"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
        >
          {showPassword ? "Hide" : "Show"}
        </span>
      </div>

      {currentState === "Login" ? (
        <div className="w-full flex justify-between text-sm mt-[-8px]">
          <p
            className="cursor-pointer"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Your Password?
          </p>
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer"
          >
            Create Account
          </p>
        </div>
      ) : (
        <div className="w-full flex justify-between text-sm mt-[-8px]">
          <p></p>
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer"
          >
            Login Here
          </p>
        </div>
      )}

      <button className="bg-black text-white font-light px-8 py-2 mt-4 hover:rounded-lg">
        {currentState === "Login" ? "Login" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
