import { Link, NavLink } from "react-router-dom";
import { logo } from "../../assets/Home";
import { MdOutlineCancel } from "react-icons/md";
import { links } from "../../constants/Dashboard";
import { useSelector, useDispatch } from "react-redux";
import { hideSidebar } from "../../redux/features/dashboardSlice";

const Sidebar = () => {
  const { activeMenu, screenSize } = useSelector(
    (state) => state.dashboardContext
  );
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const currentColor = "#03C9D7";

  const handleSidebar = () => {
    if (activeMenu && screenSize <= 900) {
      dispatch(hideSidebar());
    }
  };

  const activeLink =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg  text-white  text-md m-2";
  const normalLink =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-600 hover:text-black hover:bg-light-gray m-2";

  return (
    <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10 ">
      {activeMenu && (
        <>
          <div className="flex justify-between items-center">
            <Link
              to="/Dashboard"
              className="items-center gap-3 ml-3 mt-4 flex text-xl text-black font-extrabold tracking-tight text-slate-900"
            >
              <img src={logo} alt="logo" className="w-[20%] h-[20%]" />{" "}
              <span>Anokhi पहल</span>
            </Link>
            <button
              type="button"
              style={{ color: "#03C9D7" }}
              className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden"
              onClick={handleSidebar}
            >
              <MdOutlineCancel />
            </button>
          </div>
          <div className="mt-10 ">
            {links.map((item) => (
              <div key={item.title}>
                <p className="text-gray-600 m-3 mt-4 uppercase font-bold hover:text-black">
                  {item.title}
                </p>
                {item.links.map((link) => {
                  if (link.name === "Email-Service" && !user?.isAdmin) {
                    return null; 
                  }
                  return (
                    <NavLink
                      to={`/${link.name}`}
                      key={link.name}
                      style={({ isActive }) => ({
                        backgroundColor: isActive ? currentColor : "",
                      })}
                      className={({ isActive }) =>
                        isActive ? activeLink : normalLink
                      }
                    >
                      {link.icon}
                      <span className="capitalize ">{link.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
