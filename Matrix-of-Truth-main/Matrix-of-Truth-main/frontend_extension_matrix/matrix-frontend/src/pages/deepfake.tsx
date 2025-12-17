import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, AlertCircle, Eye, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import { config } from "../config";

interface DetectionResult {
  CNN_Prediction: string;
  Metadata_Analysis: string;
  Artifact_Analyis: string;
  Noise_Pattern_Analysis: string;
  Symmetry_Analysis: {
    Vertical_Symmetry: number;
    Horizontal_Symmetry: number;
  };
  Final_Prediction: string;
  Confidence_Score: number;
}

export default function DeepfakeDetection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video">("image");
  const api_url = config.apiUrl;

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024;
    const validTypes = fileType === "image"
      ? ["image/jpeg", "image/png"]
      : ["video/mp4"];

    if (!validTypes.includes(file.type)) {
      setError(`Please upload a valid ${fileType} file`);
      return;
    }
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const endpoint = fileType === "video"
        ? `${api_url}/analyze-video`
        : `${api_url}/analyze-deepfake`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const data = await response.json();
      setResult(data.results);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
        {/* Matrix Rain Background */}
        <MatrixRain />

        <div className="container mx-auto p-8 pt-20 relative z-10">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
              Deepfake Detection
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Advanced AI-powered analysis to detect manipulated images and videos
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center">
              <Eye className="text-3xl text-red-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Visual Analysis</h3>
              <p className="text-slate-400">CNN-based detection of visual artifacts</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center">
              <Shield className="text-3xl text-orange-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Metadata Check</h3>
              <p className="text-slate-400">Analysis of file metadata and patterns</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center">
              <Upload className="text-3xl text-yellow-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Multi-Format</h3>
              <p className="text-slate-400">Support for images and videos</p>
            </div>
          </motion.div>

          {/* Main Detection Interface */}
          <motion.div
            className="max-w-4xl mx-auto bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Tabs defaultValue="image" className="w-full">
              <TabsList className="grid w-full grid-cols-2 gap-4 mb-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                <TabsTrigger
                  value="image"
                  onClick={() => {
                    setFileType("image");
                    setSelectedFile(null);
                    setResult(null);
                  }}
                  className="p-3 bg-slate-800/70 text-white hover:bg-red-600/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 transition-all duration-300"
                >
                  Image Analysis
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  onClick={() => {
                    setFileType("video");
                    setSelectedFile(null);
                    setResult(null);
                  }}
                  className="p-3 bg-slate-800/70 text-white hover:bg-orange-600/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-yellow-600 transition-all duration-300"
                >
                  Video Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="image" className="space-y-6">
                <div className="text-center">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileSelect}
                    className="bg-slate-900/70 border-slate-600 text-slate-50 w-64 mx-auto"
                  />
                  <p className="text-sm text-slate-400 mt-2">
                    Supported formats: JPEG, PNG (Max 10MB)
                  </p>
                </div>
                {selectedFile && selectedFile.type.startsWith('image') && (
                  <div className="text-center">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="mx-auto max-h-[300px] rounded-lg object-contain border border-slate-600"
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="video" className="space-y-6">
                <div className="text-center">
                  <Input
                    type="file"
                    accept="video/mp4"
                    onChange={handleFileSelect}
                    className="bg-slate-900/70 border-slate-600 text-slate-50 w-64 mx-auto"
                  />
                  <p className="text-sm text-slate-400 mt-2">
                    Supported formats: MP4 (Max 10MB)
                  </p>
                </div>
                {selectedFile && selectedFile.type.startsWith('video') && (
                  <div className="text-center">
                    <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg inline-block">
                      Selected Video: {selectedFile.name}
                    </p>
                  </div>
                )}
              </TabsContent>

              <div className="text-center">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || loading}
                  className="w-40 mt-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Analyze Content
                    </>
                  )}
                </Button>
              </div>
            </Tabs>

            {loading && (
              <div className="text-center mt-6">
                <Progress value={30} className="w-64 mx-auto bg-slate-700" />
                <p className="text-slate-400 mt-2">Processing your content...</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-6 bg-red-900/50 border-red-600">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Detection Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <motion.div
                className="space-y-6 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Alert
                  variant={result.Final_Prediction === "Fake" ? "destructive" : "default"}
                  className={
                    result.Final_Prediction === "Fake"
                      ? "bg-red-900/50 border-red-600"
                      : "bg-green-900/50 border-green-600"
                  }
                >
                  <AlertTitle className="text-slate-50 text-lg">
                    {result.Final_Prediction === "Fake"
                      ? "⚠️ Potential Deepfake Detected"
                      : "✅ Content Appears Authentic"}
                  </AlertTitle>
                  <AlertDescription className="text-slate-200">
                    {result.Final_Prediction === "Fake"
                      ? "Our AI analysis suggests this content may be artificially generated or manipulated."
                      : "No signs of artificial manipulation were detected in this content."}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-600">
                    <h3 className="font-semibold text-red-400 mb-3 text-lg">Final Classification</h3>
                    <p className="text-slate-200 text-xl font-bold">{result.Final_Prediction}</p>
                    {result.Confidence_Score && (
                      <p className="text-slate-300 mt-2">
                        Confidence: {(result.Confidence_Score * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>

                  {fileType === "image" && (
                    <>
                      <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-600">
                        <h3 className="font-semibold text-orange-400 mb-3">CNN Analysis</h3>
                        <p className="text-slate-200">{result.CNN_Prediction}</p>
                      </div>

                      <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-600">
                        <h3 className="font-semibold text-yellow-400 mb-3">Metadata Analysis</h3>
                        <p className="text-slate-200">{result.Metadata_Analysis}</p>
                      </div>

                      <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-600">
                        <h3 className="font-semibold text-red-400 mb-3">Noise Pattern Analysis</h3>
                        <p className="text-slate-200">{result.Noise_Pattern_Analysis}</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            className="mt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-center text-white mb-8">
              How Deepfake Detection Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700 text-center">
                <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Upload Content</h3>
                <p className="text-slate-400">Submit your image or video for analysis</p>
              </div>
              <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700 text-center">
                <div className="w-12 h-12 bg-orange-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Analysis</h3>
                <p className="text-slate-400">Multiple algorithms analyze visual patterns and metadata</p>
              </div>
              <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700 text-center">
                <div className="w-12 h-12 bg-yellow-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Get Results</h3>
                <p className="text-slate-400">Receive detailed analysis and confidence scores</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
