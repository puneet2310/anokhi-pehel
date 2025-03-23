import { useEffect, useState } from "react";

const AnimatedTick = () => {
  const [circles, setCircles] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCircles((prevCircles) => [
        ...prevCircles,
        { id: Date.now(), opacity: 1, scale: 1 },
      ]);

      setTimeout(() => {
        setCircles((prevCircles) => prevCircles.slice(1));
      }, 5000); // Remove circles after animation ends
    }, 6000); // Create new circle every 600ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      {/* Background Expanding Circles */}
      {circles.map((circle) => (
        <div
          key={circle.id}
          className="absolute w-16 h-16 bg-green-300 rounded-full opacity-50 animate-expand"
        />
      ))}

      {/* Animated Tick */}
      <svg
        aria-hidden="true"
        className="w-8 h-8 text-green-500 dark:text-green-400 animated-tick"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>

      <style>
        {`
          /* Tick animation: Scale up and down in 3D */
          @keyframes tickBounce {
            0% { transform: scale(0) rotateX(90deg); opacity: 0; }
            50% { transform: scale(1.2) rotateX(0deg); opacity: 1; }
            100% { transform: scale(1) rotateX(0deg); opacity: 1; }
          }

          /* Background circles: Expand and fade out */
          @keyframes expandCircle {
            0% { transform: scale(0.3); opacity: 0.5; }
            100% { transform: scale(1.5); opacity: 0; }
          }

          .animated-tick {
            transform-origin: center;
            animation: tickBounce 1.5s infinite ease-in-out;
          }

          .animate-expand {
            position: absolute;
            animation: expandCircle 2s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default AnimatedTick;
