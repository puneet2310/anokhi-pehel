import { useState } from "react";
import { close, menu, logo } from "../../assets/Home";
import { navLinks } from "../../constants/Home";
import { Link } from "react-router-dom";
import Button from "./Button";
const Navbar = () => {
  const [active, setActive] = useState("Home");
  const [toggle, setToggle] = useState(false);
  const token = localStorage.getItem("token");

  return (
    <nav className="w-full flex py-4 -mb-2 -mt-2 justify-between items-center navbar">
      <Link to="/">
        <img src={logo} alt="Anokhi पहल" className="w-[50px] h-[50px]" />
      </Link>
      <span className="ml-3 mt-2 text-xl text-black font-extrabold tracking-tight text-slate-900">
        <Link to="/">Anokhi पहल</Link>
      </span>

      <ul className="list-none sm:flex hidden justify-end items-center flex-1">
        {navLinks.map((nav, index) => (
          <li
            key={nav.id}
            className={`font-poppins font-medium cursor-pointer text-[16px] ${
              active === nav.title ? "text-black font-bold" : "text-slate-900"
            } ${index === navLinks.length - 1 ? "mr-0" : "mr-10"}`}
            onClick={() => setActive(nav.title)}
          >
            <Link to={`/${nav.id}`}>{nav.title}</Link>
          </li>
        ))}
        {token && 
        <li
            key="dashboard"
            className={`font-poppins font-medium cursor-pointer text-[16px] ${
              active === "dashboard" ? "text-black font-bold" : "text-slate-900"
            } ${5=== navLinks.length - 1 ? "mr-0" : "mr-10"} ml-10`}
            onClick={() => setActive("dashboard")}
          >
            <Link to={`/dashboard`}>Back To Dashboard</Link>
          </li>
        }
      </ul>
      <div className="sm:hidden flex flex-1 justify-end items-center">
        <img
          src={toggle ? close : menu}
          alt="menu"
          className="w-[28px] h-[28px] object-contain"
          onClick={() => setToggle(!toggle)}
        />

        <div
          className={`${
            !toggle ? "hidden" : "flex"
          } p-6 bg-gray-100 absolute top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar`}
        >
          <ul className="list-none flex justify-end items-start flex-1 flex-col">
            {navLinks.map((nav, index) => (
              <li
                key={nav.id}
                className={`font-poppins font-medium cursor-pointer text-[16px] ${
                  active === nav.title
                    ? "text-black font-bold"
                    : "text-gray-600"
                } ${index === navLinks.length - 1 ? "mb-0" : "mb-4"}`}
                onClick={() => setActive(nav.title)}
              >
                <Link to={`/${nav.id}`}>{nav.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
