import React, { useState, useEffect, useRef } from "react";
import { Button, TextField } from "@mui/material";
import { Compare } from "@mui/icons-material";

interface JsonInputProps {
  json1: any | null;
  setJson1: (json: any | null) => void;
  json2: any | null;
  setJson2: (json: any | null) => void;
}

const JsonInput: React.FC<JsonInputProps> = ({ json1, setJson1, json2, setJson2 }) => {
  const [json1Input, setJson1Input] = useState('{\n  "id": 1,\n  "name": "Alice",\n  "age": 25,\n  "address": {\n    "city": "New York",\n    "zip": "10001"\n  }\n}');
  const [json2Input, setJson2Input] = useState('{\n  "id": 1,\n  "name": "Alice B.",\n  "age": 26,\n  "address": {\n    "city": "San Francisco",\n    "zip": "94105"\n  }\n}');

  const containerRef = useRef<HTMLDivElement>(null);
  const textField1Ref = useRef<HTMLDivElement>(null);
  const textField2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    handleJsonParse(json1Input, setJson1);
    handleJsonParse(json2Input, setJson2);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      console.log("Container width:", containerRef.current.offsetWidth);
      console.log("Container computed style:", window.getComputedStyle(containerRef.current).display);
    }
    if (textField1Ref.current) {
      console.log("TextField 1 width:", textField1Ref.current.offsetWidth);
    }
    if (textField2Ref.current) {
      console.log("TextField 2 width:", textField2Ref.current.offsetWidth);
    }
  }, [json1Input, json2Input]);

  const handleJsonParse = (jsonString: string, setJson: (json: any | null) => void) => {
    try {
      const cleanedJson = jsonString.trim();
      const parsed = JSON.parse(cleanedJson);
      setJson(parsed);
    } catch (e: any) {
      alert(`Invalid JSON format: ${e.message}. Please check your input.`);
      setJson(null);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "1280px", padding: "16px" }}>
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
            sx={{ height: "100%", width: "100%" }}
            multiline
            rows={20}
            label="Response OUT (SUN)"
            value={json1Input}
            onChange={(e) => {
              setJson1Input(e.target.value);
              handleJsonParse(e.target.value, setJson1);
            }}
            variant="outlined"
            InputProps={{ style: { color: "red", height: "100%" } }}
            InputLabelProps={{ style: { color: "white" } }}
          />
        </div>
        <div
          ref={textField2Ref}
          style={{ flex: 1, minWidth: "400px", maxWidth: "600px" }}
        >
          <TextField
            className="w-full"
            sx={{ height: "100%", width: "100%" }}
            multiline
            rows={20}
            label="Response OUT (LINUX)"
            value={json2Input}
            onChange={(e) => {
              setJson2Input(e.target.value);
              handleJsonParse(e.target.value, setJson2);
            }}
            variant="outlined"
            InputProps={{ style: { color: "red", height: "100%" } }}
            InputLabelProps={{ style: { color: "white" } }}
          />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
        <Button
          onClick={() => {
            console.log("Compare button clicked");
          }}
          variant="contained"
          style={{ backgroundColor: "#3b82f6" }}
          startIcon={<Compare />}
        >
          Compare
        </Button>
      </div>
    </div>
  );
};

export default JsonInput;