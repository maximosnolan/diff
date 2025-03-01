import React, { useState, useEffect } from "react";
import JsonInput from "./components/JsonInput";
import JsonDiffViewer from "./components/JsonDiffViewer";

const App = () => {
  const [json1, setJson1] = useState<any | null>(null);
  const [json2, setJson2] = useState<any | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  // Add an effect to listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add event listener for window resizing
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Log the current window width and determine the screen size
  useEffect(() => {
    console.log("Current screen width:", windowWidth);
    if (windowWidth < 640) {
      console.log("Screen is small (below sm breakpoint)");
    } else {
      console.log("Screen is large (sm breakpoint or above)");
    }
  }, [windowWidth]);

  return (
<div className="h-screen w-screen bg-gray-200 text-white p-6 flex justify-center items-center">
  <div className="flex flex-col sm:flex-row gap-6 w-full max-w-7xl px-4"> {/* Added px-4 for padding */}
    <div className="w-full sm:w-1/2">
      <JsonInput json1={json1} setJson1={setJson1} json2={json2} setJson2={setJson2} />
    </div>
    <div className="w-full sm:w-1/2">
      <JsonDiffViewer json1={json1} json2={json2} />
    </div>
  </div>
</div>

  );
};

export default App;
