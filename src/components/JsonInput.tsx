// components/JsonInput.tsx
import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Typography,
  useTheme,
  Box,
} from "@mui/material";
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
  scrollToDiffViewer?: () => void; // New prop to trigger scroll
}

const JsonInput = forwardRef(
  (
    {
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
      scrollToDiffViewer, // Destructure the new prop
    }: JsonInputProps,
    ref
  ) => {
    const theme = useTheme();
    const [json1Input, setJson1Input] = useState(
      json1
        ? JSON.stringify(json1, null, 2)
        : '{\n  "id": 1,\n  "traderName": "John Doe",\n  "price": 99.75,\n  "location": "New York",\n  "counterpartyName": "ABC Corp",\n  "commission": 4.5,\n  "address": {\n    "city": "New York",\n    "zip": "10001"\n  }\n}'
    );
    const [json2Input, setJson2Input] = useState(
      json2
        ? JSON.stringify(json2, null, 2)
        : '{\n  "id": 1,\n  "traderName": "John Doe",\n  "price": 100.50,\n  "location": "New York",\n  "counterpartyName": "ABC Corp",\n  "commission": 4.5,\n  "address": {\n    "city": "San Francisco",\n    "zip": "10001"\n  }\n}'
    );
    const [diffingId, setDiffingIdLocal] = useState(diffId || "DIFF-1-TKTAPIAccessor-DEV-2023-01-01");
    const [pxnum, setPxnumLocal] = useState(pxnumIn || "999");
    const [environment, setEnvironmentLocal] = useState(environmentIn || "DEV");
    const [tolerance, setToleranceLocal] = useState("0.0001");
    const [serviceToDiff, setServiceToDiffLocal] = useState(serviceIn || "TKTAPIAccessor");
    const [noResults, setNoResults] = useState(false);
    const [invalidInput, setInvalidInput] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const textField1Ref = useRef<HTMLDivElement>(null);
    const textField2Ref = useRef<HTMLDivElement>(null);

    const handleJsonParse = (
      jsonString: string,
      setJson: (json: any | null) => void,
      inputType: string
    ): boolean => {
      try {
        const cleanedJson = jsonString.trim();
        const parsed = JSON.parse(cleanedJson);
        setJson(parsed);
        setInvalidInput(false);
        return true;
      } catch (e: any) {
        console.log(`Failed to parse ${inputType}:`, e.message);
        setJson(null);
        setInvalidInput(true);
        return false;
      }
    };

    const setJsonInputLocal = (json1Str: string, json2Str: string) => {
      setJson1Input(json1Str);
      setJson2Input(json2Str);
      handleJsonParse(json1Str, setJson1, "json1");
      handleJsonParse(json2Str, setJson2, "json2");
    };

    useImperativeHandle(ref, () => ({
      setJsonInput: setJsonInputLocal,
    }), [setJsonInputLocal]);

    const handleFindResultsAndDiffClick = async () => {
      setInvalidInput(false);
      setNoResults(false);
      const pxnumNumber = parseInt(pxnum || "0", 10) || 0;

      try {
        const diffData = await fetchDiffData(diffingId || "", pxnumNumber, environment, serviceToDiff || "");
        if (diffData && diffData.sunJson && diffData.linuxJson) {
          setJson1(diffData.sunJson);
          setJson2(diffData.linuxJson);
          setJson1Input(JSON.stringify(diffData.sunJson, null, 2));
          setJson2Input(JSON.stringify(diffData.linuxJson, null, 2));
          setNoResults(false);
          // Scroll to the diff viewer section if the callback exists
          if (scrollToDiffViewer) {
            scrollToDiffViewer();
          }
        } else {
          setJson1(null);
          setJson2(null);
          setJson1Input("");
          setJson2Input("");
          setNoResults(true);
          if (scrollToDiffViewer) {
            scrollToDiffViewer();
          }
        }
      } catch (error) {
        console.error("Error fetching diff data:", error);
        setJson1(null);
        setJson2(null);
        setJson1Input("");
        setJson2Input("");
        setNoResults(true);
        if (scrollToDiffViewer) {
          scrollToDiffViewer();
        }
      }
    };

    useEffect(() => {
      if (json1 && json2 && typeof json1 === "object" && typeof json2 === "object" && onCompare) {
        onCompare();
      }
    }, [json1, json2, onCompare]);

    const handleDiffingIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDiffingIdLocal(e.target.value);
      if (setDiffId) setDiffId(e.target.value);
      if (setDiffingId) setDiffingId(e.target.value);
    };

    const handlePxnumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPxnumLocal(e.target.value);
      if (setPxnum) setPxnum(e.target.value);
    };

    const handleEnvironmentChange = (event: any) => {
      const value = event.target.value as string;
      setEnvironmentLocal(value);
      if (setEnvironment) setEnvironment(value);
    };

    const handleToleranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setToleranceLocal(value);
      if (setTolerance) setTolerance(parseFloat(value) || 0);
    };

    const handleServiceToDiffChange = (event: any) => {
      const value = event.target.value as string;
      setServiceToDiffLocal(value);
      if (setServiceToDiff) setServiceToDiff(value);
    };

    const getServicesToDiff = () => {
      const services = fetchServicesToDiff();
      return services.map((service) => (
        <MenuItem key={service} value={service} sx={{ color: "white" }}>
          {service}
        </MenuItem>
      ));
    };

    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "1280px",
          p: 3,
          bgcolor: "background.default",
          borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          background: "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 12px 48px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        {/* Header */}
        <Typography
          variant="h5"
          sx={{
            color: "white",
            textAlign: "center",
            mb: 3,
            fontWeight: 600,
            textShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          JSON Input Comparison
        </Typography>

        {/* Filters Row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
            justifyContent: "center",
          }}
        >
          <Tooltip title="Enter Diffing ID" arrow>
            <TextField
              label="Diffing ID"
              value={diffingId}
              onChange={handleDiffingIdChange}
              variant="outlined"
              sx={{
                flex: 1,
                minWidth: "200px",
                maxWidth: "300px",
                bgcolor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                "& .MuiInputBase-input": { color: "#ff9800" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
              }}
              InputLabelProps={{ sx: { color: "white" } }}
            />
          </Tooltip>
          <Tooltip title="Enter pxnum" arrow>
            <TextField
              label="pxnum"
              value={pxnum}
              onChange={handlePxnumChange}
              variant="outlined"
              sx={{
                flex: 1,
                minWidth: "150px",
                maxWidth: "200px",
                bgcolor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                "& .MuiInputBase-input": { color: "#ff9800" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
              }}
              InputLabelProps={{ sx: { color: "white" } }}
            />
          </Tooltip>
          <Tooltip title="Select Environment" arrow>
            <FormControl
              sx={{
                flex: 1,
                minWidth: "150px",
                maxWidth: "200px",
              }}
              variant="outlined"
            >
              <InputLabel sx={{ color: "white" }}>Environment</InputLabel>
              <Select
                value={environment}
                onChange={handleEnvironmentChange}
                label="Environment"
                sx={{
                  color: "#ff9800",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
                }}
              >
                {fetchEnvironmentsToDiff().map((env) => (
                  <MenuItem key={env} value={env} sx={{ color: "white" }}>
                    {env}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Tooltip>
          <Tooltip title="Set Tolerance for Floating Points" arrow>
            <TextField
              label="Tolerance"
              value={tolerance}
              onChange={handleToleranceChange}
              variant="outlined"
              type="number"
              sx={{
                flex: 1,
                minWidth: "120px",
                maxWidth: "150px",
                bgcolor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                "& .MuiInputBase-input": { color: "#ff9800" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
              }}
              InputLabelProps={{ sx: { color: "white" } }}
            />
          </Tooltip>
          <Tooltip title="Select Service to Diff" arrow>
            <FormControl
              sx={{
                flex: 1,
                minWidth: "150px",
                maxWidth: "200px",
              }}
              variant="outlined"
            >
              <InputLabel sx={{ color: "white" }}>Service To Diff</InputLabel>
              <Select
                value={serviceToDiff}
                onChange={handleServiceToDiffChange}
                label="Service To Diff"
                sx={{
                  color: "#ff9800",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
                }}
              >
                <MenuItem value="" sx={{ color: "white" }}>
                  <em>Select a service</em>
                </MenuItem>
                {getServicesToDiff()}
              </Select>
            </FormControl>
          </Tooltip>
        </Box>

        {/* Button and Messages */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mb: 3 }}>
          <Button
            onClick={handleFindResultsAndDiffClick}
            variant="contained"
            startIcon={<Compare />}
            sx={{
              background: "linear-gradient(45deg, #1e3a8a, #3b82f6)",
              borderRadius: "12px",
              padding: "12px 24px",
              fontWeight: 600,
              textTransform: "none",
              color: "white",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(45deg, #1e40af, #60a5fa)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
              },
            }}
          >
            Find Results and Diff 👩🏻‍🍳
          </Button>
          {invalidInput && (
            <Typography
              variant="body1"
              sx={{
                color: "error.main",
                bgcolor: "rgba(255, 82, 82, 0.1)",
                p: 1,
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              Invalid JSON input. Please check your input and try again.
            </Typography>
          )}
          {noResults && (
            <Typography
              variant="body1"
              sx={{
                color: "warning.main",
                bgcolor: "rgba(255, 167, 38, 0.1)",
                p: 1,
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              No results found
            </Typography>
          )}
        </Box>

        {/* JSON Input Fields */}
        <Box
          ref={containerRef}
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            gap: 3,
            width: "100%",
            minHeight: "600px",
          }}
        >
          <Box
            ref={textField1Ref}
            sx={{
              flex: 1,
              minWidth: "400px",
              maxWidth: "600px",
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              p: 2,
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
              },
            }}
          >
            <TextField
              fullWidth
              multiline
              rows={20}
              label="Response OUT (SUN)"
              value={json1Input}
              onChange={(e) => {
                setJson1Input(e.target.value);
                handleJsonParse(e.target.value, setJson1, "json1");
              }}
              variant="outlined"
              sx={{
                "& .MuiInputBase-root": {
                  height: "100%",
                  color: "#ff9800",
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
              }}
              InputLabelProps={{ sx: { color: "white" } }}
            />
          </Box>
          <Box
            ref={textField2Ref}
            sx={{
              flex: 1,
              minWidth: "400px",
              maxWidth: "600px",
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              p: 2,
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
              },
            }}
          >
            <TextField
              fullWidth
              multiline
              rows={20}
              label="Response OUT (LINUX)"
              value={json2Input}
              onChange={(e) => {
                setJson2Input(e.target.value);
                handleJsonParse(e.target.value, setJson2, "json2");
              }}
              variant="outlined"
              sx={{
                "& .MuiInputBase-root": {
                  height: "100%",
                  color: "#ff9800",
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
              }}
              InputLabelProps={{ sx: { color: "white" } }}
            />
          </Box>
        </Box>
      </Box>
    );
  }
);

export default JsonInput;