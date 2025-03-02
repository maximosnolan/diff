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
} from "@mui/material";
import { fetchDiffData, fetchDiffGroups, fetchEnvironmentsToDiff, fetchServicesToDiff } from "../services/dataService";

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
  const [service, setService] = useState("TKTAPIAccessor");
  const [environment, setEnvironment] = useState("DEV");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2023-12-31");
  const [diffGroups, setDiffGroups] = useState<Record<string, { diffId: string; json1: any; json2: any }[]>>({});
  const [filterFields, setFilterFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDiffIds, setSelectedDiffIds] = useState<Record<string, string>>({}); // New state for tracking selections

  const services = fetchServicesToDiff();
  const environments = fetchEnvironmentsToDiff();

  useEffect(() => {
    const cachedDiffGroups = localStorage.getItem("diffGroups");
    if (cachedDiffGroups) {
      const parsedGroups = JSON.parse(cachedDiffGroups);
      setDiffGroups(parsedGroups);
      const uniqueDiffFields = [...new Set(
        Object.values(parsedGroups)
          .flatMap((group) => 
            group.flatMap(diff => getDifferentFields(diff.json1, diff.json2))
          )
      )];
      setFilterFields(uniqueDiffFields);
      // Initialize selectedDiffIds with first diffId from each group
      const initialSelections = Object.fromEntries(
        Object.entries(parsedGroups).map(([groupKey, diffs]) => [groupKey, diffs[0]?.diffId || ""])
      );
      setSelectedDiffIds(initialSelections);
    }
  }, []);

  const handleCompareClick = async () => {
    if (service && environment && startDate && endDate) {
      setLoading(true);
      try {
        const groups = await fetchDiffGroups(service, environment, startDate, endDate);
        setDiffGroups(groups);
        const uniqueDiffFields = [
          ...new Set(
            Object.values(groups)
              .flatMap(group => group.flatMap(diff => getDifferentFields(diff.json1, diff.json2)))
          ),
        ];
        setFilterFields(uniqueDiffFields);
        // Initialize selections for new groups
        const initialSelections = Object.fromEntries(
          Object.entries(groups).map(([groupKey, diffs]) => [groupKey, diffs[0]?.diffId || ""])
        );
        setSelectedDiffIds(initialSelections);
        localStorage.setItem("diffGroups", JSON.stringify(groups));
      } catch (error) {
        console.error("Error fetching diff groups:", error);
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
  };

  const handleDiffIdChange = (groupKey: string, event: any) => {
    const selectedDiffId = event.target.value;
    setSelectedDiffIds(prev => ({
      ...prev,
      [groupKey]: selectedDiffId
    }));
    // Removed automatic onSelectDiffId call - now only triggers on View Diff click
  };

  const handleViewDiffClick = (groupKey: string) => {
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
    }
  };

  const handleHumioLinkClick = async (groupKey: string) => {
    const selectedDiffId = selectedDiffIds[groupKey];
    try {
      const humioUrl = await fetchHumioLink(environment, selectedDiffId, service);
      window.open(humioUrl, '_blank');
    } catch (error) {
      console.error("Error fetching Humio link:", error);
      alert("Failed to fetch Humio link. Please try again.");
    }
  };

  const handleFilterChange = (event: any) => {
    const newFilterFields = typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value;
    setFilterFields(newFilterFields);
  };

  const allDiffFields = [
    ...new Set(
      Object.values(diffGroups || {})
        .flatMap(group => group.flatMap(diff => getDifferentFields(diff.json1, diff.json2)))
    ),
  ];

  // Updated filtering logic - show groups where ANY selected filter field is present
  const filteredDiffGroups = filterFields.length > 0 && diffGroups
    ? Object.fromEntries(
        Object.entries(diffGroups).filter(([groupKey]) =>
          filterFields.some(field => 
            getDifferentFields(
              diffGroups[groupKey][0].json1,
              diffGroups[groupKey][0].json2
            ).includes(field)
          )
        )
      )
    : diffGroups || {};

  const renderStackedFields = (groupKey: string | undefined) => {
    if (!groupKey) return null;
    return groupKey.split(",").map((field, index) => (
      <Typography key={index} sx={{ color: "white", display: "block", padding: "2px 0" }}>{field}</Typography>
    ));
  };

  return (
    <div style={{ width: "100%", maxWidth: "1280px", padding: "16px" }}>
      <Card sx={{ backgroundColor: "#1a202c", color: "white", marginBottom: "16px", borderRadius: "12px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px" }}>
            <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
              Diff Selection
            </Typography>
            <Typography variant="body1" sx={{ color: "#d3d3d3", textAlign: "center" }}>
              Select service, environment, and date range to compare differences.
            </Typography>
            <Box sx={{ display: "flex", gap: "24px", justifyContent: "center" }}>
              <FormControl sx={{ minWidth: "200px" }} variant="outlined">
                <InputLabel style={{ color: "white" }}>Service</InputLabel>
                <Select
                  value={service}
                  onChange={(e) => setService(e.target.value as string)}
                  label="Service"
                  sx={{ color: "orange", backgroundColor: "#4f4c43", "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" } }}
                  MenuProps={{ PaperProps: { style: { backgroundColor: "#2e2c2c", color: "white" } } }}
                >
                  {services.map((s) => (
                    <MenuItem key={s} value={s} style={{ color: "white" }}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: "200px" }} variant="outlined">
                <InputLabel style={{ color: "white" }}>Environment</InputLabel>
                <Select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as string)}
                  label="Environment"
                  sx={{ color: "orange", backgroundColor: "#4f4c43", "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" } }}
                  MenuProps={{ PaperProps: { style: { backgroundColor: "#2e2c2c", color: "white" } } }}
                >
                  {environments.map((env) => (
                    <MenuItem key={env} value={env} style={{ color: "white" }}>{env}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", gap: "24px", justifyContent: "center", alignItems: "center" }}>
              <TextField
                label="Start Date (YYYY-MM-DD)"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                variant="outlined"
                sx={{ 
                  backgroundColor: "#4f4c43", 
                  maxWidth: "200px",
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                }}
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "white" } }}
              />
              <Typography style={{ color: "white" }}>to</Typography>
              <TextField
                label="End Date (YYYY-MM-DD)"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                variant="outlined"
                sx={{ 
                  backgroundColor: "#4f4c43", 
                  maxWidth: "200px",
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                }}
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "white" } }}
              />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <Button
                variant="contained"
                onClick={handleCompareClick}
                disabled={loading}
                sx={{ backgroundColor: "#3b82f6", maxWidth: "200px", padding: "10px 20px", fontSize: "16px" }}
              >
                {loading ? "Loading..." : "Compare"}
              </Button>
              {Object.keys(diffGroups).length === 0 && !loading && (
                <Typography
                  variant="body1"
                  sx={{
                    color: "#ff4444",
                    fontWeight: "bold",
                    backgroundColor: "rgba(255, 68, 68, 0.1)",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "1px solid #ff4444",
                    marginTop: "8px",
                  }}
                >
                  No results found
                </Typography>
              )}
            </Box>
            <FormControl sx={{ minWidth: "200px", mb: 2 }} variant="outlined">
              <InputLabel style={{ color: "white" }}>Filter by Fields</InputLabel>
              <Select
                multiple
                value={filterFields}
                onChange={handleFilterChange}
                renderValue={(selected) => (selected as string[]).join(", ")}
                label="Filter by Fields"
                sx={{ color: "orange", backgroundColor: "#4f4c43", "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" } }}
                MenuProps={{ PaperProps: { style: { backgroundColor: "#2e2c2c", color: "white" } } }}
                disabled={loading || Object.keys(diffGroups).length === 0}
              >
                {allDiffFields.map((field) => (
                  <MenuItem key={field} value={field}>
                    <Checkbox checked={filterFields.includes(field)} />
                    <ListItemText primary={field} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TableContainer>
              <Table sx={{ backgroundColor: "#1a202c", color: "white", borderRadius: "8px", overflow: "hidden" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#2e2c2c", padding: "12px" }}>Difference Fields</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#2e2c2c", padding: "12px" }}>Diff IDs</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold", backgroundColor: "#2e2c2c", padding: "12px" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(filteredDiffGroups || {}).map(([groupKey, diffs]) => {
                    const selectedDiffId = selectedDiffIds[groupKey] || diffs[0]?.diffId || "";
                    return (
                      <TableRow key={groupKey} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#2e2c2c" } }}>
                        <TableCell sx={{ color: "white", padding: "12px" }}>
                          {renderStackedFields(groupKey)}
                        </TableCell>
                        <TableCell sx={{ color: "white", padding: "12px" }}>
                          <FormControl sx={{ minWidth: "200px" }} variant="outlined">
                            <InputLabel style={{ color: "white" }}>Select Diff ID</InputLabel>
                            <Select
                              value={selectedDiffId}
                              onChange={(e) => handleDiffIdChange(groupKey, e)}
                              label="Select Diff ID"
                              sx={{ color: "orange", backgroundColor: "#4f4c43", "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" } }}
                              MenuProps={{ PaperProps: { style: { backgroundColor: "#2e2c2c", color: "white" } } }}
                              disabled={loading}
                            >
                              {diffs.map((diff) => (
                                <MenuItem key={diff.diffId} value={diff.diffId} style={{ color: "white" }}>
                                  {diff.diffId}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell sx={{ color: "white", padding: "12px" }}>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <Button
                              variant="contained"
                              onClick={() => handleViewDiffClick(groupKey)}
                              disabled={loading}
                              sx={{ backgroundColor: "#3b82f6", padding: "8px 16px" }}
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
                                "&:hover": { backgroundColor: "#3b82f6" },
                                padding: "8px 16px"
                              }}
                            >
                              Humio Link
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {loading && (
              <Typography
                variant="body1"
                sx={{
                  color: "#ffffff",
                  fontWeight: "bold",
                  textAlign: "center",
                  marginTop: "16px",
                }}
              >
                Loading diffs...
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiffSelectionPage;