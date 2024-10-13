import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch, searchVisible } =
    useContext(ShopContext);

  return showSearch && searchVisible ? (
    <div className="border-t border-b bg-gray-50 text-center">
      <div className="inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2">
        <input
          type="text"
          placeholder="Search"
          className="flex-1 outline-none bg-inherit text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <img src={assets.search_icon} alt="Search Icon" className="w-4" />
      </div>
      <img
        src={assets.cross_icon}
        alt="Cross Icon"
        className="inline w-3 cursor-pointer"
        onClick={() => setShowSearch(false)}
      />
    </div>
  ) : null;
};

export default SearchBar;
