import React, { useState, useRef } from "react";
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Tooltip } from "@mui/material";
import { BakeryDining, Compare, FindInPage } from "@mui/icons-material";

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
  onCompare?: () => void; // Define onCompare as an optional callback
}

const JsonInput: React.FC<JsonInputProps> = ({
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
}) => {
  const [json1Input, setJson1Input] = useState("{\n  \"tradeId\": \"TRADE-001\",\n  \"tradeDate\": \"2025-03-01\",\n  \"quantity\": 1000,\n  \"price\": 50.25,\n  \"currency\": \"USD\",\n  \"status\": \"EXECUTED\",\n  \"allocationId\": \"ALLOC-001\",\n  \"accountId\": \"ACC-123\",\n  \"allocatedQuantity\": 1000,\n  \"allocatedPrice\": 50.25,\n  \"allocationDate\": \"2025-03-02\",\n  \"trader\": {\n    \"traderId\": \"TRD-001\",\n    \"traderName\": \"John Doe\",\n    \"department\": \"Equities\",\n    \"location\": \"New York\"\n  },\n  \"counterparty\": {\n    \"counterpartyId\": \"CP-001\",\n    \"counterpartyName\": \"Global Bank\",\n    \"country\": \"USA\"\n  },\n  \"commission\": 0.05,\n  \"fee\": 10.00,\n  \"netValue\": 50150.00,\n  \"executionTime\": \"2025-03-01T10:00:00Z\",\n  \"settlementDate\": \"2025-03-04\",\n  \"isConfirmed\": true,\n  \"notes\": \"Standard equity trade\",\n  \"priority\": \"HIGH\",\n  \"tradeType\": \"BUY\",\n  \"additionalData\": {\n    \"clearingHouse\": \"NYSE\",\n    \"clearingId\": \"CL-001\",\n    \"clearingDate\": \"2025-03-03\"\n  }\n}");
  const [json2Input, setJson2Input] = useState("{\n  \"tradeId\": \"TRADE-001\",\n  \"tradeDate\": \"2025-03-01\",\n  \"quantity\": 1000,\n  \"price\": 50.26,\n  \"currency\": \"USD\",\n  \"status\": \"EXECUTED\",\n  \"allocationId\": \"ALLOC-002\",\n  \"accountId\": \"ACC-124\",\n  \"allocatedQuantity\": 950,\n  \"allocatedPrice\": 50.26,\n  \"allocationDate\": \"2025-03-03\",\n  \"trader\": {\n    \"traderId\": \"TRD-001\",\n    \"traderName\": \"Jane Doe\",\n    \"department\": \"Equities\",\n    \"location\": \"London\"\n  },\n  \"counterparty\": {\n    \"counterpartyId\": \"CP-002\",\n    \"counterpartyName\": \"International Bank\",\n    \"country\": \"UK\"\n  },\n  \"commission\": 0.06,\n  \"fee\": 12.00,\n  \"netValue\": 50162.00,\n  \"executionTime\": \"2025-03-01T10:05:00Z\",\n  \"settlementDate\": \"2025-03-05\",\n  \"isConfirmed\": false,\n  \"priority\": \"MEDIUM\",\n  \"tradeType\": \"BUY\",\n  \"additionalData\": {\n    \"clearingHouse\": \"NASDAQ\",\n    \"clearingId\": \"CL-002\",\n    \"clearingDate\": \"2025-03-04\"\n  },\n  \"newField\": \"New Allocation Note\"\n}");
  const [diffingId, setDiffingIdLocal] = useState("1234-5478-9XXX");
  const [pxnum, setPxnumLocal] = useState("999");
  const [environment, setEnvironmentLocal] = useState("DEV");
  const [tolerance, setToleranceLocal] = useState("0.0001");
  const [serviceToDiff, setServiceToDiffLocal] = useState("TKTAPIAccessor");

  const containerRef = useRef<HTMLDivElement>(null);
  const textField1Ref = useRef<HTMLDivElement>(null);
  const textField2Ref = useRef<HTMLDivElement>(null);

  const handleJsonParse = (jsonString: string, setJson: (json: any | null) => void): boolean => {
    try {
      const cleanedJson = jsonString.trim();
      const parsed = JSON.parse(cleanedJson);
      setJson(parsed);
      return true;
    } catch (e: any) {
      alert(`Invalid JSON format: ${e.message}. Please check your input.`);
      setJson(null);
      return false;
    }
  };

  const handleCompareClick = () => {
    console.log("Compare button clicked");
    const json1Valid = handleJsonParse(json1Input, setJson1);
    const json2Valid = handleJsonParse(json2Input, setJson2);
    if (json1Valid && json2Valid) {
      console.log("Both JSON inputs are valid");
      if (onCompare) onCompare(); // Call the onCompare callback when compare is successful
    }
  };

  const handleFindResultsAndDiffClick = () => {
    console.log("Compare button clicked");
    // TODO: Query TSLogDB
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
    const services = ["TKTAPIAccessor", "CUTSService", "cmmtsvc", "tssvcapi"];
    return services.map((service) => (
      <MenuItem key={service} value={service}>
        {service}
      </MenuItem>
    ));
  };

  return (
    <div style={{ width: "100%", maxWidth: "1280px", padding: "16px" }}>
      {/* New Inputs for Diffing ID, pxnum, Environment, and Tolerance */}
      <div style={{ display: "flex", flexDirection: "row", gap: "24px", marginBottom: "24px" }}>
        <TextField
          label="Diffing ID"
          value={diffingId}
          onChange={handleDiffingIdChange}
          variant="outlined"
          InputProps={{ style: { color: "orange" } }}
          InputLabelProps={{ style: { color: "white" } }}
          sx={{ flex: 1, maxWidth: "300px", backgroundColor: "#2e2c2c" }}
        />
        <TextField
          label="pxnum"
          value={pxnum}
          onChange={handlePxnumChange}
          variant="outlined"
          InputProps={{ style: { color: "orange" } }}
          InputLabelProps={{ style: { color: "white" } }}
          sx={{ flex: 1, maxWidth: "300px", backgroundColor: "#2e2c2c" }}
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
              <MenuItem value="DEV">DEV</MenuItem>
              <MenuItem value="BETA">BETA</MenuItem>
              <MenuItem value="UAT">UAT</MenuItem>
              <MenuItem value="PROD">PROD</MenuItem>
            </Select>
          </FormControl>
        </Tooltip>
        <Tooltip title="Enter tolerance value for floating point values" arrow>
          <TextField
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

      {/* Centered Button */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
        <Button
          onClick={handleFindResultsAndDiffClick}
          variant="contained"
          style={{ backgroundColor: "#FFA500" }}
          startIcon={<FindInPage />}
        >
          Find Results and Diff 
        </Button>
      </div>

      <br />

      {/* Existing Text Fields */}
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
            className="w-full"
            sx={{ height: "100%", width: "100%", backgroundColor: "#2e2c2c" }}
            multiline
            rows={20}
            label="Response OUT (SUN)"
            value={json1Input}
            onChange={(e) => setJson1Input(e.target.value)}
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
            className="w-full"
            sx={{ height: "100%", width: "100%", backgroundColor: "#2e2c2c" }}
            multiline
            rows={20}
            label="Response OUT (LINUX)"
            value={json2Input}
            onChange={(e) => setJson2Input(e.target.value)}
            variant="outlined"
            InputProps={{ style: { color: "white", height: "100%" }, spellCheck: "false" }}
            InputLabelProps={{ style: { color: "white" } }}
          />
        </div>
      </div>

      {/* Centered Button */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
        <Button
          onClick={handleCompareClick}
          variant="contained"
          style={{ backgroundColor: "#FFA500" }}
          startIcon={<Compare />}
        >
          Compare
        </Button>
      </div>
    </div>
  );
};

export default JsonInput;