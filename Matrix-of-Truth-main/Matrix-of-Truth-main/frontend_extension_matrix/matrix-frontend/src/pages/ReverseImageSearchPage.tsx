import Navbar from "@/components/navbar";
import ReverseImageSearch from "@/components/ReverseImageSearch";
import { motion } from "framer-motion";

export default function ReverseImageSearchPage() {
  // Enhanced Matrix Rain
  const MatrixRain = () => {
    const characters = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-blue-400 font-mono text-sm"
            style={{
              left: `${(i * 3) % 100}%`,
              top: "-20px",
            }}
            animate={{
              y: window.innerHeight + 100,
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          >
            {[...Array(Math.floor(Math.random() * 10) + 5)].map((_, j) => (
              <motion.div
                key={j}
                animate={{
                  opacity: [1, 0.3, 1],
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  repeat: Infinity,
                  delay: j * 0.1,
                }}
              >
                {characters.charAt(Math.floor(Math.random() * characters.length))}
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
        {/* Matrix Rain Background */}
        <MatrixRain />
        
        <div className="max-w-[90rem] mx-auto px-4 md:px-6 lg:px-8 pt-16 md:pt-20 relative z-10">
          <ReverseImageSearch />
        </div>
      </div>
    </>
  );
}
