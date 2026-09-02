import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../../components/Home/Button";
import { logo } from "../../assets/Home";
import { BASE_URL } from "../../../src/Service/helper";
import { showLoading, hideLoading } from "../../redux/features/alertSlice";
import { useDispatch } from "react-redux";
export default function Login() {
  const dispatch = useDispatch();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  let navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleSubmit = async (e) => {
    try {
      // console.log(credentials);
      dispatch(showLoading());
      const response = await axios.post(`${BASE_URL}/login`, credentials);
      // console.log(response.data);
      // window.location.reload();
      dispatch(hideLoading());
      if (response.data.success) {
        localStorage.setItem("token", response.data.authToken);
        message.success("Login successfully!!!");
         navigate("/Dashboard");
      } else {
        message.error(response.data.error);
        navigate("/login");
      }
    } catch (err) {
      console.log(err);
      message.error("Login failed");
      navigate("/login");
    } finally {
      dispatch(hideLoading());
      // window.location.reload();
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgotPassword");
  };
  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <section className="">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 ">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-900"
        >
          <img className="w-8 h-8 mr-2" src={logo} alt="logo" />
          Anokhi पहल
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 border-double border-4 border-cyan-500">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" action="#">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={credentials.email}
                  onChange={onChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required=""
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={onChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <svg
                      className="shrink-0 size-3.5"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {showPassword ? (
                        <>
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </>
                      ) : (
                        <>
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                          <line x1="2" x2="22" y1="2" y2="22"></line>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
              <Button
                text="Sign in"
                styles="w-full bg-primary-600"
                func={handleSubmit}
              />

              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Forgot Password?{" "}
                <a
                  href="#"
                  onClick={handleForgotPassword} // Call the function when clicked
                  className="font-medium hover:underline text-cyan-800"
                >
                  Click here to reset
                </a>
              </p>
              {/* <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet?{" "}
                <a
                  href="#"
                  className="font-medium hover:underline text-cyan-800"
                >
                  Contact Admin
                </a>
              </p> */}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
