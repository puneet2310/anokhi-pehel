import { useState } from "react";

const WarningModal = ({ isOpen, onClose, onConfirm, title, details }) => {
  if (!isOpen) return null; // Don't render if modal is closed

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
      <div className="relative p-4 w-full max-w-md">
        <div className="relative p-6 text-center bg-white rounded-lg shadow-lg dark:bg-gray-800 sm:p-7">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-gray-400 absolute top-3 right-3 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-full text-sm p-2 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
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

          {/* Warning Icon */}
          <svg
            className="text-red-400 w-12 h-12 mb-4 mx-auto"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.586c.773 1.376-.192 3.015-1.743 3.015H3.482c-1.55 0-2.516-1.64-1.743-3.015L8.257 3.1zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-.25-7.75a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0v-4z"
              clipRule="evenodd"
            />
          </svg>

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {title}
          </h2>

          {/* Details Text */}
          <p className="mb-5 text-gray-500 dark:text-gray-300 text-sm">
            {details}
          </p>

          {/* Action Buttons */}
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={onClose}
              className="py-2 px-4 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-300 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
            >
              No, cancel
            </button>
            <button
              onClick={onConfirm}
              className="py-2 px-4 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indio-700 focus:ring-4 focus:outline-none focus:ring-violet-300 "
            >
              Yes, I'm sure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
