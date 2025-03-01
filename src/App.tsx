// src/App.tsx
import React from "react";
import JsonDiffViewer from "./components/JsonDiffViewer";

const App = () => {
  return (
    <div className="h-screen w-screen bg-gray-900 text-white">
      <JsonDiffViewer />
    </div>
  );
};

export default App;