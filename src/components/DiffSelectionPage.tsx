import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Typography,
  Checkbox,
  ListItemText,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { fetchDiffData, fetchDiffGroups, fetchEnvironmentsToDiff, fetchServicesToDiff } from "../services/dataService";
import { useNavigate } from "react-router-dom";

interface DiffSelectionPageProps {
  onSelectDiffId: (
    diffId: string,
    json1: any,
    json2: any,
    triggerCompare: boolean,
    setJsonInput: (json1Str: string, json2Str: string) => void,
    environment: string,
    service: string,
    pxnum: string
  ) => void;
}

declare function fetchHumioLink(environment: string, diffId: string, serviceName: string): Promise<string>;

const DiffSelectionPage: React.FC<DiffSelectionPageProps> = ({ onSelectDiffId }) => {
  const navigate = useNavigate();
  const [service, setService] = useState("TKTAPIAccessor");
  const [environment, setEnvironment] = useState("DEV");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2023-12-31");
  const [relativeTime, setRelativeTime] = useState("");
  const [useRelativeTime, setUseRelativeTime] = useState(false);
  const [diffGroups, setDiffGroups] = useState<Record<string, { diffId: string; json1: any; json2: any }[]>>({});
  const [filterFields, setFilterFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDiffIds, setSelectedDiffIds] = useState<Record<string, string>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedJson1, setSelectedJson1] = useState<any | null>(null);
  const [selectedJson2, setSelectedJson2] = useState<any | null>(null);
  const [selectedDiffId, setSelectedDiffId] = useState<string | null>(null);

  const services = fetchServicesToDiff();
  const environments = fetchEnvironmentsToDiff();

  useEffect(() => {
    const cachedDiffGroups = localStorage.getItem("diffGroups");
    if (cachedDiffGroups) {
      const parsedGroups = JSON.parse(cachedDiffGroups);
      setDiffGroups(parsedGroups);
      const uniqueDiffFields = [
        ...new Set(
          Object.values(parsedGroups).flatMap((group) =>
            group.flatMap((diff) => getDifferentFields(diff.json1, diff.json2))
          )
        ),
      ];
      setFilterFields(uniqueDiffFields);
      const initialSelections = Object.fromEntries(
        Object.entries(parsedGroups).map(([groupKey, diffs]) => [groupKey, diffs[0]?.diffId || ""])
      );
      setSelectedDiffIds(initialSelections);
    }
  }, []);

  const handleCompareClick = async () => {
    if (service && environment) {
      setLoading(true);
      try {
        let start, end;
        if (useRelativeTime && relativeTime) {
          const match = relativeTime.match(/^(-?\d+)([hmd])$/);
          if (!match) {
            throw new Error("Invalid relative time format. Use e.g., -1h, -30m, -2d");
          }
          const [_, value, unit] = match;
          const numValue = parseInt(value);
          end = new Date();
          start = new Date();

          if (unit === "h") start.setHours(end.getHours() + numValue);
          else if (unit === "m") start.setMinutes(end.getMinutes() + numValue);
          else if (unit === "d") start.setDate(end.getDate() + numValue);

          start = start.toISOString().split("T")[0];
          end = end.toISOString().split("T")[0];
        } else if (startDate && endDate) {
          start = startDate;
          end = endDate;
        } else {
          throw new Error("Please provide either date range or relative time");
        }

        const groups = await fetchDiffGroups(service, environment, start, end);
        setDiffGroups(groups);
        const uniqueDiffFields = [
          ...new Set(
            Object.values(groups).flatMap((group) =>
              group.flatMap((diff) => getDifferentFields(diff.json1, diff.json2))
            )
          ),
        ];
        setFilterFields(uniqueDiffFields);
        const initialSelections = Object.fromEntries(
          Object.entries(groups).map(([groupKey, diffs]) => [groupKey, diffs[0]?.diffId || ""])
        );
        setSelectedDiffIds(initialSelections);
        localStorage.setItem("diffGroups", JSON.stringify(groups));
      } catch (error) {
        console.error("Error fetching diff groups:", error);
        alert(error.message || "Error fetching diff groups");
      } finally {
        setLoading(false);
      }
    }
  };

  const getDifferentFields = (json1: any, json2: any): string[] => {
    const diffs = [];
    const keys1 = Object.keys(json1);
    const keys2 = Object.keys(json2);

    for (const key of keys1) {
      if (!(key in json2)) {
        diffs.push(key);
      } else if (typeof json1[key] !== "object" || json1[key] === null) {
        if (typeof json1[key] === "number" && typeof json2[key] === "number") {
          if (Math.abs(json1[key] - json2[key]) > 0.0001) {
            diffs.push(key);
          }
        } else if (json1[key] !== json2[key]) {
          diffs.push(key);
        }
      } else if (typeof json2[key] === "object" && json2[key] !== null) {
        const nestedDiffs = getDifferentFields(json1[key], json2[key]);
        if (nestedDiffs.length > 0) {
          diffs.push(...nestedDiffs.map((d) => `${key}.${d}`));
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
  };

  const handleDiffIdChange = (groupKey: string, event: any) => {
    const selectedDiffId = event.target.value;
    setSelectedDiffIds((prev) => ({
      ...prev,
      [groupKey]: selectedDiffId,
    }));
  };

  const handleViewDiffClick = (groupKey: string) => {
    const selectedDiffId = selectedDiffIds[groupKey];
    const selectedDiff = diffGroups[groupKey].find((diff) => diff.diffId === selectedDiffId);
    if (selectedDiff) {
      setSelectedJson1(selectedDiff.json1);
      setSelectedJson2(selectedDiff.json2);
      setSelectedDiffId(selectedDiff.diffId);
      setOpenDialog(true);
    }
  };

  const handleViewInDiffExplorer = (groupKey: string) => {
    const selectedDiffId = selectedDiffIds[groupKey];
    const selectedDiff = diffGroups[groupKey].find((diff) => diff.diffId === selectedDiffId);
    if (selectedDiff) {
      const json1Str = JSON.stringify(selectedDiff.json1, null, 2);
      const json2Str = JSON.stringify(selectedDiff.json2, null, 2);
      onSelectDiffId(
        selectedDiff.diffId,
        selectedDiff.json1,
        selectedDiff.json2,
        true,
        (json1Str, json2Str) => {},
        environment,
        service,
        "999"
      );
      navigate("/"); // Assuming "/" is the home page route
    }
  };

  const handleHumioLinkClick = async (groupKey: string) => {
    const selectedDiffId = selectedDiffIds[groupKey];
    try {
      const humioUrl = await fetchHumioLink(environment, selectedDiffId, service);
      window.open(humioUrl, "_blank");
    } catch (error) {
      console.error("Error fetching Humio link:", error);
      alert("Failed to fetch Humio link. Please try again.");
    }
  };

  const handleFilterChange = (event: any) => {
    const newFilterFields =
      typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value;
    setFilterFields(newFilterFields);
  };

  const allDiffFields = [
    ...new Set(
      Object.values(diffGroups || {}).flatMap((group) =>
        group.flatMap((diff) => getDifferentFields(diff.json1, diff.json2))
      )
    ),
  ];

  const filteredDiffGroups =
    filterFields.length > 0 && diffGroups
      ? Object.fromEntries(
          Object.entries(diffGroups).filter(([groupKey]) =>
            filterFields.some((field) =>
              getDifferentFields(diffGroups[groupKey][0].json1, diffGroups[groupKey][0].json2).includes(
                field
              )
            )
          )
        )
      : diffGroups || {};

  const renderStackedFields = (groupKey: string | undefined) => {
    if (!groupKey) return null;
    return groupKey.split(",").map((field, index) => (
      <Typography key={index} sx={{ color: "white", display: "block", padding: "2px 0" }}>
        {field}
      </Typography>
    ));
  };

  const buildDiffTable = (json1: any, json2: any, prefix: string = "") => {
    let result: any[] = [];
    const allKeys = new Set([...Object.keys(json1 || {}), ...Object.keys(json2 || {})]);

    allKeys.forEach((k) => {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      const value1 = k in json1 ? json1[k] : undefined;
      const value2 = k in json2 ? json2[k] : undefined;

      if (typeof value1 === "object" && typeof value2 === "object" && value1 && value2) {
        result.push(...buildDiffTable(value1, value2, fullKey));
      } else {
        let color = "white";
        let diffType: "mismatches" | "missingLinux" | "missingSun" | null = null;
        if (!(k in json2)) {
          color = "red"; // Default missingLinuxColor
          diffType = "missingLinux";
        } else if (!(k in json1)) {
          color = "orange"; // Default missingSunColor
          diffType = "missingSun";
        } else if (value1 !== value2) {
          if (typeof value1 === "number" && typeof value2 === "number") {
            if (Math.abs(value1 - value2) <= 0.0001) return;
          }
          color = "yellow"; // Default mismatchColor
          diffType = "mismatches";
        } else {
          return; // Skip identical values
        }

        result.push({
          key: fullKey,
          sun: value1 !== undefined ? JSON.stringify(value1) : "missing",
          linux: value2 !== undefined ? JSON.stringify(value2) : "missing",
          color,
          diffType,
        });
      }
    });
    return result.length > 0 ? result : []; // Return empty array if no differences
  };

  const diffTable = selectedJson1 && selectedJson2 ? buildDiffTable(selectedJson1, selectedJson2) : [];

  const copyAsCSV = () => {
    const csvContent = ["Field Name,SUN,LINUX", ...diffTable.map((row) => `${row.key},${row.sun},${row.linux}`)].join(
      "\n"
    );
    navigator.clipboard.writeText(csvContent);
    alert("Table data copied to clipboard as CSV!");
  };

  const timeRangeDescription = useRelativeTime
    ? `the last ${relativeTime} (e.g., -1h = 1 hour ago, -2d = 2 days ago)`
    : `${startDate} to ${endDate}`;

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
      <Typography
        variant="h4"
        sx={{
          color: "white",
          textAlign: "center",
          mb: 3,
          fontWeight: 700,
          textShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
        }}
      >
        Live Diff Selection
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "#d3d3d3",
          textAlign: "center",
          mb: 4,
          fontStyle: "italic",
        }}
      >
        Select service, environment, and date range or relative time to find all diffs, grouped by fields
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 3,
          mb: 4,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FormControl
          sx={{
            minWidth: "200px",
            bgcolor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
          }}
          variant="outlined"
        >
          <InputLabel sx={{ color: "white" }}>Service</InputLabel>
          <Select
            value={service}
            onChange={(e) => setService(e.target.value as string)}
            label="Service"
            sx={{
              color: "#ff9800",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
            }}
            MenuProps={{ PaperProps: { sx: { bgcolor: "#2e2c2c", color: "white" } } }}
          >
            {services.map((s) => (
              <MenuItem key={s} value={s} sx={{ color: "white" }}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          sx={{
            minWidth: "200px",
            bgcolor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
          }}
          variant="outlined"
        >
          <InputLabel sx={{ color: "white" }}>Environment</InputLabel>
          <Select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as string)}
            label="Environment"
            sx={{
              color: "#ff9800",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
            }}
            MenuProps={{ PaperProps: { sx: { bgcolor: "#2e2c2c", color: "white" } } }}
          >
            {environments.map((env) => (
              <MenuItem key={env} value={env} sx={{ color: "white" }}>
                {env}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          mb: 4,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        {!useRelativeTime ? (
          <>
            <TextField
              label="Start Date (YYYY-MM-DD)"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              variant="outlined"
              sx={{
                maxWidth: "200px",
                bgcolor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px",
                "& .MuiInputBase-input": { color: "#ff9800" },
                "& .MuiInputLabel-root": { color: "white" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
              }}
              InputProps={{ style: { color: "#ff9800" } }}
              InputLabelProps={{ sx: { color: "white" } }}
            />
            <Typography sx={{ color: "white", fontWeight: 600 }}>to</Typography>
            <TextField
              label="End Date (YYYY-MM-DD)"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              variant="outlined"
              sx={{
                maxWidth: "200px",
                bgcolor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px",
                "& .MuiInputBase-input": { color: "#ff9800" },
                "& .MuiInputLabel-root": { color: "white" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
              }}
              InputProps={{ style: { color: "#ff9800" } }}
              InputLabelProps={{ sx: { color: "white" } }}
            />
          </>
        ) : (
          <TextField
            label="Relative Time (e.g., -1h, -30m, -2d)"
            value={relativeTime}
            onChange={(e) => setRelativeTime(e.target.value)}
            variant="outlined"
            sx={{
              maxWidth: "200px",
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              "& .MuiInputBase-input": { color: "#ff9800" },
              "& .MuiInputLabel-root": { color: "white" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
            }}
            InputProps={{ style: { color: "#ff9800" } }}
            InputLabelProps={{ sx: { color: "white" } }}
          />
        )}
        <Button
          variant="outlined"
          onClick={() => setUseRelativeTime(!useRelativeTime)}
          sx={{
            color: "white",
            borderColor: "#3b82f6",
            "&:hover": { backgroundColor: "#3b82f6" },
          }}
        >
          {useRelativeTime ? "Use Date Range" : "Use Relative Time"}
        </Button>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Button
          variant="contained"
          onClick={handleCompareClick}
          disabled={loading}
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
            "&:disabled": {
              background: "#4f4c43",
              boxShadow: "none",
            },
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Compare"}
        </Button>
      </Box>

      {/* Description of what this page does */}
      <Box sx={{ mb: 4, px: 2 }}>
        <Typography variant="body1" sx={{ color: "white", fontWeight: 600, mb: 1 }}>
          What this page does:
        </Typography>
        <ul style={{ color: "#d3d3d3", paddingLeft: "20px", margin: 0 }}>
          <li>
            Generates a diff report for <strong>{service}</strong> in the <strong>{environment}</strong>{" "}
            environment, covering <strong>{timeRangeDescription}</strong>.
          </li>
          <li>Groups all matching diffs by the fields they differ on.</li>
          <li>Click on "View Diff" to see the different fields.</li>
          <li>Click on "Humio Link" to see Humio logs for this diff.</li>
          <li>Click on "View in Diff Explorer" to get more detailed data about the diff.</li>
        </ul>
      </Box>

      {Object.keys(diffGroups).length === 0 && !loading && (
        <Typography
          variant="body1"
          sx={{
            color: "#ff4444",
            fontWeight: "bold",
            backgroundColor: "rgba(255, 68, 68, 0.1)",
            p: 2,
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            mb: 3,
          }}
        >
          No results found
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <FormControl
          sx={{
            minWidth: "200px",
            bgcolor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
          }}
          variant="outlined"
          disabled={loading || Object.keys(diffGroups).length === 0}
        >
          <InputLabel sx={{ color: "white" }}>Filter by Fields</InputLabel>
          <Select
            multiple
            value={filterFields}
            onChange={handleFilterChange}
            renderValue={(selected) => (selected as string[]).join(", ")}
            label="Filter by Fields"
            sx={{
              color: "#ff9800",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
            }}
            MenuProps={{ PaperProps: { sx: { bgcolor: "#2e2c2c", color: "white" } } }}
          >
            {allDiffFields.map((field) => (
              <MenuItem key={field} value={field}>
                <Checkbox checked={filterFields.includes(field)} sx={{ color: "white" }} />
                <ListItemText primary={field} sx={{ color: "white" }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper
        elevation={8}
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "all 0.3s ease",
          "&:hover": { boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)" },
          mb: 3,
        }}
      >
        <TableContainer sx={{ borderRadius: "16px", overflow: "hidden" }}>
          <Table sx={{ backgroundColor: "#1a202c", color: "white" }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    backgroundColor: "rgba(46, 44, 44, 0.8)",
                    padding: "16px",
                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  Different Fields
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    backgroundColor: "rgba(46, 44, 44, 0.8)",
                    padding: "16px",
                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  Diff ID
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    backgroundColor: "rgba(46, 44, 44, 0.8)",
                    padding: "16px",
                    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(filteredDiffGroups || {}).map(([groupKey, diffs]) => {
                const selectedDiffId = selectedDiffIds[groupKey] || diffs[0]?.diffId || "";
                return (
                  <TableRow
                    key={groupKey}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "rgba(46, 44, 44, 0.6)" },
                      "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <TableCell sx={{ color: "white", padding: "16px" }}>{renderStackedFields(groupKey)}</TableCell>
                    <TableCell sx={{ color: "white", padding: "16px" }}>
                      <FormControl
                        sx={{
                          minWidth: "200px",
                          bgcolor: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "8px",
                        }}
                        variant="outlined"
                      >
                        <InputLabel sx={{ color: "white" }}>Diff ID</InputLabel>
                        <Select
                          value={selectedDiffId}
                          onChange={(e) => handleDiffIdChange(groupKey, e)}
                          label="Diff ID"
                          sx={{
                            color: "#ff9800",
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
                          }}
                          MenuProps={{ PaperProps: { sx: { bgcolor: "#2e2c2c", color: "white" } } }}
                          disabled={loading}
                        >
                          {diffs.map((diff) => (
                            <MenuItem key={diff.diffId} value={diff.diffId} sx={{ color: "white" }}>
                              {diff.diffId}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ color: "white", padding: "16px" }}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={() => handleViewDiffClick(groupKey)}
                          disabled={loading}
                          sx={{
                            background: "linear-gradient(45deg, #1e3a8a, #3b82f6)",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            "&:hover": {
                              background: "linear-gradient(45deg, #1e40af, #60a5fa)",
                              transform: "translateY(-2px)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          View Diff
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleHumioLinkClick(groupKey)}
                          disabled={loading}
                          sx={{
                            color: "white",
                            borderColor: "#3b82f6",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            "&:hover": {
                              backgroundColor: "#3b82f6",
                              borderColor: "#3b82f6",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          Humio Link
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleViewInDiffExplorer(groupKey)}
                          disabled={loading}
                          sx={{
                            color: "white",
                            borderColor: "#ff9800",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            "&:hover": {
                              backgroundColor: "#ff9800",
                              borderColor: "#ff9800",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          View in Diff Explorer
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress sx={{ color: "white" }} />
        </Box>
      )}

      {/* Dialog for Table View */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "#1a202c",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "rgba(26, 32, 44, 0.8)",
            color: "white",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          Diff Table View - {selectedDiffId}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={copyAsCSV}
              variant="contained"
              sx={{
                bgcolor: "#4f4c43",
                color: "white",
                borderRadius: "8px",
                "&:hover": { bgcolor: "#3d3a34", transform: "translateY(-2px)" },
                transition: "all 0.3s ease",
              }}
            >
              Copy as CSV
            </Button>
            <IconButton onClick={() => setOpenDialog(false)} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "#1a202c", p: 3 }}>
          {diffTable.length > 0 ? (
            <TableContainer component={Paper} sx={{ bgcolor: "#1a202c", borderRadius: "8px" }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold", borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}
                    >
                      Field Name
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold", borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}
                    >
                      SUN
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold", borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}
                    >
                      LINUX
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {diffTable.map((row) => (
                    <TableRow
                      key={row.key}
                      sx={{
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <TableCell sx={{ color: row.color, py: 1 }}>{row.key}</TableCell>
                      <TableCell sx={{ color: row.color, py: 1 }}>{row.sun}</TableCell>
                      <TableCell sx={{ color: row.color, py: 1 }}>{row.linux}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ color: "white", textAlign: "center", p: 2 }}>No differences found</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DiffSelectionPage;