// components/GenerateReport.tsx
import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

interface GenerateReportProps {
  json1?: any | null;
  json2?: any | null;
  tolerance?: number;
}

const GenerateReport: React.FC<GenerateReportProps> = ({ json1, json2, tolerance }) => {
  const [environment, setEnvironment] = useState<string>("DEV");
  const [serviceName, setServiceName] = useState<string>("TKTAPIAccessor");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [emails, setEmails] = useState<string>("");
  const [markDiffed, setMarkDiffed] = useState<boolean>(false);
  const [sendEmail, setSendEmail] = useState<boolean>(false);
  const [createJIRA, setCreateJIRA] = useState<boolean>(false);

  const handleGenerateReport = () => {
    if (!json1 || !json2) {
      alert("Please load JSON data in the JSON Diff tab first!");
      return;
    }
    const reportData = {
      json1,
      json2,
      tolerance,
      environment,
      serviceName,
      dateRange: [startDate, endDate],
      emails: sendEmail ? emails.split(",").map((email) => email.trim()) : [],
      options: { markDiffed, sendEmail, createJIRA },
    };
    console.log("Generating report with:", reportData);
    alert("Report generated! Check console for details.");
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
    <Box
      sx={{
        p: 4,
        backgroundColor: "#1a202c",
        color: "white",
        borderRadius: "8px",
        height: "100%",
        width: "100%",
        maxWidth: "600px", // Constrain width to prevent overflow
        margin: "0 auto", // Center the box
        overflow: "hidden", // Prevent internal scrolling
      }}
    >
      <Typography variant="h4" gutterBottom>
        Generate Report
      </Typography>
      <Typography variant="body1" gutterBottom>
        Configure and generate a report based on the JSON diff data.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}>
        {/* Environment Dropdown */}
        <Tooltip title="Select environment for the report" arrow>
          <FormControl variant="outlined" sx={{ maxWidth: "200px" }}>
            <InputLabel style={{ color: "white" }}>Environment</InputLabel>
            <Select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as string)}
              label="Environment"
              sx={{
                color: "red",
                backgroundColor: "#2e2c2c",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
              }}
              MenuProps={{
                PaperProps: {
                  style: { backgroundColor: "#2e2c2c", color: "white" },
                },
              }}
            >
              <MenuItem value="DEV">DEV</MenuItem>
              <MenuItem value="BETA">BETA</MenuItem>
              <MenuItem value="UAT">UAT</MenuItem>
              <MenuItem value="PROD">PROD</MenuItem>
            </Select>
          </FormControl>
        </Tooltip>

        {/* Service Name Dropdown */}
        <Tooltip title="Select service for the report" arrow>
          <FormControl variant="outlined" sx={{ maxWidth: "200px" }}>
            <InputLabel style={{ color: "white" }}>Service Name</InputLabel>
            <Select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value as string)}
              label="Service Name"
              sx={{
                color: "red",
                backgroundColor: "#2e2c2c",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
              }}
              MenuProps={{
                PaperProps: {
                  style: { backgroundColor: "#2e2c2c", color: "white" },
                },
              }}
            >
              {getServicesToDiff()}
            </Select>
          </FormControl>
        </Tooltip>

        {/* Date Pickers */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", boarder: "white"}}>
            <DatePicker
              label="Start Date"
              value={startDate}
              sx={{
                backgroundColor: "#2e2c2c",
                maxWidth: "200px",
                "& .MuiInputBase-root": {
                  backgroundColor: "#2e2c2c",
                },
                "& .MuiInputBase-input": {
                  color: "white !important", // Ensure date text is white
                  backgroundColor: "#2e2c2c",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "white",
                },
                "& .MuiInputLabel-root": { 
                  color: "white !important", // Label color (including when shrunk)
                },
              }}
              onChange={(newValue) => setStartDate(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                />
              )}
            />
            <Typography>to</Typography>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              sx={{
                backgroundColor: "#2e2c2c",
                maxWidth: "200px",
                "& .MuiInputBase-root": {
                  backgroundColor: "#2e2c2c",
                },
                "& .MuiInputBase-input": {
                  color: "white !important", // Ensure date text is white
                  backgroundColor: "#2e2c2c",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "white",
                },
                "& .MuiInputLabel-root": { 
                  color: "white !important", // Label color (including when shrunk)
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                />
              )}
            />
          </Box>
        </LocalizationProvider>

        {/* Checkboxes */}
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={markDiffed} onChange={(e) => setMarkDiffed(e.target.checked)} />}
            label="Mark records as diff'd"
            sx={{ color: "white" }}
          />
          <FormControlLabel
            control={<Checkbox checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />}
            label="Send email"
            sx={{ color: "white" }}
          />
          <FormControlLabel
            control={<Checkbox checked={createJIRA} onChange={(e) => setCreateJIRA(e.target.checked)} />}
            label="Create JIRA"
            sx={{ color: "white" }}
          />
        </FormGroup>

        {/* Email Input (conditionally rendered based on sendEmail) */}
        {sendEmail && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <TextField
              label="Recipient Emails (comma-separated)"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "white" } }}
              sx={{ backgroundColor: "#2e2c2c", maxWidth: "400px" }}
              placeholder="example1@domain.com, example2@domain.com"
            />
          </Box>
        )}

        {/* Generate Button */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            sx={{ backgroundColor: "#3b82f6", maxWidth: "200px" }}
          >
            Generate Report
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default GenerateReport;