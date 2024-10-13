import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
const Navbar = ({ setToken }) => {
  const navigate = useNavigate(); // Initialize the navigation hook

  const handleClick = () => {
    setToken("");
    navigate("/"); // Redirect to the root path after logout
  };
  return (
    <div className="flex items-center justify-between py-2 px-[4%]">
      <img src={assets.logo} alt="" className="w-[max(10%,80px)]" />
      <button
        onClick={handleClick}
        className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:test-sm"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
