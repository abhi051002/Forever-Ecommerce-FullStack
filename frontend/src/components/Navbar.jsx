import React, { useContext, useState } from "react";
import { assets } from "../assets/assets.js";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext.jsx";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const {
    setShowSearch,
    searchVisible,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
  } = useContext(ShopContext);

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    navigate("/login");
    setCartItems({});
  };
  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="w-36" />
      </Link>
      <ul className="hidden sm:flex gap-5 text-gray-700 text-lg">
        <NavLink className="flex flex-col items-center gap-1" to="/">
          <p>Home</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink className="flex flex-col items-center gap-1" to="/collection">
          <p>Collection</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink className="flex flex-col items-center gap-1" to="/about">
          <p>About</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink className="flex flex-col items-center gap-1" to="/contact">
          <p>Contact</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink
          className="flex flex-col items-center gap-1"
          to="https://forever-admin-pannel.vercel.app"
        >
          <p className="px-2 rounded-md text-gray-700 border bg-slate-300 ">
            Admin Panel
          </p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-6">
        {searchVisible ? (
          <img
            src={assets.search_icon}
            alt="Search Icon"
            className="w-5 cursor-pointer"
            onClick={() => setShowSearch(true)}
          />
        ) : null}
        <div className="group relative">
          <img
            src={assets.profile_icon}
            alt="Profile Icon"
            className="w-5 cursor-pointer"
            onClick={() => (token ? null : navigate("/login"))}
          />
          {/* Dropdown Menu */}
          {token ? (
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
                <p className="cursor-pointer hover:text-black">My Profile</p>
                <p
                  className="cursor-pointer hover:text-black"
                  onClick={() => navigate("/orders")}
                >
                  Orders
                </p>
                <p className="cursor-pointer hover:text-black" onClick={logout}>
                  Logout
                </p>
              </div>
            </div>
          ) : null}
        </div>
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} alt="Cart Icon" className="w-5 minw-5" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>
        <img
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden"
          alt=""
          onClick={() => setVisible(true)}
        />
      </div>
      {/* Side bar hamburger menu for smaller screen */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
          visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            className="flex items-center gap-4 p-3 cursor-pointer"
            onClick={() => setVisible(false)}
          >
            <img
              src={assets.dropdown_icon}
              alt="Dropdown Icon"
              className="h-4 rotate-180"
            />
            <p>Back</p>
          </div>
          <NavLink
            className="py-4 pl-6 border"
            onClick={() => setVisible(false)}
            to="/"
          >
            <p>Home</p>
          </NavLink>
          <NavLink
            className="py-4 pl-6 border"
            onClick={() => setVisible(false)}
            to="/collection"
          >
            <p>Collection</p>
          </NavLink>
          <NavLink
            className="py-4 pl-6 border"
            onClick={() => setVisible(false)}
            to="/about"
          >
            <p>About</p>
          </NavLink>
          <NavLink
            className="py-4 pl-6 border"
            onClick={() => setVisible(false)}
            to="/contact"
          >
            <p>Contact</p>
          </NavLink>
          <NavLink
            className="py-4 pl-6 border"
            onClick={() => setVisible(false)}
            to="https://forever-admin-pannel.vercel.app"
          >
            <p>Admin Panel</p>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
