import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Search, Eye } from "lucide-react";
import Navbar from "../components/navbar";

const Home = () => {
  const [displayText, setDisplayText] = useState("");
  const fullText = "Matrix of Truth";

  // Simple typewriter effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    
    return () => clearInterval(timer);
  }, []);

  // Enhanced Matrix Rain
  const MatrixRain = () => {
    const characters = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-red-400 font-mono text-sm"
            style={{
              left: `${(i * 2) % 100}%`,
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

  const features = [
    {
      icon: <Shield className="text-3xl" />,
      title: "Fake News Detection",
      description: "Identify false information and misleading claims instantly"
    },
    {
      icon: <Search className="text-3xl" />,
      title: "Source Verification",
      description: "Check credibility and reliability of news sources"
    },
    {
      icon: <Eye className="text-3xl" />,
      title: "Deepfake Detection",
      description: "Spot manipulated videos and synthetic media"
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
        {/* Simple Matrix Rain Background */}
        <MatrixRain />
        
        {/* Compact Hero Section */}
        <div className="py-20 px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Main Title with Fake News Theme */}
            <motion.h1
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {displayText}
              <motion.span
                className="inline-block w-1 h-12 md:h-16 bg-red-400 ml-2"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Stop Misinformation in Its Tracks
            </motion.p>
            
            {/* Description */}
            <motion.p
              className="text-lg text-slate-400 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              AI-powered fact-checking to detect fake news, deepfakes, and manipulated content in real-time.
            </motion.p>
            
            {/* Simple CTA */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/dashboard">
                <button className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg">
                  Start Fact-Checking
                </button>
              </Link>
              <Link to="/about">
                <button className="px-8 py-3 border-2 border-red-500 text-white rounded-lg hover:bg-red-500/10 transition-all duration-300">
                  Learn More
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Simple Features Grid */}
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Combat Misinformation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-800/50 p-6 rounded-lg border border-slate-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="text-red-400 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Simple Stats */}
        <div className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-8">
              Fighting Fake News Daily
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-red-400 mb-2">10K+</div>
                <div className="text-slate-400">Articles Verified</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-400 mb-2">95%</div>
                <div className="text-slate-400">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400 mb-2">24/7</div>
                <div className="text-slate-400">Real-time Monitoring</div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple How It Works */}
        <div className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Upload Content</h3>
                <p className="text-slate-400">Paste URL, upload file, or enter text</p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <div className="w-12 h-12 bg-orange-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Analysis</h3>
                <p className="text-slate-400">Advanced algorithms check for misinformation</p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <div className="w-12 h-12 bg-yellow-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Get Results</h3>
                <p className="text-slate-400">Receive detailed fact-check report</p>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Footer */}
        <div className="py-16 px-4 border-t border-slate-700">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Fight Fake News?
            </h3>
            <p className="text-slate-400 mb-6">
              Join the fight against misinformation with Matrix of Truth
            </p>
            <Link to="/dashboard">
              <button className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg">
                Get Started Now
              </button>
            </Link>
            <div className="mt-8 pt-8 border-t border-slate-700">
              <p className="text-slate-500 text-sm">
                © 2025 Matrix-Of-Truth | Created by IIIT Bangalore Students
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
