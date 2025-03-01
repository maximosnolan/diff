// App.tsx
import React, { useState, useEffect } from "react";
import { AppBar, Tabs, Tab, Box, Toolbar, Typography } from "@mui/material";
import JsonInput from "./components/JsonInput";
import JsonDiffViewer from "./components/JsonDiffViewer";
import GenerateReport from "./components/GenerateReport";

const App = () => {
  const [json1, setJson1] = useState<any | null>(null);
  const [json2, setJson2] = useState<any | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [tolerance, setTolerance] = useState<number>(0.0001);
  const [serviceToDiff, setServiceToDiff] = useState<string>("TKTAPIAccessor");
  const [shouldExpand, setShouldExpand] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log("Current screen width:", windowWidth);
    console.log(windowWidth < 640 ? "Screen is small" : "Screen is large");
  }, [windowWidth]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCompare = () => {
    console.log("handleCompare called, setting shouldExpand to true"); // Debug log
    setShouldExpand(true);
  };

  return (
    <div className="h-screen w-screen bg-gray-200 text-white flex flex-col">
      <AppBar position="static" sx={{ backgroundColor: "#1a202c" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Linux Migration Diffing Tool
          </Typography>
          <Tabs value={currentTab} onChange={handleTabChange} textColor="inherit" indicatorColor="secondary">
            <Tab label="JSON Diff" />
            <Tab label="Generate Report" />
          </Tabs>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: 6,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflowX: "hidden",
        }}
      >
        {currentTab === 0 && (
          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-7xl px-4">
            <div className="w-full sm:w-1/2">
              <JsonInput
                json1={json1}
                setJson1={setJson1}
                json2={json2}
                setJson2={setJson2}
                setTolerance={setTolerance}
                setServiceToDiff={setServiceToDiff}
                onCompare={handleCompare}
              />
            </div>
            <div className="w-full sm:w-1/2">
              <JsonDiffViewer
                json1={json1}
                json2={json2}
                tolerance={tolerance}
                shouldExpand={shouldExpand}
                setShouldExpand={setShouldExpand}
              />
            </div>
          </div>
        )}
        {currentTab === 1 && (
          <div className="w-full max-w-7xl px-4">
            <GenerateReport json1={json1} json2={json2} tolerance={tolerance} />
          </div>
        )}
      </Box>
    </div>
  );
};

export default App;