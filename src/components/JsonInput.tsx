import React, { useState, useEffect } from "react";
import { Button, TextField } from "@mui/material";
import { Compare } from "@mui/icons-material";

interface JsonInputProps {
  onCompare: (json1: any, json2: any) => void;
  json1: any | null;
  setJson1: (json: any | null) => void;
  json2: any | null;
  setJson2: (json: any | null) => void;
  error: string;
  setError: (error: string) => void;
}

const JsonInput: React.FC<JsonInputProps> = ({ onCompare, json1, setJson1, json2, setJson2, error, setError }) => {
  const [json1Input, setJson1Input] = useState('{\n  "id": 1,\n  "name": "Alice",\n  "age": 25,\n  "address": {\n    "city": "New York",\n    "zip": "10001"\n  }\n}');
  const [json2Input, setJson2Input] = useState('{\n  "id": 1,\n  "name": "Alice B.",\n  "age": 26,\n  "address": {\n    "city": "San Francisco",\n    "zip": "94105"\n  }\n}');

  // Parse initial JSON strings when the component mounts
  useEffect(() => {
    handleJsonParse(json1Input, setJson1);
    handleJsonParse(json2Input, setJson2);
  }, []);

  const handleJsonParse = (jsonString: string, setJson: (json: any | null) => void) => {
    try {
      const cleanedJson = jsonString.trim();
      const parsed = JSON.parse(cleanedJson);
      setJson(parsed);
      setError("");
    } catch (e: any) {
      setError(`Invalid JSON format: ${e.message}. Please check your input.`);
      setJson(null);
    }
  };

  const generateDiff = () => {
    if (!json1 || !json2) {
      setError("Please provide valid JSON data for both inputs");
      return;
    }
    onCompare(json1, json2);
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Compare /> Diffing Viewer
      </h1>
      
      <div className="mb-4">
        <TextField
          fullWidth
          multiline
          rows={10}
          label="Response OUT (SUN)"
          value={json1Input}
          onChange={(e) => {
            setJson1Input(e.target.value);
            handleJsonParse(e.target.value, setJson1);
          }}
          variant="outlined"
          InputProps={{ style: { color: 'red' } }}
          InputLabelProps={{ style: { color: 'white' } }}
          error={!!error}
          helperText={error}
          sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' }, '&:hover fieldset': { borderColor: 'white' }, '&.Mui-focused fieldset': { borderColor: 'white' } } }}
        />
      </div>

      <br></br>

      <div className="mb-4">
        <TextField
          fullWidth
          multiline
          rows={10}
          label="Response OUT (Linux)"
          value={json2Input}
          onChange={(e) => {
            setJson2Input(e.target.value);
            handleJsonParse(e.target.value, setJson2);
          }}
          variant="outlined"
          InputProps={{ style: { color: 'red' } }}
          InputLabelProps={{ style: { color: 'white' } }}
          error={!!error}
          helperText={error}
          sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' }, '&:hover fieldset': { borderColor: 'white' }, '&.Mui-focused fieldset': { borderColor: 'white' } } }}
        />
      </div>

      <br></br>

      <Button onClick={generateDiff} variant="contained" className="mb-4 bg-blue-500">
        Compare
      </Button>

    </div>
  );
};

export default JsonInput; // Ensure default export for TypeScript