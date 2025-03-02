import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Tooltip, Typography } from "@mui/material";
import { Compare } from "@mui/icons-material";
import { fetchDiffData, fetchEnvironmentsToDiff, fetchServicesToDiff } from "../services/dataService";

interface JsonInputProps {
  json1: any | null;
  setJson1: (json: any | null) => void;
  json2: any | null;
  setJson2: (json: any | null) => void;
  setDiffingId?: (id: string) => void;
  setPxnum?: (pxnum: string) => void;
  setEnvironment?: (env: string) => void;
  setTolerance?: (tolerance: number) => void;
  setServiceToDiff?: (serviceToDiff: string) => void;
  onCompare?: () => void;
  diffId?: string | null;
  setDiffId?: (diffId: string | null) => void;
  setJsonInput?: (json1Str: string, json2Str: string) => void;
  pxnumIn?: string | null;
  environmentIn?: string | null;
  serviceIn?: string | null;
}

const JsonInput = forwardRef(({
  json1,
  setJson1,
  json2,
  setJson2,
  setDiffingId,
  setPxnum,
  setEnvironment,
  setTolerance,
  setServiceToDiff,
  onCompare,
  diffId,
  setDiffId,
  setJsonInput,
  pxnumIn,
  environmentIn,
  serviceIn,
}: JsonInputProps, ref) => {
  const [json1Input, setJson1Input] = useState(json1 ? JSON.stringify(json1, null, 2) :"{\n  \"id\": 1,\n  \"traderName\": \"John Doe\",\n  \"price\": 99.75,\n  \"location\": \"New York\",\n  \"counterpartyName\": \"ABC Corp\",\n  \"commission\": 4.5,\n  \"address\": {\n    \"city\": \"New York\",\n    \"zip\": \"10001\"\n  }\n}");
  const [json2Input, setJson2Input] = useState(json2 ? JSON.stringify(json2, null, 2) : "{\n  \"id\": 1,\n  \"traderName\": \"John Doe\",\n  \"price\": 100.50,\n  \"location\": \"New York\",\n  \"counterpartyName\": \"ABC Corp\",\n  \"commission\": 4.5,\n  \"address\": {\n    \"city\": \"San Francisco\",\n    \"zip\": \"10001\"\n  }\n}");
  const [diffingId, setDiffingIdLocal] = useState(diffId ? diffId : "DIFF-1-TKTAPIAccessor-DEV-2023-01-01");
  const [pxnum, setPxnumLocal] = useState(pxnumIn ? pxnumIn : "999");
  const [environment, setEnvironmentLocal] = useState(environmentIn ? environmentIn : "DEV");
  const [tolerance, setToleranceLocal] = useState("0.0001");
  const [serviceToDiff, setServiceToDiffLocal] = useState(serviceIn ? serviceIn : "TKTAPIAccessor");
  const [noResults, setNoResults] = useState(false); // State for no results (Find Results and Diff/Compare)
  const [invalidInput, setInvalidInput] = useState(false); // State for invalid JSON input

  const containerRef = useRef<HTMLDivElement>(null);
  const textField1Ref = useRef<HTMLDivElement>(null);
  const textField2Ref = useRef<HTMLDivElement>(null);

  console.log("JsonInput rendered with json1Input:", json1Input, "json2Input:", json2Input, "diffingId:", diffingId, "noResults:", noResults, "invalidInput:", invalidInput);

  const handleJsonParse = (jsonString: string, setJson: (json: any | null) => void, inputType: string): boolean => {
    try {
      const cleanedJson = jsonString.trim();
      const parsed = JSON.parse(cleanedJson);
      console.log(`Parsed ${inputType} successfully:`, parsed);
      setJson(parsed);
      setInvalidInput(false); // Reset invalid input if parsing succeeds
      return true;
    } catch (e: any) {
      console.log(`Failed to parse ${inputType}:`, e.message);
      setJson(null);
      setInvalidInput(true); // Set invalid input state
      return false;
    }
  };

  const setJsonInputLocal = (json1Str: string, json2Str: string) => {
    console.log("setJsonInputLocal called with json1Str:", json1Str, "json2Str:", json2Str);
    console.log("Current json1Input before update:", json1Input, "json2Input:", json2Input);
    setJson1Input(prev => {
      const newValue = json1Str;
      console.log("Setting json1Input to:", newValue);
      return newValue;
    });
    setJson2Input(prev => {
      const newValue = json2Str;
      console.log("Setting json2Input to:", newValue);
      return newValue;
    });
    handleJsonParse(json1Str, setJson1, "json1");
    handleJsonParse(json2Str, setJson2, "json2");
    console.log("After update attempt, json1Input:", json1Input, "json2Input:", json2Input);
  };

  useImperativeHandle(ref, () => ({
    setJsonInput: setJsonInputLocal,
  }), [setJsonInputLocal]);

  const handleCompareClick = () => {
    console.log("Compare button clicked");
    setInvalidInput(false); // Reset invalid input state
    setNoResults(false); // Reset no results state
    const json1Valid = handleJsonParse(json1Input, setJson1, "json1");
    const json2Valid = handleJsonParse(json2Input, setJson2, "json2");
    if (json1Valid && json2Valid) {
      console.log("Both JSON inputs are valid, json1:", json1, "json2:", json2);
      if (json1 === null && json2 === null) {
        console.log("No valid results found, clearing input boxes");
        setJson1Input(""); // Clear the json1 input box
        setJson2Input(""); // Clear the json2 input box
        setNoResults(true); // Set no results state for Compare
      }
      if (onCompare) onCompare();
    }
  };

  const handleFindResultsAndDiffClick = async () => {
    console.log("Find Results and Diff button clicked");
    setInvalidInput(false); // Reset invalid input state
    setNoResults(false); // Reset no results state

    // Convert pxnum to number (assuming it's a string from the TextField, default to 0 if empty or invalid)
    const pxnumNumber = parseInt(pxnum || "0", 10) || 0;

    try {
      // Call fetchDiffData with diffingId, pxnum, environment, and serviceToDiff
      const diffData = await fetchDiffData(diffingId || "", pxnumNumber, environment, serviceToDiff || "");
      console.log("fetchDiffData response:", diffData);

      if (diffData && diffData.sunJson && diffData.linuxJson) {
        setJson1(diffData.sunJson);
        setJson2(diffData.linuxJson);
        setJson1Input(JSON.stringify(diffData.sunJson, null, 2)); // Use setState to update json1Input
        setJson2Input(JSON.stringify(diffData.linuxJson, null, 2)); // Use setState to update json2Input
        console.log("SUN INPUT", JSON.stringify(diffData.sunJson, null, 2));
        setNoResults(false); // Clear no results state if data is found
      } else {
        console.log("No diff data found, clearing input boxes");
        setJson1(null);
        setJson2(null);
        setJson1Input(""); // Clear the json1 input box
        setJson2Input(""); // Clear the json2 input box
        setNoResults(true); // Set no results state
      }
    } catch (error) {
      console.error("Error fetching diff data:", error);
      setJson1(null);
      setJson2(null);
      setJson1Input(""); // Clear the json1 input box
      setJson2Input(""); // Clear the json2 input box
      setNoResults(true); // Set no results state for error case
    }

    // No need to parse again here since fetchDiffData already provides the data
    // const json1Valid = handleJsonParse(json1Input, setJson1, "json1");
    // const json2Valid = handleJsonParse(json2Input, setJson2, "json2");

    // if (!json1Valid || !json2Valid) {
    //   console.log("Invalid JSON input detected, clearing input boxes");
    //   setJson1Input(""); // Clear the json1 input box
    //   setJson2Input(""); // Clear the json2 input box
    //   return; // Exit early if input is invalid
    // }

    console.log("Both JSON inputs are valid, json1:", json1, "json2:", json2, "diffingId:", diffingId, "pxnum:", pxnum, "environment:", environment, "serviceToDiff:", serviceToDiff);
  };

  const handleDiffingIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiffingIdLocal(e.target.value);
    if (setDiffingId) setDiffingId(e.target.value);
  };

  const handlePxnumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPxnumLocal(e.target.value);
    if (setPxnum) setPxnum(e.target.value);
  };

  const handleEnvironmentChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setEnvironmentLocal(value);
    if (setEnvironment) setEnvironment(value);
  };

  const handleToleranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToleranceLocal(value);
    if (setTolerance) setTolerance(parseFloat(value) || 0);
  };

  const handleServiceToDiffChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setServiceToDiffLocal(value);
    if (setServiceToDiff) setServiceToDiff(value);
  };

  const getServicesToDiff = () => {
    const services = fetchServicesToDiff();
    return services.map((service) => (
      <MenuItem key={service} value={service}>
        {service}
      </MenuItem>
    ));
  };

  return (
    <div style={{ width: "100%", maxWidth: "1280px", padding: "16px" }}>
      <div style={{ display: "flex", flexDirection: "row", gap: "24px", marginBottom: "24px" }}>
        <TextField
          // Removed key prop to prevent re-mounting and duplicate fields
          label="Diffing ID"
          value={diffingId}
          onChange={handleDiffingIdChange}
          variant="outlined"
          InputProps={{ style: { color: "orange" } }}
          InputLabelProps={{ style: { color: "white" } }}
          sx={{ flex: 1, maxWidth: "300px", backgroundColor: "#2e2c2c" }}
        />
        <TextField
          // Removed key prop to prevent re-mounting and duplicate fields
          label="pxnum"
          value={pxnum}
          onChange={handlePxnumChange}
          variant="outlined"
          InputProps={{ style: { color: "orange" } }}
          InputLabelProps={{ style: { color: "white" } }}
          sx={{ flex: "1", maxWidth: "300px", backgroundColor: "#2e2c2c" }}
        />
        <Tooltip title="Environment to diff on" arrow>
          <FormControl sx={{ flex: 1, maxWidth: "200px" }} variant="outlined">
            <InputLabel style={{ color: "white" }}>Environment</InputLabel>
            <Select
              value={environment}
              onChange={handleEnvironmentChange}
              label="Environment"
              sx={{ color: "orange", backgroundColor: "#2e2c2c", "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" } }}
              MenuProps={{ PaperProps: { style: { backgroundColor: "#2e2c2c", color: "white" } } }}
            >
              {fetchEnvironmentsToDiff().map((env) => (
                <MenuItem key={env} value={env} style={{ color: "white" }}>{env}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Tooltip>
        <Tooltip title="Enter tolerance value for floating point values" arrow>
          <TextField
            // Removed key prop to prevent re-mounting and duplicate fields
            label="Tolerance"
            value={tolerance}
            onChange={handleToleranceChange}
            variant="outlined"
            type="number"
            InputProps={{ style: { color: "orange" } }}
            InputLabelProps={{ style: { color: "white" } }}
            sx={{ flex: 1, maxWidth: "150px", backgroundColor: "#2e2c2c" }}
          />
        </Tooltip>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: "24px", marginBottom: "24px", justifyContent: "center" }}>
        <Tooltip title="Service to Diff on" arrow>
          <FormControl sx={{ flex: 1, maxWidth: "200px" }} variant="outlined">
            <InputLabel style={{ color: "white" }}>Service To DIFF</InputLabel>
            <Select
              value={serviceToDiff}
              onChange={handleServiceToDiffChange}
              label="Service To DIFF"
              sx={{ 
                color: "orange", 
                backgroundColor: "#2e2c2c",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" }
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    backgroundColor: "#2e2c2c",
                    color: "white",
                  },
                },
              }}
            >
              <MenuItem value="">
                <em>Select a service</em>
              </MenuItem>
              {getServicesToDiff()}
            </Select>
          </FormControl>
        </Tooltip>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <Button
          onClick={handleFindResultsAndDiffClick}
          variant="contained"
          style={{ backgroundColor: "#3b82f6" }}
          startIcon={<Compare />}
        >
          Find Results and Diff 👩🏻‍🍳
        </Button>
        {invalidInput && (
          <Typography
            variant="body1"
            sx={{
              color: "#ff4444", // Red color for visibility
              fontWeight: "bold",
              backgroundColor: "rgba(255, 68, 68, 0.1)", // Light red background
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #ff4444",
              marginTop: "8px",
            }}
          >
            Invalid JSON input. Please check your input and try again.
          </Typography>
        )}
        {noResults && (
          <Typography
            variant="body1"
            sx={{
              color: "#ff4444", // Red color for visibility
              fontWeight: "bold",
              backgroundColor: "rgba(255, 68, 68, 0.1)", // Light red background
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #ff4444",
              marginTop: "8px",
            }}
          >
            No results found
          </Typography>
        )}
      </div>

      <br />

      <div
        ref={containerRef}
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          gap: "24px",
          width: "100%",
          minHeight: "600px",
        }}
      >
        <div
          ref={textField1Ref}
          style={{ flex: 1, minWidth: "400px", maxWidth: "600px" }}
        >
          <TextField
            // Removed key prop to prevent re-mounting and duplicate fields
            className="w-full"
            sx={{ height: "100%", width: "100%", backgroundColor: "#2e2c2c" }}
            multiline
            rows={20}
            label="Response OUT (SUN)"
            value={json1Input}
            onChange={(e) => {
              setJson1Input(e.target.value);
              handleJsonParse(e.target.value, setJson1, "json1");
            }}
            variant="outlined"
            InputProps={{ style: { color: "white", height: "100%" }, spellCheck: "false" }}
            InputLabelProps={{ style: { color: "white" } }}
          />
        </div>
        <div
          ref={textField2Ref}
          style={{ flex: 1, minWidth: "400px", maxWidth: "600px" }}
        >
          <TextField
            // Removed key prop to prevent re-mounting and duplicate fields
            className="w-full"
            sx={{ height: "100%", width: "100%", backgroundColor: "#2e2c2c" }}
            multiline
            rows={20}
            label="Response OUT (LINUX)"
            value={json2Input}
            onChange={(e) => {
              setJson2Input(e.target.value);
              handleJsonParse(e.target.value, setJson2, "json2");
            }}
            variant="outlined"
            InputProps={{ style: { color: "white", height: "100%" }, spellCheck: "false" }}
            InputLabelProps={{ style: { color: "white" } }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <Button
          onClick={handleCompareClick}
          variant="contained"
          style={{ backgroundColor: "#3b82f6" }}
          startIcon={<Compare />}
        >
          Compare
        </Button>
        {invalidInput && (
          <Typography
            variant="body1"
            sx={{
              color: "#ff4444", // Red color for visibility
              fontWeight: "bold",
              backgroundColor: "rgba(255, 68, 68, 0.1)", // Light red background
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #ff4444",
              marginTop: "8px",
            }}
          >
            Invalid JSON input. Please check your input and try again.
          </Typography>
        )}
        {noResults && (
          <Typography
            variant="body1"
            sx={{
              color: "#ff4444", // Red color for visibility
              fontWeight: "bold",
              backgroundColor: "rgba(255, 68, 68, 0.1)", // Light red background
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #ff4444",
              marginTop: "8px",
            }}
          >
            No results found
          </Typography>
        )}
      </div>
    </div>
  );
});

export default JsonInput;