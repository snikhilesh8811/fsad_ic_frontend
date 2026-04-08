import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import samvidhanPathLogo from "../../assets/samvidhanpath.png";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { FaHighlighter, FaTextHeight } from "react-icons/fa";
import TextToSpeech from "../TexttoSpeach";
import GoogleTranslate from "../Language";
import ThemeChange from "../Themechange";
import { authStorage, logout } from "../../services/authService";
const NavbarMenu = [
  { id: 1, title: "Home", path: "/" },
  {
    id: 2,
    title: "Constitution of India",
    path: "/constitution",
    submenu: [
      { id: 1, title: "History", path: "/constitution/history" },
      { id: 2, title: "Constitution PDFs", path: "/constitution/preamble" },
    ],
  },
  {
    id: 3,
    title: "Explore",
    path: "/explore",
    submenu: [
      { id: 1, title: "Case Studies", path: "/casestudies" },
      { id: 2, title: "Quiz", path: "/quiz" },
    ],
  },
  {
    id: 4,
    title: "For Citizen",
    path: "/citizen",
    submenu: [
      { id: 1, title: "Fundamental Rights", path: "/citizen/rights" },
      { id: 2, title: "Fundamental Duties", path: "/citizen/duties" },
      { id: 3, title: "Directive Principles", path: "/citizen/dpsp" },
      { id: 4, title: "Amendment", path: "/citizen/amendment" },
      { id: 5, title: "Schedules", path: "/citizen/schedules" },
      { id: 6, title: "Lessons", path: "/citizen/lessons" },
    ],
  },
  {
    id: 5,
    title: "Engage",
    path: "/engage",
    submenu: [
      { id: 1, title: "Discussion Forum", path: "/engage/discussionforum" },
      { id: 2, title: "Blog", path: "/engage/blog" },
      { id: 3, title: "Podcast", path: "/engage/podcast" },
      { id: 4, title: "Video", path: "/engage/video" },
    ],
  },
  { id: 6, title: "E-Books", path: "/ebooks" },
  {
    id: 7,
    title: "Games",
    path: "/games",
    submenu: [
      { id: 1, title: "Crossword", path: "/games/crossword" },
      { id: 2, title: "Quiz", path: "/quiz" },
      { id: 3, title: "Word Search", path: "/games/word-search" },
      { id: 4, title: "Puzzle", path: "/games/puzzle" },
    ],
  },
  { id: 8, title: "Contact Us", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTextResizer, setShowTextResizer] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const navigate = useNavigate();
  const session = authStorage.getSession();
  const role = session?.user?.role || "CITIZEN";
  const approved = session?.user?.approvalStatus === "APPROVED";
  const showMyProfile = true;

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const toggleSubmenu = (menuId) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  const handleProfileNavigation = () => {
    if (role === "ADMIN") {
      navigate("/admin-panel");
      return;
    }
    if (role === "EDUCATOR") {
      navigate(approved ? "/educator-panel" : "/pending-approval");
      return;
    }
    if (role === "LEGAL_EXPERT") {
      navigate(approved ? "/legal-expert-panel" : "/pending-approval");
      return;
    }
    navigate("/citizen-panel");
  };

  return (
    <div className="flex flex-col w-full">
      {/* Accessibility Top Bar */}
      <div className="order-2 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300 z-10">
        <div className="container flex items-center justify-end h-10 px-4 mx-auto space-x-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
            <FaHighlighter
              size={18}
              className="transition-colors duration-200 cursor-pointer hover:text-black dark:hover:text-white"
              title="Highlight Text"
            />
            <FaTextHeight
              size={18}
              className="transition-colors duration-200 cursor-pointer hover:text-black dark:hover:text-white"
              title="Text Resize"
              onClick={() => setShowTextResizer(true)}
            />
            <div className="flex items-center">
              <TextToSpeech />
            </div>
            <div className="flex items-center">
              <ThemeChange />
            </div>
          </div>
          
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-700"></div>
          
          <div className="flex items-center">
            <GoogleTranslate />
          </div>
        </div>
      </div>

      {/* Text Resizer Popup */}
      {showTextResizer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm p-5 bg-white rounded-lg shadow-lg">
            <div className="text-xl font-semibold">Text Resizer</div>
            <div className="flex mt-4 space-x-2">
              <button
                onClick={() => document.documentElement.className = "text-sm"}
                className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Small
              </button>
              <button
                onClick={() => document.documentElement.className = "text-base"}
                className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Medium
              </button>
              <button
                onClick={() => document.documentElement.className = "text-lg"}
                className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Large
              </button>
            </div>
            <button
              onClick={() => setShowTextResizer(false)} // Close the popup
              className="px-4 py-2 mt-4 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    <nav className="order-1 relative z-20 text-black bg-white shadow-md dark:bg-gray-800 dark:text-white">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full px-4 lg:px-8 flex items-center justify-between gap-4 py-3 lg:py-4"
      >
        {/* Logo section */}
        <div className="flex flex-row items-center gap-3 shrink-0">
          <img className="w-auto h-16" src={samvidhanPathLogo} alt="logo" />
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-bold leading-tight">Samvidhan Path</h1>
            <h1 className="text-2xl font-bold leading-tight">संविधान पथ</h1>
          </div>
        </div>
        {/* Menu section */}
        <div className="flex-1 hidden text-black bg-white lg:block dark:bg-gray-800 dark:text-white">
          <ul className="flex items-center justify-end gap-2 text-black bg-white dark:bg-gray-800 dark:text-white xl:gap-4">
            {NavbarMenu.map((menu) => (
              <li
                key={menu.id}
                className="relative text-black bg-white group dark:bg-gray-800 dark:text-white"
                onMouseEnter={() => menu.submenu && toggleSubmenu(menu.id)}
                onMouseLeave={() => menu.submenu && toggleSubmenu(null)}
              >
                <button
                  onClick={() => handleMenuClick(menu.path)}
                  className="relative inline-block px-2 py-2 text-base font-semibold whitespace-nowrap xl:px-4 dark:hover:bg-gray-800 hover:text-secondary"
                >
                  {menu.title}
                </button>
                {/* Dropdown for submenu */}
                <AnimatePresence>
                  {menu.submenu && activeMenu === menu.id && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 w-48 mt-2 text-black bg-white border shadow-lg top-full dark:bg-gray-800 dark:text-white"
                    >
                      {menu.submenu.map((sub, index) => (
                        <motion.li
                          key={sub.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <button
                            onClick={() => handleMenuClick(sub.path)}
                            className="block w-full px-4 py-2 text-left dark:hover:bg-gray-800 hover:bg-gray-100 hover:text-secondary"
                          >
                            {sub.title}
                          </button>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            ))}
            {showMyProfile && (
              <button className="px-4 py-2 text-base font-semibold text-white transition-all duration-300 rounded-md bg-secondary hover:scale-105 whitespace-nowrap" onClick={handleProfileNavigation}>My Profile</button>
            )}
            <button className="px-4 py-2 text-base font-semibold text-white transition-all duration-300 rounded-md bg-secondary hover:scale-105 whitespace-nowrap" onClick={handleLogout}>Logout</button>
          </ul>
        </div>
        {/* Mobile Hamburger menu section */}
        <div className="static">
  {/* Mobile Hamburger Icon */}
  <motion.div
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="sticky z-[1000] cursor-pointer lg:hidden top-16 right-6"
    onClick={toggleMenu}
  >
    {isOpen ? (
      <IoMdClose className="z-50 text-4xl text-yellow-500" />
    ) : (
      <IoMdMenu className="text-4xl text-yellow-500" />
    )}
  </motion.div>

  {/* Sliding Hamburger Menu */}
  <motion.div
    initial={{ x: "100%" }}
    animate={{ x: isOpen ? "0%" : "100%" }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
    className="fixed top-0 right-0 z-50 flex flex-col w-4/5 h-screen gap-6 px-6 py-8 text-white bg-gray-900 shadow-lg "
  >
    <ul className="flex flex-col gap-4 mt-44 ">
      {NavbarMenu.map((menu) => (
        <li
          key={menu.id}
          className="relative group"
          onMouseEnter={() => menu.submenu && toggleSubmenu(menu.id)}
          onMouseLeave={() => menu.submenu && toggleSubmenu(null)}
        >
          <button
            onClick={() => handleMenuClick(menu.path)}
            className="block px-3 py-2 text-lg hover:text-yellow-500"
          >
            {menu.title}
          </button>
          {/* Dropdown for submenu */}
          <AnimatePresence>
            {menu.submenu && activeMenu === menu.id && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="left-0 w-48 mt-2 text-white bg-gray-900 shadow-lg md:bg-white md:absolute top-full"
              >
                {menu.submenu.map((sub, index) => (
                  <motion.li
                    key={sub.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => handleMenuClick(sub.path)}
                      className="block w-full px-4 py-2 text-left dark:hover:bg-gray-800 md:hover:bg-gray-100 hover:text-secondary"
                    >
                      {sub.title}
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </li>
      ))}
    </ul>
    <div className="flex gap-2">
      {showMyProfile && (
        <button className="px-4 py-2 bg-yellow-500 rounded-md hover:bg-yellow-600" onClick={handleProfileNavigation}>
          My Profile
        </button>
      )}
      <button className="px-4 py-2 bg-yellow-500 rounded-md hover:bg-yellow-600" onClick={handleLogout}>
        Logout
      </button>
    </div>
  </motion.div>
</div>

      </motion.div>
    </nav>
  </div>
  );
};

export default Navbar;
