import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import { Shield, Search, Eye, Users, Zap, Database } from "lucide-react";

const About = () => {
  // Enhanced Matrix Rain (same as Home page)
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

  const teamMembers = [
    {
      name: "Chaitya Shah",
      role: "Team Lead/Full Stack Engineer",
      description: "Oversees project management and full-stack development",
    },
    {
      name: "Krishna Sai V",
      role: "Developer Relations/DevOps",
      description: "Focuses on integration and deployment of AI models",
    },
    {
      name: "Ramya Parsania",
      role: "ML Engineer",
      description: "Built the NLP models for fact-checking and deepfake detection",
    },
    {
      name: "Krish Patel",
      role: "AI Engineer",
      description: "Works on developing and optimizing AI algorithms for various applications",
    },
    {
      name: "Satyam Ambi",
      role: "Web Dev Engineer",
      description: "Creates the user interface and ensures a seamless user experience",
    },
  ];

  const technologies = [
    { name: "TensorFlow", icon: <Database className="text-2xl" />, category: "AI/ML" },
    { name: "PyTorch", icon: <Zap className="text-2xl" />, category: "AI/ML" },
    { name: "BERT", icon: <Search className="text-2xl" />, category: "NLP" },
    { name: "Firebase", icon: <Database className="text-2xl" />, category: "Database" },
    { name: "React", icon: <Users className="text-2xl" />, category: "Frontend" },
    { name: "Python", icon: <Shield className="text-2xl" />, category: "Backend" },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
        {/* Matrix Rain Background */}
        <MatrixRain />
        
        {/* Hero Section */}
        <div className="py-20 px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.h1
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              About Matrix of Truth
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Fighting Misinformation with AI
            </motion.p>
            
            <motion.p
              className="text-lg text-slate-400 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Our mission is to combat fake news, deepfakes, and misinformation using advanced AI technology.
            </motion.p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Our Mission
            </h2>
            <motion.div
              className="bg-slate-800/50 p-8 rounded-lg border border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-red-400 mb-4">Combat Misinformation</h3>
                  <p className="text-slate-300 mb-4">
                    We're dedicated to creating a more truthful digital world by identifying and stopping the spread of false information before it can cause harm.
                  </p>
                  <p className="text-slate-300">
                    Our platform provides real-time fact-checking and deepfake detection to help users verify content across all media formats.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-orange-400 mb-4">Empower Truth</h3>
                  <p className="text-slate-300 mb-4">
                    We believe in the power of accurate information and transparency. By providing accessible verification tools, we help build a more informed society.
                  </p>
                  <p className="text-slate-300">
                    Our technology empowers journalists, researchers, and everyday users to make informed decisions about the content they consume and share.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Key Capabilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="bg-slate-800/50 p-6 rounded-lg border border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-red-400 mb-4">
                  <Shield className="text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Real-time Fact Checking
                </h3>
                <p className="text-slate-400">
                  Advanced NLP models analyze claims against our comprehensive knowledge base and trusted sources.
                </p>
              </motion.div>
              
              <motion.div
                className="bg-slate-800/50 p-6 rounded-lg border border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-orange-400 mb-4">
                  <Eye className="text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Deepfake Detection
                </h3>
                <p className="text-slate-400">
                  Computer vision algorithms identify manipulated images and videos with high accuracy.
                </p>
              </motion.div>
              
              <motion.div
                className="bg-slate-800/50 p-6 rounded-lg border border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-yellow-400 mb-4">
                  <Search className="text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Source Verification
                </h3>
                <p className="text-slate-400">
                  Comprehensive analysis of source credibility and cross-referencing with trusted databases.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Meet Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-800/50 p-6 rounded-lg border border-slate-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <h3 className="text-lg font-bold text-white text-center mb-2">
                    {member.name}
                  </h3>
                  <p className="text-red-400 text-center text-sm mb-3">
                    {member.role}
                  </p>
                  <p className="text-slate-400 text-center text-sm">
                    {member.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Technology Stack
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {technologies.map((tech, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="text-red-400 mb-3 flex justify-center">
                    {tech.icon}
                  </div>
                  <h3 className="text-white font-medium mb-1">{tech.name}</h3>
                  <p className="text-xs text-orange-400">{tech.category}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-8">
              Project Impact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-red-400 mb-2">95%</div>
                <div className="text-slate-400">Detection Accuracy</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-400 mb-2">10K+</div>
                <div className="text-slate-400">Content Analyzed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400 mb-2">24/7</div>
                <div className="text-slate-400">Real-time Monitoring</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-16 px-4 border-t border-slate-700">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Join the Fight Against Misinformation
            </h3>
            <p className="text-slate-400 mb-6">
              Together, we can build a more truthful digital world
            </p>
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

export default About;
