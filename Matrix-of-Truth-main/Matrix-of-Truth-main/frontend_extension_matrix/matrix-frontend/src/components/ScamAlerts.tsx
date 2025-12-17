import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

interface ScamAlert {
  title: string;
  description: string;
  category: string;
  severity: string;
  warning: string;
  url: string;
  source: string;
}

const HARDCODED_SCAMS: ScamAlert[] = [];

const ScamAlerts = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [scams, setScams] = useState<ScamAlert[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "newest"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newScams = snapshot.docs.map((doc) => doc.data() as ScamAlert);
        if (newScams.length > 0) {
          setScams(newScams);
        } else {
          setScams(HARDCODED_SCAMS);
        }
      },
      (error) => {
        console.error("Error fetching scams:", error);
        setScams(HARDCODED_SCAMS);
      }
    );

    return () => unsubscribe();
  }, []);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Impersonation: "👮",
      "Delivery Scam": "📦",
      "Cryptocurrency Scam": "₿",
      "Email Phishing": "📧",
      "Social Media Scam": "📱",
      "Romance Scam": "💔",
      "Tech Support Scam": "💻",
    };
    return icons[category] || "⚠️";
  };

  const categories = [
    "All",
    ...Array.from(new Set(scams.map((s) => s.category))),
  ];
  const filteredScams =
    selectedCategory === "All"
      ? scams
      : scams.filter((s) => s.category === selectedCategory);
  const stats = {
    total: scams.length,
    high: scams.filter((s) => s.severity === "High").length,
    categories: categories.length - 1,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text">
          🚨 Current Scam Alerts
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Stay informed about common scams and fraud attempts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Alerts</p>
              <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
            </div>
            <div className="text-4xl">🔔</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-700/50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">High Severity</p>
              <p className="text-3xl font-bold text-red-400">{stats.high}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Categories</p>
              <p className="text-3xl font-bold text-purple-400">
                {stats.categories}
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === category
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            {category !== "All" && getCategoryIcon(category)} {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredScams.map((scam, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-gradient-to-br ${
              scam.severity === "High"
                ? "from-red-900/30 to-red-800/20 border-red-700/50"
                : "from-yellow-900/30 to-yellow-800/20 border-yellow-700/50"
            } border rounded-lg p-5`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {getCategoryIcon(scam.category)}
                </span>
                <h3 className="font-bold text-white text-lg">{scam.title}</h3>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  scam.severity === "High" ? "bg-red-600" : "bg-yellow-600"
                } text-white`}
              >
                {scam.severity}
              </span>
            </div>
            <div className="mb-3">
              <span className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-full">
                {scam.category}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-3">{scam.description}</p>
            <div className="bg-black/30 rounded-lg p-3 mb-3">
              <p className="text-yellow-400 text-xs font-semibold mb-1">
                ⚠️ Safety Warning:
              </p>
              <p className="text-gray-300 text-xs">{scam.warning}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-xs">{scam.source}</p>
              <a
                href={scam.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                Read Article
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-lg p-6"
      >
        <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
          <span>🛡️</span> General Safety Tips
        </h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>
              Never share personal information, passwords, or verification codes
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>
              Be suspicious of urgent requests for money or immediate action
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>
              Verify requests through official channels you find yourself
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>
              Enable two-factor authentication on all important accounts
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>If something seems too good to be true, it probably is</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default ScamAlerts;
