import React, { useState, useEffect, useMemo } from "react";
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
  Collapse,
  IconButton,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface JsonDiffViewerProps {
  json1: any | null;
  json2: any | null;
  tolerance?: number;
  shouldExpand?: boolean;
  setShouldExpand?: (value: boolean) => void;
  diffId?: string; // New prop for specific diff ID
}

const JsonDiffViewer: React.FC<JsonDiffViewerProps> = ({ json1, json2, tolerance = 0.0001, shouldExpand = false, setShouldExpand, diffId }) => {
  const [diffTree, setDiffTree] = useState<any[] | null>(null);
  const [diffTable, setDiffTable] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTree, setFilteredTree] = useState<any[] | null>(null);
  const [filteredTable, setFilteredTable] = useState<any[]>([]);
  const [treeOpen, setTreeOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  
  const [mismatchColor, setMismatchColor] = useState("yellow");
  const [missingSunColor, setMissingSunColor] = useState("orange");
  const [missingLinuxColor, setMissingLinuxColor] = useState("red");

  const [searchFields, setSearchFields] = useState({
    fieldName: true, // Default checked
    sun: false,
    linux: false,
  });

  const [diffTypes, setDiffTypes] = useState({
    mismatches: true, // Default checked
    missingLinux: true,
    missingSun: true,
  });

  const [expandedItems, setExpandedItems] = useState<string[]>([]); // Track expanded items

  const colorOptions = ["red", "orange", "yellow", "green", "blue", "purple", "gray", "white"];

  // Memoize json1 and json2 to stabilize their references in useEffect
  const memoJson1 = useMemo(() => JSON.parse(JSON.stringify(json1)), [json1, diffId]); // Recompute when diffId changes
  const memoJson2 = useMemo(() => JSON.parse(JSON.stringify(json2)), [json2, diffId]); // Recompute when diffId changes

  useEffect(() => {
    console.log("shouldExpand changed to:", shouldExpand);
    if (shouldExpand && setShouldExpand) {
      setTreeOpen(true);
      setTableOpen(true);
      setShouldExpand(false);
      if (filteredTree) {
        const allIds = extractAllIds(filteredTree);
        setExpandedItems(allIds);
      }
    }
  }, [shouldExpand, setShouldExpand, filteredTree]);

  useEffect(() => {
    if (memoJson1 && memoJson2) {
      const buildDiffTree = (obj1: any, obj2: any, parentId: string = "root", path: string[] = []) => {
        let result: any[] = [];
        const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
        let idCounter = 0;

        allKeys.forEach((k) => {
          const uniqueId = `${parentId}-${k}-${idCounter++}`;
          const currentPath = [...path, k];
          if (!(k in obj2)) {
            result.push({ 
              id: uniqueId, 
              label: `${k}: ${JSON.stringify(obj1[k])} (Missing LINUX)`, 
              color: missingLinuxColor,
              path: currentPath,
              diffType: "missingLinux", // Mark as missing LINUX
            });
          } else if (!(k in obj1)) {
            result.push({ 
              id: uniqueId, 
              label: `${k}: ${JSON.stringify(obj2[k])} (Missing SUN)`, 
              color: missingSunColor,
              path: currentPath,
              diffType: "missingSun", // Mark as missing SUN
            });
          } else if (typeof obj1[k] === "object" && typeof obj2[k] === "object") {
            const children = buildDiffTree(obj1[k], obj2[k], uniqueId, currentPath);
            if (children.length > 0) {
              result.push({ id: uniqueId, label: k, children, path: currentPath, diffType: null });
            }
          } else if (obj1[k] !== obj2[k]) {
            if (typeof obj1[k] === "number" && typeof obj2[k] === "number") {
              if (Math.abs(obj1[k] - obj2[k]) <= tolerance) return;
            }
            result.push({ 
              id: uniqueId, 
              label: `${k}: ${obj1[k]} → ${obj2[k]}`, 
              color: mismatchColor,
              path: currentPath,
              diffType: "mismatches", // Mark as mismatch
            });
          }
        });
        return result;
      };

      const buildDiffTable = (obj1: any, obj2: any, prefix: string = "") => {
        let result: any[] = [];
        const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

        allKeys.forEach((k) => {
          const fullKey = prefix ? `${prefix}.${k}` : k;
          const value1 = k in obj1 ? obj1[k] : undefined;
          const value2 = k in obj2 ? obj2[k] : undefined;

          if (typeof value1 === "object" && typeof value2 === "object" && value1 && value2) {
            result.push(...buildDiffTable(value1, value2, fullKey));
          } else {
            let color = "white";
            let diffType: "mismatches" | "missingLinux" | "missingSun" | null = null;
            if (!(k in obj2)) {
              color = missingLinuxColor;
              diffType = "missingLinux";
            } else if (!(k in obj1)) {
              color = missingSunColor;
              diffType = "missingSun";
            } else if (value1 !== value2) {
              if (typeof value1 === "number" && typeof value2 === "number") {
                if (Math.abs(value1 - value2) <= tolerance) return;
              }
              color = mismatchColor;
              diffType = "mismatches";
            } else {
              return;
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
        return result;
      };

      const treeDiff = buildDiffTree(memoJson1, memoJson2);
      const tableDiff = buildDiffTable(memoJson1, memoJson2);
      
      setDiffTree(treeDiff.length > 0 ? treeDiff : [{ id: "no-diff-0", label: "No differences found", color: "gray", path: [], diffType: null }]);
      setDiffTable(tableDiff.length > 0 ? tableDiff : [{ key: "No differences", sun: "", linux: "", color: "gray", diffType: null }]);
    }
  }, [memoJson1, memoJson2, mismatchColor, missingSunColor, missingLinuxColor, tolerance, diffId]);

  useEffect(() => {
    if (!diffTree || !diffTable) return;

    // Check if all diffTypes are unchecked
    const allDiffTypesUnchecked = !diffTypes.mismatches && !diffTypes.missingLinux && !diffTypes.missingSun;

    const filterTree = (nodes: any[]): any[] => {
      return nodes
        .map((node) => {
          // Skip if all diffTypes are unchecked
          if (allDiffTypesUnchecked) return null;

          // Apply diffTypes filtering first, independently of search
          const isAllowedDiffType = !node.diffType || diffTypes[node.diffType as keyof typeof diffTypes];
          if (!isAllowedDiffType) return null;

          // Only show Missing LINUX (red) if that's the only type checked
          if (diffTypes.missingLinux && !diffTypes.mismatches && !diffTypes.missingSun) {
            if (node.diffType !== "missingLinux") return null;
          }

          // Only show Missing SUN (orange) if that's the only type checked
          if (diffTypes.missingSun && !diffTypes.mismatches && !diffTypes.missingLinux) {
            if (node.diffType !== "missingSun") return null;
          }

          // Apply search filtering if there's a query
          const matches = searchQuery && searchFields.fieldName && node.label.toLowerCase().includes(searchQuery.toLowerCase());
          const filteredChildren = node.children ? filterTree(node.children) : null;
          if (matches || (filteredChildren && filteredChildren.length > 0)) {
            return { ...node, children: filteredChildren };
          }
          return null;
        })
        .filter((node) => node !== null);
    };

    const filterTable = (rows: any[]): any[] => {
      // Skip if all diffTypes are unchecked
      if (allDiffTypesUnchecked) return [{ key: "No differences", sun: "", linux: "", color: "gray", diffType: null }];

      // Apply diffTypes filtering first, independently of search
      let filteredByDiffType = rows.filter((item) => !item.diffType || diffTypes[item.diffType as keyof typeof diffTypes]);

      // Only show Missing LINUX (red) if that's the only type checked
      if (diffTypes.missingLinux && !diffTypes.mismatches && !diffTypes.missingSun) {
        filteredByDiffType = filteredByDiffType.filter((item) => item.diffType === "missingLinux");
      }

      // Only show Missing SUN (orange) if that's the only type checked
      if (diffTypes.missingSun && !diffTypes.mismatches && !diffTypes.missingLinux) {
        filteredByDiffType = filteredByDiffType.filter((item) => item.diffType === "missingSun");
      }

      // Apply search filtering if there's a query
      if (searchQuery) {
        return filteredByDiffType.filter((item) => {
          const fieldNameMatch = searchFields.fieldName && item.key.toLowerCase().includes(searchQuery.toLowerCase());
          const sunMatch = searchFields.sun && item.sun.toLowerCase().includes(searchQuery.toLowerCase());
          const linuxMatch = searchFields.linux && item.linux.toLowerCase().includes(searchQuery.toLowerCase());
          return fieldNameMatch || sunMatch || linuxMatch;
        });
      }
      return filteredByDiffType;
    };

    let filteredTreeData = searchQuery ? filterTree(diffTree) : diffTree.filter((node) => !allDiffTypesUnchecked && (!node.diffType || diffTypes[node.diffType as keyof typeof diffTypes]));
    let filteredTableData = searchQuery ? filterTable(diffTable) : diffTable.filter((item) => !allDiffTypesUnchecked && (!item.diffType || diffTypes[item.diffType as keyof typeof diffTypes]));

    // Special case: If only Missing LINUX is checked, filter to show only red entries
    if (diffTypes.missingLinux && !diffTypes.mismatches && !diffTypes.missingSun) {
      filteredTreeData = filteredTreeData.filter((node) => node.diffType === "missingLinux");
      filteredTableData = filteredTableData.filter((item) => item.diffType === "missingLinux");
    }

    // Special case: If only Missing SUN is checked, filter to show only orange entries
    if (diffTypes.missingSun && !diffTypes.mismatches && !diffTypes.missingLinux) {
      filteredTreeData = filteredTreeData.filter((node) => node.diffType === "missingSun");
      filteredTableData = filteredTableData.filter((item) => item.diffType === "missingSun");
    }

    setFilteredTree(filteredTreeData.length > 0 ? filteredTreeData : [{ id: "no-match-0", label: "No differences found", color: "gray", path: [], diffType: null }]);
    setFilteredTable(filteredTableData.length > 0 ? filteredTableData : [{ key: "No differences", sun: "", linux: "", color: "gray", diffType: null }]);

    if (filteredTreeData) {
      const allIds = extractAllIds(filteredTreeData);
      setExpandedItems(allIds);
    }
  }, [searchQuery, diffTree, diffTable, searchFields, diffTypes, diffId]);

  // Helper function to extract all node IDs for expansion
  const extractAllIds = (nodes: any[]): string[] => {
    let ids: string[] = [];
    nodes.forEach((node) => {
      ids.push(node.id);
      if (node.children && Array.isArray(node.children)) {
        ids = [...ids, ...extractAllIds(node.children)];
      }
    });
    return ids;
  };

  const renderTree = (nodes: any) => (
    <TreeItem
      key={nodes.id}
      itemId={nodes.id}
      label={<span style={{ color: nodes.color || "white" }}>{nodes.label}</span>}
    >
      {Array.isArray(nodes.children) ? nodes.children.map(renderTree) : null}
    </TreeItem>
  );

  const copyAsCSV = () => {
    const csvContent = [
      "Field Name,SUN,LINUX",
      ...filteredTable.map(row => `${row.key},${row.sun},${row.linux}`)
    ].join("\n");
    navigator.clipboard.writeText(csvContent);
    alert("Table data copied to clipboard as CSV!");
  };

  const handleSearchFieldChange = (field: keyof typeof searchFields) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFields((prev) => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  const handleDiffTypeChange = (type: keyof typeof diffTypes) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setDiffTypes((prev) => ({
      ...prev,
      [type]: event.target.checked,
    }));
  };

  return (
    <div className="flex flex-col" style={{ width: "100%" }}>
      {/* Customization Dropdowns */}
      <div style={{ display: "flex", flexDirection: "row", gap: "16px", justifyContent: "center", marginBottom: "16px" }}>
        <FormControl sx={{ width: "150px" }} variant="outlined">
          <InputLabel style={{ color: "white" }}>Mismatch Color</InputLabel>
          <Select
            value={mismatchColor}
            onChange={(e) => setMismatchColor(e.target.value as string)}
            label="Mismatch Color"
            sx={{ color: mismatchColor, backgroundColor: "#4f4c43", "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" } }}
            MenuProps={{ PaperProps: { style: { backgroundColor: "#2e2c2c", color: "white" } } }}
          >
            {colorOptions.map((color) => (
              <MenuItem key={color} value={color} style={{ color }}>{color.charAt(0).toUpperCase() + color.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ width: "150px" }} variant="outlined">
          <InputLabel style={{ color: "white" }}>Missing SUN Color</InputLabel>
          <Select
            value={missingSunColor}
            onChange={(e) => setMissingSunColor(e.target.value as string)}
            label="Missing SUN Color"
            sx={{ color: missingSunColor, backgroundColor: "#4f4c43", "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" } }}
            MenuProps={{ PaperProps: { style: { backgroundColor: "#2e2c2c", color: "white" } } }}
          >
            {colorOptions.map((color) => (
              <MenuItem key={color} value={color} style={{ color }}>{color.charAt(0).toUpperCase() + color.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ width: "150px" }} variant="outlined">
          <InputLabel style={{ color: "white" }}>Missing LINUX Color</InputLabel>
          <Select
            value={missingLinuxColor}
            onChange={(e) => setMissingLinuxColor(e.target.value as string)}
            label="Missing LINUX Color"
            sx={{ color: missingLinuxColor, backgroundColor: "#4f4c43", "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" } }}
            MenuProps={{ PaperProps: { style: { backgroundColor: "#2e2c2c", color: "white" } } }}
          >
            {colorOptions.map((color) => (
              <MenuItem key={color} value={color} style={{ color }}>{color.charAt(0).toUpperCase() + color.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Search Box, Checkboxes, and Notes */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center", marginBottom: "16px", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "16px", alignItems: "center" }}>
          <TextField
            label="Search by key"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            sx={{ marginBottom: "16px", width: "100%", maxWidth: "400px", backgroundColor: "#4f4c43", "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" } }}
            InputProps={{ style: { color: "white" } }}
            InputLabelProps={{ style: { color: "white" } }}
          />
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={searchFields.fieldName} onChange={handleSearchFieldChange("fieldName")} sx={{ color: "white" }} />}
              label={<span style={{ color: "white" }}>FieldName</span>}
            />
            <FormControlLabel
              control={<Checkbox checked={searchFields.sun} onChange={handleSearchFieldChange("sun")} sx={{ color: "white" }} />}
              label={<span style={{ color: "white" }}>SUN</span>}
            />
            <FormControlLabel
              control={<Checkbox checked={searchFields.linux} onChange={handleSearchFieldChange("linux")} sx={{ color: "white" }} />}
              label={<span style={{ color: "white" }}>LINUX</span>}
            />
          </FormGroup>
        </div>
        <Tooltip title="Search filtering with these checkboxes applies only to the Table View, not the Tree View." placement="top" arrow>
          <Typography variant="caption" sx={{ color: "white", textAlign: "center" }}>
            * Search filtering applies only to Table View
          </Typography>
        </Tooltip>
        <div style={{ display: "flex", flexDirection: "row", gap: "16px", alignItems: "center" }}>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={diffTypes.mismatches} onChange={handleDiffTypeChange("mismatches")} sx={{ color: "white" }} />}
              label={<span style={{ color: "white" }}>Mismatches</span>}
            />
            <FormControlLabel
              control={<Checkbox checked={diffTypes.missingLinux} onChange={handleDiffTypeChange("missingLinux")} sx={{ color: "white" }} />}
              label={<span style={{ color: "white" }}>Missing LINUX</span>}
            />
            <FormControlLabel
              control={<Checkbox checked={diffTypes.missingSun} onChange={handleDiffTypeChange("missingSun")} sx={{ color: "white" }} />}
              label={<span style={{ color: "white" }}>Missing SUN</span>}
            />
          </FormGroup>
        </div>
        <Tooltip title="These filters apply to both Tree View and Table View to show only specific types of differences, regardless of search." placement="top" arrow>
          <Typography variant="caption" sx={{ color: "white", textAlign: "center" }}>
            * Difference type filtering applies to both views, regardless of search
          </Typography>
        </Tooltip>
      </div>

      {/* Tree View Section */}
      <Card sx={{ backgroundColor: "#1a202c", color: "white", marginBottom: "16px" }}>
        <Box sx={{ display: "flex", alignItems: "center", padding: "8px" }}>
          <IconButton onClick={() => setTreeOpen(!treeOpen)} sx={{ color: "white" }}>
            {treeOpen ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
          <span>Tree View</span>
        </Box>
        <Collapse in={treeOpen}>
          <CardContent>
            {filteredTree && (
              <SimpleTreeView
                expandedItems={treeOpen ? expandedItems : []}
                onExpandedItemsChange={(newExpandedItems) => setExpandedItems(newExpandedItems)}
                sx={{
                  "& .MuiTreeItem-label": { color: "inherit" },
                  "& .MuiTreeItem-iconContainer": { color: "white" },
                  backgroundColor: "#1a202c",
                  color: "white",
                  minHeight: "100%",
                }}
              >
                {filteredTree.map(renderTree)}
              </SimpleTreeView>
            )}
          </CardContent>
        </Collapse>
      </Card>

      {/* Table View Section */}
      <Card sx={{ backgroundColor: "#1a202c", color: "white" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={() => setTableOpen(!tableOpen)} sx={{ color: "white" }}>
              {tableOpen ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </IconButton>
            <span>Table View</span>
          </Box>
          <Button onClick={copyAsCSV} variant="contained" sx={{ backgroundColor: "#4f4c43", color: "white" }}>
            Copy as CSV
          </Button>
        </Box>
        <Collapse in={tableOpen}>
          <CardContent>
            {filteredTable && (
              <TableContainer>
                <Table sx={{ minWidth: 650, backgroundColor: "#1a202c" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Field Name</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>SUN</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>LINUX</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTable.map((row) => (
                      <TableRow key={row.key}>
                        <TableCell sx={{ color: row.color }}>{row.key}</TableCell>
                        <TableCell sx={{ color: row.color }}>{row.sun}</TableCell>
                        <TableCell sx={{ color: row.color }}>{row.linux}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Collapse>
      </Card>
    </div>
  );
};

export default JsonDiffViewer;