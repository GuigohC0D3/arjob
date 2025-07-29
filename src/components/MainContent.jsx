import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const generateBubbles = () => {
  const bubbles = [];
  for (let i = 0; i < 15; i++) {
    const size = Math.random() * 40 + 10;
    bubbles.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 5,
      size,
    });
  }
  return bubbles;
};

const MainContent = () => {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    setBubbles(generateBubbles());
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen justify-center items-center bg-white overflow-hidden">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full blur-lg opacity-30"
          style={{
            background: `linear-gradient(to bottom right, #3da9fc, #90b4ce, #094067)`,
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.left}%`,
            bottom: -50,
          }}
          animate={{
            y: -800,
            opacity: [0.3, 0.1, 0],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      ))}

      <motion.h1
        className="text-6xl font-extrabold text-transparent bg-clip-text drop-shadow-[0_0_20px_rgba(9,64,103,0.8)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #3da9fc, #90b4ce, #094067)",
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        ARJOB
      </motion.h1>

      <motion.footer
        className="absolute bottom-0 w-full bg-gray-800 text-gray-200 text-center py-4 flex flex-col md:flex-row justify-around items-center text-sm"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <p>© 2025 ARJOB</p>
        <p>Versão do sistema: v1.0.3</p>
        <p>
          Status: <span className="text-green-400">Online</span>
        </p>
      </motion.footer>
    </div>
  );
};

export default MainContent;
