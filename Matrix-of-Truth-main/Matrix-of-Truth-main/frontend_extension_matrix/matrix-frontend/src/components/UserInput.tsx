import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import VideoAnalysis from "./userInput Functions/VideoAnalysis";
import AudioAnalysis from "./userInput Functions/AudioAnalysis";
import ImageAnalysis from "./userInput Functions/ImageAnalysis";
import TextAnalysis from "./userInput Functions/TextAnalysis";
import NewsUrlAnalysis from "./userInput Functions/NewsUrlAnalysis";
import { useState } from "react";

export default function UserInput() {
  const [activeTab, setActiveTab] = useState("text");

  const tabs = [
    { value: "text", label: "Text Input" },
    { value: "url", label: "News URL" },
    { value: "video", label: "Video Analysis" },
    { value: "image", label: "Image Analysis" },
    { value: "audio", label: "Audio Analysis" },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Content Verification
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 z-50 bg-gray-900 pb-4">
          {/* Mobile Dropdown */}
          <div className="sm:hidden w-full mb-4 relative">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full flex items-center justify-between p-3 text-sm bg-gray-800/50 backdrop-blur-sm 
                border border-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                {tabs.find(tab => tab.value === activeTab)?.label}
                <ChevronDown className="h-4 w-4 ml-2" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-[calc(100vw-2rem)] mx-4 bg-gray-800/95 backdrop-blur-sm 
                  border border-gray-700/50 rounded-lg shadow-lg"
                align="center"
                sideOffset={4}
              >
                {tabs.map((tab) => (
                  <DropdownMenuItem
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className="text-white hover:bg-gray-700/50 cursor-pointer p-3 text-sm"
                  >
                    {tab.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Tabs */}
          <TabsList className="hidden sm:flex flex-wrap justify-center gap-2 mb-4 bg-gray-900 p-2 rounded-lg">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-grow sm:flex-grow-0 basis-[calc(50%-0.5rem)] sm:basis-auto p-3 text-sm sm:text-base 
                  bg-gray-800 text-white hover:bg-gray-700 
                  data-[state=active]:bg-blue-600 data-[state=active]:text-white
                  transition-all duration-200 min-w-[120px]"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content */}
        <div className="relative mt-4">
          <TabsContent 
            value={activeTab}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg 
              border border-gray-700/50 p-6 sm:p-8 lg:p-10
              min-h-[calc(100vh-20rem)] 
              transition-all duration-300 animate-in fade-in-50"
          >
            <div className="w-full max-w-4xl mx-auto h-full flex flex-col">
              <div className="flex-1 space-y-6">
                {activeTab === "text" && <TextAnalysis />}
                {activeTab === "url" && <NewsUrlAnalysis />}
                {activeTab === "video" && <VideoAnalysis />}
                {activeTab === "image" && <ImageAnalysis />}
                {activeTab === "audio" && <AudioAnalysis />}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
