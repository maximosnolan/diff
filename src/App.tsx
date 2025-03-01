import React, { useState, useEffect, useRef } from "react";
import { AppBar, Tabs, Tab, Box, Toolbar, Typography } from "@mui/material";
import JsonInput from "./components/JsonInput";
import JsonDiffViewer from "./components/JsonDiffViewer";
import GenerateReport from "./components/GenerateReport";
import DiffSelectionPage from "./components/DiffSelectionPage";

const App = () => {
  const [json1, setJson1] = useState<any | null>(null);
  const [json2, setJson2] = useState<any | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [tolerance, setTolerance] = useState<number>(0.0001);
  const [serviceToDiff, setServiceToDiff] = useState<string>("TKTAPIAccessor");
  const [shouldExpand, setShouldExpand] = useState<boolean>(false);
  const [diffId, setDiffId] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<string>("DEV");
  const [serviceName, setServiceName] = useState<string>("TKTAPIAccessor");
  const [pxnum, setPxnum] = useState<string>("999");
  const jsonInputRef = useRef<{ setJsonInput: (json1Str: string, json2Str: string) => void }>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log("Current screen width:", windowWidth);
    console.log(windowWidth < 640 ? "Screen is small" : "Screen is large");
  }, [windowWidth]);

  useEffect(() => {
    console.log("jsonInputRef current value:", jsonInputRef.current);
  }, [jsonInputRef.current, currentTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCompare = () => {
    console.log("handleCompare called, setting shouldExpand to true");
    setShouldExpand(true);
  };

  const handleSelectDiffId = (
    selectedDiffId: string,
    json1Data: any,
    json2Data: any,
    triggerCompare: boolean,
    setJsonInput: (json1Str: string, json2Str: string) => void,
    env: string,
    svc: string,
    px: string
  ) => {
    setDiffId(selectedDiffId);
    setJson1(json1Data);
    setJson2(json2Data);
    setEnvironment(env);
    setServiceName(svc);
    setPxnum(px);
    setCurrentTab(0);
    const json1Str = JSON.stringify(json1Data, null, 2);
    const json2Str = JSON.stringify(json2Data, null, 2);
    console.log("handleSelectDiffId calling setJsonInput with:", json1Str, json2Str);
    if (jsonInputRef.current && jsonInputRef.current.setJsonInput) {
      jsonInputRef.current.setJsonInput(json1Str, json2Str);
      console.log("setJsonInput called via ref with:", json1Str, json2Str);
    } else {
      console.log("jsonInputRef.current is undefined, attempting to use passed setJsonInput");
      if (setJsonInput) {
        setJsonInput(json1Str, json2Str);
        console.log("setJsonInput called with fallback:", json1Str, json2Str);
      }
    }
    if (triggerCompare) {
      handleCompare();
    }
    console.log("Selected Diff ID:", selectedDiffId, "Environment:", env, "Service:", svc, "Pxnum:", px);
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
            <Tab label="Diff Selection" />
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
                ref={jsonInputRef}
                json1={json1}
                setJson1={setJson1}
                json2={json2}
                setJson2={setJson2}
                setTolerance={setTolerance}
                setServiceToDiff={setServiceToDiff}
                onCompare={handleCompare}
                diffId={diffId}
                setDiffId={setDiffId}
                pxnumIn={pxnum}
                environmentIn={environment}
                serviceIn={serviceName}
              />
            </div>
            <div className="w-full sm:w-1/2">
              <JsonDiffViewer
                json1={json1}
                json2={json2}
                tolerance={tolerance}
                shouldExpand={shouldExpand}
                setShouldExpand={setShouldExpand}
                diffId={diffId}
              />
            </div>
          </div>
        )}
        {currentTab === 1 && (
          <div className="w-full max-w-7xl px-4">
            <GenerateReport json1={json1} json2={json2} tolerance={tolerance} />
          </div>
        )}
        {currentTab === 2 && (
          <div className="w-full max-w-7xl px-4">
            <DiffSelectionPage onSelectDiffId={handleSelectDiffId} />
          </div>
        )}
      </Box>
    </div>
  );
};

export default App;