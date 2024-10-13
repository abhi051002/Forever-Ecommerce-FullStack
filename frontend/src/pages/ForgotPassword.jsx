import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";

export const ForgotPassword = () => {
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reenterpassword, setReenterPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(backendUrl + "/api/user/forgot", {
        email,
        password,
        reenterpassword,
      });
      if (response.data.success) {
        navigate("/login");
        toast.success(response.data.message);
      } else {
        console.error(response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };
  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{"Change Password?"}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
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
          type={showPassword ? "text" : "password"} // Toggle password visibility
          className="w-full py-2 px-3 border border-gray-800"
          placeholder="Enter New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
        >
          {showPassword ? "Hide" : "Show"} {/* Show/Hide text */}
        </span>
      </div>
      <input
        type="password"
        className="w-full py-2 px-3 border border-gray-800"
        placeholder="Re-enter Password"
        value={reenterpassword}
        onChange={(e) => setReenterPassword(e.target.value)}
        required
      />
      <button className="bg-black text-white font-light px-8 py-2 mt-4 hover:rounded-lg">
        {"Change Password"}
      </button>
    </form>
  );
};
