import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { config } from "../config";

interface WebEntity {
  description?: string;
  score?: number;
}

interface ImageMatch {
  url: string;
}

interface PageWithMatchingImage {
  url: string;
  page_title?: string;
}

interface ReverseImageSearchResponse {
  pages_with_matching_images: PageWithMatchingImage[];
  full_matching_images: ImageMatch[];
  partial_matching_images: ImageMatch[];
  visually_similar_images: ImageMatch[];
  web_entities: WebEntity[];
  best_guess_labels: string[];
  analysis: string;
}

const ReverseImageSearch = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReverseImageSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      setFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select an image first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${config.apiUrl}/reverse-image-search`,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Network response was not ok");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Error performing reverse search:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to perform reverse search. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const parseAnalysisText = (text: string) => {
    const lines = text.split("\n");
    const sections: { heading?: string; content: string[] }[] = [];
    let currentSection: { heading?: string; content: string[] } = { content: [] };

    lines.forEach((line) => {
      if (line.match(/^(🔍|✅|⚠️|📄|🔎|🏷️)/)) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { heading: line, content: [] };
      } else if (line.startsWith("**") && line.endsWith("**")) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { heading: line.replace(/\*\*/g, ""), content: [] };
      } else if (line.trim()) {
        currentSection.content.push(line);
      }
    });

    if (currentSection.content.length > 0 || currentSection.heading) {
      sections.push(currentSection);
    }

    return sections;
  };

  const getTotalMatches = () => {
    if (!result) return 0;
    return (
      result.full_matching_images.length +
      result.partial_matching_images.length +
      result.visually_similar_images.length
    );
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          🔍 Reverse Image Search
        </motion.h1>

        <motion.p
          className="text-center text-gray-400 mb-8 text-sm md:text-base max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Verify image authenticity by finding similar images on the web. Discover
          if your image is original or edited, and trace it to its source.
        </motion.p>

        {/* Upload Section */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-8 border border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-200">
                Upload Image
              </h2>

              <div
                className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-all duration-300 bg-slate-900/30"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <div className="flex flex-col items-center">
                  <svg
                    className="w-12 h-12 text-gray-400 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-400 mb-1">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    PNG, JPG, JPEG, GIF up to 10MB
                  </p>
                </div>
              </div>

              {error && (
                <motion.div
                  className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ⚠️ {error}
                </motion.div>
              )}

              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={!file || isLoading}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-all duration-300 ${!file || isLoading
                    ? "bg-slate-700 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Searching...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Search Similar Images
                    </>
                  )}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 rounded-lg bg-slate-700 text-gray-300 font-medium hover:bg-slate-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {preview && (
              <motion.div
                className="rounded-lg overflow-hidden bg-slate-900/50 border border-slate-600"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-sm text-gray-400 p-3 bg-slate-800 border-b border-slate-700">
                  Preview
                </div>
                <div className="p-4 flex items-center justify-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-96 rounded-lg shadow-lg"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Results Section */}
        {result && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400">
                  {result.full_matching_images.length}
                </div>
                <div className="text-sm text-gray-400 mt-1">Full Matches</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-700/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {result.partial_matching_images.length}
                </div>
                <div className="text-sm text-gray-400 mt-1">Partial Matches</div>
              </div>
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {result.pages_with_matching_images.length}
                </div>
                <div className="text-sm text-gray-400 mt-1">Web Pages</div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {result.visually_similar_images.length}
                </div>
                <div className="text-sm text-gray-400 mt-1">Similar Images</div>
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-200">
                <svg
                  className="w-6 h-6 mr-2 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Authenticity Analysis
              </h2>
              <div className="prose prose-invert max-w-none">
                {parseAnalysisText(result.analysis).map((section, index) => (
                  <div key={index} className="mb-4">
                    {section.heading && (
                      <h3 className="text-lg font-semibold text-gray-300 mb-2">
                        {section.heading}
                      </h3>
                    )}
                    {section.content.map((line, i) => (
                      <p key={i} className="text-gray-400 mb-2">
                        {line}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Web Entities */}
            {result.web_entities.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-slate-700">
                <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-200">
                  🏷️ Web Entities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.web_entities.map((entity, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-600"
                    >
                      <span className="text-gray-300">
                        {entity.description || "Unknown"}
                      </span>
                      {entity.score && (
                        <span className="text-sm text-blue-400 font-mono">
                          {entity.score.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Best Guess Labels */}
            {result.best_guess_labels.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-slate-700">
                <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-200">
                  🔖 Image Labels
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.best_guess_labels.map((label, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/50 text-blue-300 rounded-full text-sm font-medium"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Full Matches */}
            {result.full_matching_images.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-slate-700">
                <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-200">
                  ✅ Full Matches ({result.full_matching_images.length})
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  These are exact duplicates of your image found online. Check the
                  publication dates to find the original source.
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {result.full_matching_images.map((img, index) => (
                    <a
                      key={index}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-slate-900/50 rounded-lg border border-slate-600 hover:border-green-500 transition-colors group"
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400 group-hover:text-green-400"
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
                        <span className="text-blue-400 group-hover:text-blue-300 break-all text-sm">
                          {img.url}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Pages with Matching Images */}
            {result.pages_with_matching_images.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-slate-700">
                <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-200">
                  📄 Pages with This Image ({result.pages_with_matching_images.length})
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Websites where this image appears. Visit these pages to verify
                  context and find the original source.
                </p>
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {result.pages_with_matching_images.map((page, index) => (
                    <a
                      key={index}
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 bg-slate-900/50 rounded-lg border border-slate-600 hover:border-blue-500 transition-colors group"
                    >
                      <div className="flex items-start">
                        <svg
                          className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-400 flex-shrink-0 mt-0.5"
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
                        <div className="flex-1">
                          <div className="text-gray-300 font-medium group-hover:text-blue-300 mb-1">
                            {page.page_title || "Untitled Page"}
                          </div>
                          <div className="text-sm text-gray-500 break-all">
                            {page.url}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Partial Matches */}
            {result.partial_matching_images.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-slate-700">
                <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-200">
                  ⚠️ Partial Matches ({result.partial_matching_images.length})
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Similar images that may have been cropped, edited, or modified.
                  This could indicate your image has been altered.
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {result.partial_matching_images.map((img, index) => (
                    <a
                      key={index}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-slate-900/50 rounded-lg border border-slate-600 hover:border-yellow-500 transition-colors group"
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400 group-hover:text-yellow-400"
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
                        <span className="text-blue-400 group-hover:text-blue-300 break-all text-sm">
                          {img.url}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Visually Similar */}
            {result.visually_similar_images.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-slate-700">
                <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-200">
                  🔎 Visually Similar Images ({result.visually_similar_images.length})
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Images with similar visual characteristics. These might be from
                  the same event, location, or subject matter.
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {result.visually_similar_images.map((img, index) => (
                    <a
                      key={index}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-slate-900/50 rounded-lg border border-slate-600 hover:border-purple-500 transition-colors group"
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400 group-hover:text-purple-400"
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
                        <span className="text-blue-400 group-hover:text-blue-300 break-all text-sm">
                          {img.url}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {getTotalMatches() === 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-slate-700 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No Similar Images Found
                </h3>
                <p className="text-gray-400">
                  This image doesn't appear to be indexed on the web. It might be
                  original or unpublished.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.9);
        }
      `}</style>
    </div>
  );
};

export default ReverseImageSearch;
