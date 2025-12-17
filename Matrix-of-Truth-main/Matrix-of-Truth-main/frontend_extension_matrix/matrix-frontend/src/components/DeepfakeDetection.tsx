import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AudioDeepfakeDetection from "./AudioDeepfakeDetection";
import DeepFakeImageVideo from "./DeepFakeImageVideo";
import ReverseImageSearch from "./ReverseImageSearch";

export default function DeepfakeDetection() {
  return (
    <Tabs defaultValue="image-video" className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-8 rounded-lg h-auto bg-slate-800 p-2">
        <TabsTrigger
          value="image-video"
          className="p-3 text-xs sm:text-sm bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 transition-all whitespace-nowrap"
        >
          Image/Video Detection
        </TabsTrigger>
        <TabsTrigger
          value="reverse-search"
          className="p-3 text-xs sm:text-sm bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 transition-all whitespace-nowrap"
        >
          Reverse Image Search
        </TabsTrigger>
        <TabsTrigger
          value="audio"
          className="p-3 text-xs sm:text-sm bg-gray-800 text-white hover:bg-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-red-600 transition-all whitespace-nowrap"
        >
          Audio Detection
        </TabsTrigger>
      </TabsList>

      <TabsContent value="image-video">
        <DeepFakeImageVideo />
      </TabsContent>

      <TabsContent value="reverse-search">
        <ReverseImageSearch />
      </TabsContent>

      <TabsContent value="audio">
        <AudioDeepfakeDetection />
      </TabsContent>
    </Tabs>
  );
}
