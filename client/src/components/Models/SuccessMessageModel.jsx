import { useState, useEffect } from "react";
import AnimatedTick from "./AnimatedTickModel";

const SuccessMessage = ({ message, onClose, timer = 3000 }) => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsOpen(false);
      if (onClose) onClose();
    }, timer);
    return () => clearTimeout(timeout);
  }, [onClose, timer]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-gray-900 bg-opacity-50">
          <div className="relative p-4 w-full max-w-md">
            <div className="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
              <button
                onClick={handleClose}
                className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 p-2 flex items-center justify-center mx-auto mb-3.5">
                <AnimatedTick />
              </div>
              <p className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                {message}
              </p>
              <button
                onClick={handleClose}
                className="py-2 px-3 text-sm font-medium text-center text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-900"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuccessMessage;
