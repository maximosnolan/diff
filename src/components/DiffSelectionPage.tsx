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

// Assume this function exists in your dataService
declare function fetchHumioLink(environment: string, diffId: string, serviceName: string): Promise<string>;

const DiffSelectionPage: React.FC<DiffSelectionPageProps> = ({ onSelectDiffId }) => {
  const [service, setService] = useState("TKTAPIAccessor");
  const [environment, setEnvironment] = useState("DEV");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2023-12-31");
  const [diffGroups, setDiffGroups] = useState<Record<string, { diffId: string; json1: any; json2: any }[]>>({});
  const [filterFields, setFilterFields] = useState<string[]>([]);

  const services = fetchServicesToDiff();
  const environments = fetchEnvironmentsToDiff();

  useEffect(() => {
    const cachedDiffGroups = localStorage.getItem("diffGroups");
    console.log("useEffect triggered, cachedDiffGroups:", cachedDiffGroups);
    if (cachedDiffGroups) {
      const parsedGroups = JSON.parse(cachedDiffGroups);
      console.log("Parsed diffGroups:", parsedGroups);
      setDiffGroups(parsedGroups);
      const uniqueDiffFields = [...new Set(
        Object.values(parsedGroups)
          .flatMap((group: { diffId: string; json1: any; json2: any }[]) => 
            group.flatMap(diff => getDifferentFields(diff.json1, diff.json2))
          )
      )];
      console.log("Unique diff fields from cached data:", uniqueDiffFields);
      setFilterFields(uniqueDiffFields); // Default to all fields checked
      console.log("Initial filterFields set to:", uniqueDiffFields);
    }
  }, []);

  const handleCompareClick = () => {
    if (service && environment && startDate && endDate) {
      console.log("handleCompareClick triggered with service:", service, "environment:", environment, "startDate:", startDate, "endDate:", endDate);
      const mockDiffs = fetchDiffGroups(service, environment, startDate, endDate);
      console.log("Fetched diff groups:", mockDiffs);
      setDiffGroups(mockDiffs);
      const uniqueDiffFields = [
        ...new Set(
          Object.values(mockDiffs)
            .flatMap(group => group.flatMap(diff => getDifferentFields(diff.json1, diff.json2)))
        ),
      ];
      console.log("Unique diff fields after compare:", uniqueDiffFields);
      setFilterFields(uniqueDiffFields); // Default to all fields checked after compare
      console.log("Filter fields after compare set to:", uniqueDiffFields);
      localStorage.setItem("diffGroups", JSON.stringify(mockDiffs));
    }
  };

  const getDifferentFields = (json1: any, json2: any): string[] => {
    const diffs = [];
    for (const key in json1) {
      if (json1[key] !== json2[key] && typeof json1[key] !== "object") {
        diffs.push(key);
      } else if (typeof json1[key] === "object" && json1[key] !== null && json2[key] !== null) {
        const nestedDiffs = getDifferentFields(json1[key], json2[key]);
        diffs.push(...nestedDiffs.map(d => `${key}.${d}`));
      }
    }
    return diffs;
  };

  const handleDiffIdChange = (groupKey: string, event: any) => {
    const selectedDiffId = event.target.value;
    console.log("handleDiffIdChange triggered for groupKey:", groupKey, "with selectedDiffId:", selectedDiffId);
    const selectedDiff = diffGroups[groupKey].find((diff) => diff.diffId === selectedDiffId);
    if (selectedDiff) {
      onSelectDiffId(
        selectedDiff.diffId,
        selectedDiff.json1,
        selectedDiff.json2,
        false,
        (json1Str: string, json2Str: string) => {
          console.log("handleDiffIdChange callback received with:", json1Str, json2Str);
        },
        environment,
        service,
        "999"
      );
    }
  };

  const handleViewDiffClick = (groupKey: string, selectedDiffId: string) => {
    console.log("handleViewDiffClick triggered for groupKey:", groupKey, "with selectedDiffId:", selectedDiffId);
    const selectedDiff = diffGroups[groupKey].find((diff) => diff.diffId === selectedDiffId);
    if (selectedDiff) {
      const json1Str = JSON.stringify(selectedDiff.json1, null, 2);
      const json2Str = JSON.stringify(selectedDiff.json2, null, 2);
      console.log("handleViewDiffClick JSON strings:", { json1Str, json2Str });
      onSelectDiffId(
        selectedDiff.diffId,
        selectedDiff.json1,
        selectedDiff.json2,
        true,
        (json1Str, json2Str) => {
          console.log("handleViewDiffClick callback executed with:", json1Str, json2Str);
        },
        environment,
        service,
        "999"
      );
    }
  };

  const handleHumioLinkClick = async (selectedDiffId: string) => {
    console.log("handleHumioLinkClick triggered with selectedDiffId:", selectedDiffId, "environment:", environment, "service:", service);
    try {
      const humioUrl = await fetchHumioLink(environment, selectedDiffId, service);
      console.log("Humio URL fetched:", humioUrl);
      window.open(humioUrl, '_blank');
    } catch (error) {
      console.error("Error fetching Humio link:", error);
      alert("Failed to fetch Humio link. Please try again.");
    }
  };

  const handleFilterChange = (event: any) => {
    const { target: { value } } = event;
    const newFilterFields = typeof value === "string" ? value.split(",") : value;
    console.log("handleFilterChange triggered with new value:", newFilterFields, "previous filterFields:", filterFields);
    setFilterFields(newFilterFields);
  };

  const allDiffFields = [
    ...new Set(
      Object.values(diffGroups)
        .flatMap(group => group.flatMap(diff => getDifferentFields(diff.json1, diff.json2)))
    ),
  ];
  console.log("allDiffFields calculated:", allDiffFields);

  const filteredDiffGroups = filterFields.length > 0
    ? Object.fromEntries(
        Object.entries(diffGroups).filter(([groupKey]) =>
          filterFields.some(field => groupKey.includes(field))
        )
      )
    : {};
  console.log("filteredDiffGroups calculated:", filteredDiffGroups, "with filterFields:", filterFields);

  const renderStackedFields = (groupKey: string) => {
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
                sx={{ backgroundColor: "#3b82f6", maxWidth: "200px", padding: "10px 20px", fontSize: "16px" }}
              >
                Compare
              </Button>
              {Object.keys(diffGroups).length === 0 && (
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
                  {Object.entries(filteredDiffGroups).map(([groupKey, diffs]) => {
                    const selectedDiffId = diffs[0]?.diffId || "";
                    console.log("Rendering row for groupKey:", groupKey, "with filteredDiffGroups:", filteredDiffGroups);
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
                              onClick={() => handleViewDiffClick(groupKey, selectedDiffId)}
                              sx={{ backgroundColor: "#3b82f6", padding: "8px 16px" }}
                            >
                              View Diff
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => handleHumioLinkClick(selectedDiffId)}
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
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiffSelectionPage;