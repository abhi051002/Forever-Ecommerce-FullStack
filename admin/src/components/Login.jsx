import React, { useState } from "react";
import axios from "axios";
import { backEndURL } from "../App";
import { toast } from "react-toastify";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(backEndURL + "/api/user/admin", {
        email,
        password,
      });
      if (response.data.success) {
        setToken(response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-3 min-w-72">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Email Address:
            </p>
            <input
              className="rounded-md w-full px-3 py-2 border border-gary-300 outline-none"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-3 min-w-72 relative">
            <p className="text-sm font-medium text-gray-700 mb-2">Password:</p>
            <input
              className="rounded-md w-full px-3 py-2 border border-gary-300 outline-none"
              type={showPassword ? "text" : "password"} // Toggle input type
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Your Password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-600"
              onClick={() => setShowPassword((prev) => !prev)} // Toggle password visibility
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            className="mt-2 w-full py-2 px-4 rounded-md text-white bg-black"
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
