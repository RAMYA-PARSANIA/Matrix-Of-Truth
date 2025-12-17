import RealtimeNews from "@/components/RealtimeNews";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserInput from "@/components/UserInput";
import Navbar from "@/components/navbar";
import DeepfakeDetection from "@/components/DeepfakeDetection";
import NLP from "@/components/NLP";
import ScamAlerts from "@/components/ScamAlerts";
import { motion } from "framer-motion";

export default function Dashboard() {
  // Enhanced Matrix Rain (same as Home page)
  const MatrixRain = () => {
    const characters = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-red-400 font-mono text-sm"
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
          <motion.h1 
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-8 bg-gradient-to-r from-red-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Matrix of Truth Dashboard
          </motion.h1>
          
          <motion.p
            className="text-center text-slate-400 mb-8 md:mb-12 text-base md:text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Advanced AI tools to combat misinformation and verify content
          </motion.p>
          
          <Tabs defaultValue="fact-checker" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 mb-4 sm:mb-8 rounded-lg h-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-2">
              <TabsTrigger
                value="fact-checker"
                className="p-2 sm:p-3 text-xs sm:text-sm lg:text-base bg-slate-800/70 text-white hover:bg-red-600/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                <span className="hidden sm:inline">AI Fact Checker</span>
                <span className="sm:hidden">Fact Check</span>
              </TabsTrigger>
              <TabsTrigger
                value="content-verification"
                className="p-2 sm:p-3 text-xs sm:text-sm lg:text-base bg-slate-800/70 text-white hover:bg-orange-600/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-yellow-600 transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                <span className="hidden sm:inline">Content Verification</span>
                <span className="sm:hidden">Verify</span>
              </TabsTrigger>
              <TabsTrigger
                value="deepfake-detection"
                className="p-2 sm:p-3 text-xs sm:text-sm lg:text-base bg-slate-800/70 text-white hover:bg-yellow-600/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-red-600 transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                <span className="hidden md:inline">Deepfake/Manipulation Detection</span>
                <span className="md:hidden">Deepfake</span>
              </TabsTrigger>
              <TabsTrigger
                value="realtime-news"
                className="p-2 sm:p-3 text-xs sm:text-sm lg:text-base bg-slate-800/70 text-white hover:bg-red-600/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                <span className="hidden sm:inline">Live News Monitor</span>
                <span className="sm:hidden">News</span>
              </TabsTrigger>
              <TabsTrigger
                value="scam-alerts"
                className="p-2 sm:p-3 text-xs sm:text-sm lg:text-base bg-slate-800/70 text-white hover:bg-purple-600/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                <span className="hidden sm:inline">Scam Alerts</span>
                <span className="sm:hidden">Scams</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="fact-checker" className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700 p-3 sm:p-6">
                <NLP />
              </TabsContent>
              <TabsContent value="content-verification" className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700 p-3 sm:p-6">
                <UserInput />
              </TabsContent>
              <TabsContent value="deepfake-detection" className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700 p-3 sm:p-6">
                <DeepfakeDetection />
              </TabsContent>
              <TabsContent value="realtime-news" className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700 p-3 sm:p-6">
                <RealtimeNews />
              </TabsContent>
              <TabsContent value="scam-alerts" className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700 p-3 sm:p-6">
                <ScamAlerts />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
}
