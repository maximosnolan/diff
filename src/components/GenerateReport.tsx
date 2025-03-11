import React, { useState, useEffect } from "react";
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
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Paper,
  CircularProgress,
  Grow,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Papa from 'papaparse';
import { fetchDiffGroups } from "../services/dataService";

interface GenerateReportProps {
  json1?: any | null;
  json2?: any | null;
  tolerance?: number;
}

function getDifferentFields(json1: any, json2: any, tolerance: number = 0.0001): string[] {
  const diffs: string[] = [];
  const keys1 = Object.keys(json1);
  const keys2 = Object.keys(json2);

  for (const key of keys1) {
    if (!(key in json2)) {
      diffs.push(key);
    } else if (typeof json1[key] !== "object" || json1[key] === null) {
      if (typeof json1[key] === "number" && typeof json2[key] === "number") {
        if (Math.abs(json1[key] - json2[key]) > tolerance) {
          diffs.push(key);
        }
      } else if (json1[key] !== json2[key]) {
        diffs.push(key);
      }
    } else if (typeof json2[key] === "object" && json2[key] !== null) {
      const nestedDiffs = getDifferentFields(json1[key], json2[key], tolerance);
      if (nestedDiffs.length > 0) {
        diffs.push(...nestedDiffs.map(d => `${key}.${d}`));
      }
    } else {
      diffs.push(key);
    }
  }

  for (const key of keys2) {
    if (!(key in json1)) {
      diffs.push(key);
    }
  }

  return diffs;
}

const DIFF_ID_TO_API: Record<string, string> = {
  "DIFF-1-TKTAPIAccessor-DEV-2023-01-01": "TradeAPI",
  "DIFF-5-TKTAPIAccessor-DEV-2023-05-01": "TradeAPI",
  "DIFF-7-TKTAPIAccessor-DEV-2023-07-01": "UserAPI",
  "DIFF-2-CUTSService-BETA-2023-02-01": "CutAPI",
  "DIFF-6-CUTSService-BETA-2023-06-01": "CutAPI",
  "DIFF-3-cmmtsvc-UAT-2023-03-01": "CommentAPI",
  "DIFF-4-tssvcapi-PROD-2023-04-01": "TSAPI",
};

const GenerateReport: React.FC<GenerateReportProps> = ({ json1, json2, tolerance = 0.0001 }) => {
  const theme = useTheme();
  const [environment, setEnvironment] = useState<string>("DEV");
  const [serviceName, setServiceName] = useState<string>("TKTAPIAccessor");
  const [startDate, setStartDate] = useState<string>("2023-01-01");
  const [endDate, setEndDate] = useState<string>("2025-03-02");
  const [emails, setEmails] = useState<string>("");
  const [markDiffed, setMarkDiffed] = useState<boolean>(false);
  const [sendEmail, setSendEmail] = useState<boolean>(false);
  const [createJIRA, setCreateJIRA] = useState<boolean>(false);
  const [expandedApi, setExpandedApi] = useState<string | null>(null);
  const [reportData, setReportData] = useState<Record<string, { field: string; frequency: number }[]>>({});
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  const [apiFrequency, setApiFrequency] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    setEndDate(formatDate(today));
    setStartDate(formatDate(lastWeek));
  }, []);

  useEffect(() => {
    const calculateFrequency = () => {
      const freq: Record<string, number> = {
        "TradeAPI": 2,
        "UserAPI": 1,
        "CutAPI": 2,
        "CommentAPI": 1,
        "TSAPI": 1,
      };
      setApiFrequency(freq);
    };
    calculateFrequency();
  }, []);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const diffs = await fetchDiffGroups(serviceName, environment, startDate, endDate);

      const apiDiffs: Record<string, { field: string; frequency: number }[]> = {};

      Object.values(diffs).forEach((group) => {
        group.forEach(({ diffId, json1, json2 }) => {
          const apiName = DIFF_ID_TO_API[diffId] || "UnknownAPI";
          const differences = getDifferentFields(json1, json2, tolerance);

          if (!apiDiffs[apiName]) {
            apiDiffs[apiName] = [];
          }

          differences.forEach((field) => {
            const existing = apiDiffs[apiName].find((f) => f.field === field);
            if (existing) {
              existing.frequency += 1;
            } else {
              apiDiffs[apiName].push({ field, frequency: 1 });
            }
          });
        });
      });
      setReportData(apiDiffs);
      setReportGenerated(true);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCSV = () => {
    const csvData: (string | number)[][] = [];
    
    csvData.push(["API", "Frequency"]);
    Object.entries(apiFrequency).forEach(([api, freq]) => {
      csvData.push([api, freq]);
    });
    csvData.push([]);

    csvData.push(["API", "Fields under diff", "API Frequency"]);
    Object.entries(reportData).forEach(([api, fields]) => {
      const fieldsUnderDiff = fields.map(f => f.field).join(", ");
      const apiFreq = fields.reduce((sum, f) => sum + f.frequency, 0);
      csvData.push([api, fieldsUnderDiff, apiFreq]);
      
      csvData.push([`${api} Details`, "Field Name", "Frequency"]);
      fields.forEach(field => {
        csvData.push(["", field.field, field.frequency]);
      });
      csvData.push([]);
    });

    const csv = Papa.unparse(csvData);
    navigator.clipboard.writeText(csv)
      .then(() => {
        alert("CSV data copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy CSV to clipboard:", err);
        alert("Failed to copy CSV. Check console for details.");
      });
  };

  const handleToggleApi = (api: string) => {
    setExpandedApi(expandedApi === api ? null : api);
  };

  const getServicesToDiff = () => {
    const services = ["TKTAPIAccessor", "CUTSService", "cmmtsvc", "tssvcapi"];
    return services.map((service) => (
      <MenuItem key={service} value={service}>
        {service}
      </MenuItem>
    ));
  };

  const reportDescription = [
    `Creates a diff report for ${serviceName} in ${environment} from ${startDate} to ${endDate}.`,
    "Tracks API diff frequency and field-level differences.",
    "Optionally logs a JIRA ticket with the report if 'Create JIRA' is selected.",
    "Emails the report to recipients if 'Send Email' is enabled.",
  ];

  return (
    <Box sx={{
      p: 6,
      background: "linear-gradient(135deg, #0a0f1a 0%, #1a202c 50%, #2e2c2c 100%)",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.3)",
      height: "100%",
      width: "100%",
      maxWidth: "1400px",
      minWidth: "1000px",
      margin: "0 auto",
      overflow: "auto",
      backdropFilter: "blur(10px)",
      backgroundColor: "rgba(10, 15, 26, 0.9)",
      transition: "all 0.5s ease",
      "&:hover": {
        boxShadow: "0 15px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.5)",
      },
    }}>
      <Grow in={true} timeout={800}>
        <Box>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              textAlign: "center",
              color: "white",
              background: "linear-gradient(45deg, #ffffff, #b0b0b0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            Generate Report
          </Typography>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              textAlign: "center",
              color: "text.secondary",
              opacity: 0.9,
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
              transition: "all 0.3s ease",
              animation: "fadeIn 0.8s ease-in",
              "@keyframes fadeIn": {
                "0%": { opacity: 0, transform: "translateY(-10px)" },
                "100%": { opacity: 0.9, transform: "translateY(0)" },
              },
            }}
          >
            Configure and generate a dynamic report based on JSON diff data.
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              mt: 4,
              padding: 5,
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(59, 130, 246, 0.2)",
              backdropFilter: "blur(5px)",
              transition: "all 0.5s ease",
              "&:hover": {
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.4)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 4 }}>
              <Tooltip title="Select environment for the report" arrow>
                <FormControl
                  variant="outlined"
                  sx={{
                    width: "300px",
                    "& .MuiOutlinedInput-root": {
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.4s ease",
                      "&:hover": {
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2), 0 0 10px rgba(255, 165, 0, 0.3)",
                        borderColor: "rgba(255, 165, 0, 0.5)",
                      },
                    },
                  }}
                >
                  <InputLabel sx={{ color: "text.primary", fontWeight: 600 }}>Environment</InputLabel>
                  <Select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as string)}
                    label="Environment"
                    sx={{ color: "secondary.main", backgroundColor: "transparent", fontWeight: 500 }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          background: "rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(5px)",
                          borderRadius: "12px",
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                        },
                      },
                    }}
                  >
                    <MenuItem value="DEV" sx={{ color: "text.primary", fontWeight: 500 }}>DEV</MenuItem>
                    <MenuItem value="BETA" sx={{ color: "text.primary", fontWeight: 500 }}>BETA</MenuItem>
                    <MenuItem value="UAT" sx={{ color: "text.primary", fontWeight: 500 }}>UAT</MenuItem>
                    <MenuItem value="PROD" sx={{ color: "text.primary", fontWeight: 500 }}>PROD</MenuItem>
                  </Select>
                </FormControl>
              </Tooltip>

              <Tooltip title="Select service for the report" arrow>
                <FormControl
                  variant="outlined"
                  sx={{
                    width: "300px",
                    "& .MuiOutlinedInput-root": {
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.4s ease",
                      "&:hover": {
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2), 0 0 10px rgba(255, 165, 0, 0.3)",
                        borderColor: "rgba(255, 165, 0, 0.5)",
                      },
                    },
                  }}
                >
                  <InputLabel sx={{ color: "text.primary", fontWeight: 600 }}>Service Name</InputLabel>
                  <Select
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value as string)}
                    label="Service Name"
                    sx={{ color: "secondary.main", backgroundColor: "transparent", fontWeight: 500 }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          background: "rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(5px)",
                          borderRadius: "12px",
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                        },
                      },
                    }}
                  >
                    {getServicesToDiff()}
                  </Select>
                </FormControl>
              </Tooltip>
            </Box>

            <Box sx={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
              <TextField
                label="Start Date (YYYY-MM-DD)"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                variant="outlined"
                placeholder="YYYY-MM-DD"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  width: "250px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                  "& .MuiOutlinedInput-root": {
                    transition: "all 0.4s ease",
                    "&:hover": {
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2), 0 0 10px rgba(255, 165, 0, 0.3)",
                      borderColor: "rgba(255, 165, 0, 0.5)",
                    },
                  },
                  "& .MuiInputBase-input": { color: "secondary.main", fontWeight: 500 },
                }}
                InputLabelProps={{ sx: { color: "text.primary", fontWeight: 600 } }}
              />
              <Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: "1.2rem" }}>to</Typography>
              <TextField
                label="End Date (YYYY-MM-DD)"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                variant="outlined"
                placeholder="YYYY-MM-DD"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  width: "250px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                  "& .MuiOutlinedInput-root": {
                    transition: "all 0.4s ease",
                    "&:hover": {
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2), 0 0 10px rgba(255, 165, 0, 0.3)",
                      borderColor: "rgba(255, 165, 0, 0.5)",
                    },
                  },
                  "& .MuiInputBase-input": { color: "secondary.main", fontWeight: 500 },
                }}
                InputLabelProps={{ sx: { color: "text.primary", fontWeight: 600 } }}
              />
            </Box>

            {/* Report Description as Static Text */}
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography
                variant="subtitle1"
                sx={{ color: "white", fontWeight: 600, mb: 1 }}
              >
                What This Report Does:
              </Typography>
              {reportDescription.map((desc, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    color: "white",
                    fontWeight: 500,
                    textAlign: "left",
                    display: "list-item",
                    ml: 4,
                    mr: 4,
                  }}
                >
                  {desc}
                </Typography>
              ))}
            </Box>

            <FormGroup sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 3 }}>
              <FormControlLabel
                control={<Checkbox checked={markDiffed} onChange={(e) => setMarkDiffed(e.target.checked)} sx={{ color: "text.primary", "&.Mui-checked": { color: "secondary.main", boxShadow: "0 0 10px rgba(255, 165, 0, 0.7)" } }} />}
                label={<Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: "1.1rem" }}>Mark records as diff'd</Typography>}
                sx={{
                  "&:hover": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "8px" },
                  transition: "all 0.3s ease",
                }}
              />
              <FormControlLabel
                control={<Checkbox checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} sx={{ color: "text.primary", "&.Mui-checked": { color: "secondary.main", boxShadow: "0 0 10px rgba(255, 165, 0, 0.7)" } }} />}
                label={<Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: "1.1rem" }}>Send email</Typography>}
                sx={{
                  "&:hover": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "8px" },
                  transition: "all 0.3s ease",
                }}
              />
              <FormControlLabel
                control={<Checkbox checked={createJIRA} onChange={(e) => setCreateJIRA(e.target.checked)} sx={{ color: "text.primary", "&.Mui-checked": { color: "secondary.main", boxShadow: "0 0 10px rgba(255, 165, 0, 0.7)" } }} />}
                label={<Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: "1.1rem" }}>Create JIRA</Typography>}
                sx={{
                  "&:hover": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "8px" },
                  transition: "all 0.3s ease",
                }}
              />
            </FormGroup>

            {sendEmail && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <TextField
                  label="Recipient Emails (comma-separated)"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    maxWidth: "600px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                    "& .MuiOutlinedInput-root": {
                      transition: "all 0.4s ease",
                      "&:hover": {
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2), 0 0 10px rgba(255, 165, 0, 0.3)",
                        borderColor: "rgba(255, 165, 0, 0.5)",
                      },
                    },
                  }}
                  InputProps={{ sx: { color: "text.primary", fontWeight: 500 } }}
                  InputLabelProps={{ sx: { color: "text.primary", fontWeight: 600 } }}
                  placeholder="example1@domain.com, example2@domain.com"
                />
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 4, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={handleGenerateReport}
                sx={{
                  background: "linear-gradient(45deg, #3b82f6, #4d7cff, #6b9cff)",
                  width: "250px",
                  padding: "16px 32px",
                  borderRadius: "16px",
                  boxShadow: "0 6px 20px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.4)",
                  color: "white",
                  fontWeight: 700,
                  textTransform: "none",
                  transition: "all 0.5s ease",
                  "&:hover": {
                    background: "linear-gradient(45deg, #4d7cff, #6b9cff, #8ab4ff)",
                    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6)",
                    transform: "translateY(-3px)",
                  },
                  "&:disabled": {
                    background: "grey",
                    boxShadow: "none",
                  },
                }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Generate Report"}
              </Button>
              {reportGenerated && (
                <Button
                  variant="outlined"
                  onClick={handleCopyCSV}
                  sx={{
                    width: "250px",
                    padding: "16px 32px",
                    borderRadius: "16px",
                    borderColor: "primary.main",
                    color: "primary.main",
                    fontWeight: 700,
                    textTransform: "none",
                    background: "rgba(255, 255, 255, 0.1)",
                    transition: "all 0.5s ease",
                    "&:hover": {
                      background: "rgba(59, 130, 246, 0.2)",
                      borderColor: "#4d7cff",
                      boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Copy as CSV
                </Button>
              )}
            </Box>

            {isLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <CircularProgress sx={{ color: "primary.main", boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }} />
              </Box>
            )}

            {reportGenerated && !isLoading && (
              <Box sx={{ mt: 3 }}>
                <Grow in={reportGenerated} timeout={600}>
                  <TableContainer
                    component={Paper}
                    sx={{
                      mb: 3,
                      bgcolor: "rgba(255, 255, 255, 0.08)",
                      width: "100%",
                      borderRadius: "16px",
                      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)",
                      backdropFilter: "blur(5px)",
                      transition: "all 0.5s ease",
                      "&:hover": {
                        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.4)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: theme.palette.secondary.main, fontWeight: 700, padding: 3, textShadow: "0 1px 3px rgba(255, 165, 0, 0.5)" }}>API</TableCell>
                          <TableCell sx={{ color: theme.palette.secondary.main, fontWeight: 700, padding: 3, textShadow: "0 1px 3px rgba(255, 165, 0, 0.5)" }}>Frequency</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(apiFrequency).map(([api, freq]) => (
                          <TableRow
                            key={api}
                            sx={{
                              transition: "all 0.4s ease",
                              "&:hover": {
                                background: "rgba(255, 255, 255, 0.15)",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            <TableCell sx={{ padding: 3, color: "text.primary", fontWeight: 500 }}>{api}</TableCell>
                            <TableCell sx={{ padding: 3, color: "text.primary", fontWeight: 500 }}>{freq}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grow>

                <Grow in={reportGenerated} timeout={800}>
                  <TableContainer
                    component={Paper}
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.08)",
                      width: "100%",
                      borderRadius: "16px",
                      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)",
                      backdropFilter: "blur(5px)",
                      transition: "all 0.5s ease",
                      "&:hover": {
                        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.4)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: theme.palette.secondary.main, fontWeight: 700, padding: 3, textShadow: "0 1px 3px rgba(255, 165, 0, 0.5)" }}>API</TableCell>
                          <TableCell sx={{ color: theme.palette.secondary.main, fontWeight: 700, padding: 3, textShadow: "0 1px 3px rgba(255, 165, 0, 0.5)" }}>Fields under diff</TableCell>
                          <TableCell sx={{ color: theme.palette.secondary.main, fontWeight: 700, padding: 3, textShadow: "0 1px 3px rgba(255, 165, 0, 0.5)" }}>API Frequency</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(reportData).map(([api, fields]) => {
                          const fieldsUnderDiff = fields.map(f => f.field).join(", ");
                          const apiFrequencyValue = fields.reduce((sum, f) => sum + f.frequency, 0);
                          return (
                            <React.Fragment key={api}>
                              <TableRow
                                sx={{
                                  transition: "all 0.4s ease",
                                  "&:hover": {
                                    background: "rgba(255, 255, 255, 0.15)",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                    transform: "translateY(-1px)",
                                  },
                                }}
                              >
                                <TableCell sx={{ padding: 3 }}>
                                  <IconButton
                                    onClick={() => handleToggleApi(api)}
                                    size="small"
                                    sx={{
                                      color: "text.primary",
                                      transition: "all 0.4s ease",
                                      "&:hover": {
                                        background: "rgba(255, 165, 0, 0.2)",
                                        boxShadow: "0 0 10px rgba(255, 165, 0, 0.5)",
                                      },
                                    }}
                                  >
                                    {expandedApi === api ? <ExpandLessIcon sx={{ color: "text.primary" }} /> : <ExpandMoreIcon sx={{ color: "text.primary" }} />}
                                  </IconButton>
                                  <Typography component="span" sx={{ color: "text.primary", fontWeight: 500, ml: 1 }}>{api}</Typography>
                                </TableCell>
                                <TableCell sx={{ padding: 3, color: "text.primary", fontWeight: 500 }}>{fieldsUnderDiff}</TableCell>
                                <TableCell sx={{ padding: 3, color: "text.primary", fontWeight: 500 }}>{apiFrequencyValue}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={3} sx={{ p: 0 }}>
                                  <Collapse in={expandedApi === api} timeout={400}>
                                    <Grow in={expandedApi === api} timeout={500}>
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell sx={{ color: theme.palette.secondary.main, fontWeight: 700, padding: 2, textShadow: "0 1px 3px rgba(255, 165, 0, 0.5)" }}>Field Name</TableCell>
                                            <TableCell sx={{ color: theme.palette.secondary.main, fontWeight: 700, padding: 2, textShadow: "0 1px 3px rgba(255, 165, 0, 0.5)" }}>Frequency</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {fields.map((field) => (
                                            <TableRow
                                              key={field.field}
                                              sx={{
                                                transition: "all 0.4s ease",
                                                "&:hover": {
                                                  background: "rgba(255, 255, 255, 0.15)",
                                                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                                  transform: "translateY(-1px)",
                                                },
                                              }}
                                            >
                                              <TableCell sx={{ padding: 2, color: "text.primary", fontWeight: 500 }}>{field.field}</TableCell>
                                              <TableCell sx={{ padding: 2, color: "text.primary", fontWeight: 500 }}>{field.frequency}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </Grow>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grow>
              </Box>
            )}
          </Box>
        </Box>
      </Grow>
    </Box>
  );
};

export default GenerateReport;