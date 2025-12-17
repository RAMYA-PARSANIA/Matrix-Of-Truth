// Example React/TypeScript component for Reverse Image Search
// This can be integrated into your Matrix frontend

import React, { useState } from 'react';

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

const ReverseImageSearch: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ReverseImageSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResults(null);
      setError(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const performReverseSearch = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8000/reverse-image-search', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ReverseImageSearchResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error performing reverse search:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysis = (text: string) => {
    // Convert markdown-style formatting to HTML
    return text.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={index} className="font-bold text-lg mt-4">{line.slice(2, -2)}</h3>;
      }
      if (line.match(/^[🔍✅⚠️📄🔎🏷️]/)) {
        return <p key={index} className="mt-2">{line}</p>;
      }
      if (line.match(/^\d+\./)) {
        return <li key={index} className="ml-6">{line}</li>;
      }
      return <p key={index}>{line}</p>;
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Reverse Image Search</h1>
      <p className="text-gray-600 mb-6">
        Upload an image to find similar images on the web and verify if it's original or edited.
      </p>

      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {previewUrl && (
          <div className="mb-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-xs max-h-64 rounded-lg shadow-md"
            />
          </div>
        )}

        <button
          onClick={performReverseSearch}
          disabled={!selectedFile || loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 
            disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Searching...' : 'Search for Similar Images'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Analysis</h2>
            <div className="prose max-w-none">
              {renderAnalysis(results.analysis)}
            </div>
          </div>

          {/* Web Entities */}
          {results.web_entities.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">🏷️ Web Entities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.web_entities.map((entity, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>{entity.description || 'Unknown'}</span>
                    {entity.score && (
                      <span className="text-sm text-gray-600">
                        Score: {entity.score.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best Guess Labels */}
          {results.best_guess_labels.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">🔖 Labels</h2>
              <div className="flex flex-wrap gap-2">
                {results.best_guess_labels.map((label, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Matches */}
          {results.full_matching_images.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">
                ✅ Full Matches ({results.full_matching_images.length})
              </h2>
              <ul className="space-y-2">
                {results.full_matching_images.map((img, index) => (
                  <li key={index}>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {img.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pages with Matching Images */}
          {results.pages_with_matching_images.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">
                📄 Pages with This Image ({results.pages_with_matching_images.length})
              </h2>
              <ul className="space-y-3">
                {results.pages_with_matching_images.map((page, index) => (
                  <li key={index} className="p-3 bg-gray-50 rounded">
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {page.page_title || page.url}
                    </a>
                    {page.page_title && (
                      <p className="text-sm text-gray-600 mt-1 break-all">{page.url}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Partial Matches */}
          {results.partial_matching_images.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">
                ⚠️ Partial Matches ({results.partial_matching_images.length})
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                These images are similar but may have been edited, cropped, or modified.
              </p>
              <ul className="space-y-2">
                {results.partial_matching_images.map((img, index) => (
                  <li key={index}>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {img.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Visually Similar */}
          {results.visually_similar_images.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">
                🔎 Visually Similar Images ({results.visually_similar_images.length})
              </h2>
              <ul className="space-y-2">
                {results.visually_similar_images.map((img, index) => (
                  <li key={index}>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {img.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReverseImageSearch;
