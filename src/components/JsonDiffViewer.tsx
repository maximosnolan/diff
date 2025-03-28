// components/JsonDiffViewer.tsx
import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
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
  Paper,
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

const JsonDiffViewer = forwardRef(({ json1, json2, tolerance = 0.0001, shouldExpand = false, setShouldExpand, diffId }: JsonDiffViewerProps, ref) => {
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

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Memoize json1 and json2 to stabilize their references in useEffect
  const memoJson1 = useMemo(() => JSON.parse(JSON.stringify(json1)), [json1, diffId]);
  const memoJson2 = useMemo(() => JSON.parse(JSON.stringify(json2)), [json2, diffId]);

  useImperativeHandle(ref, () => ({
    scrollIntoView: () => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
  }));

  useEffect(() => {
    console.log("shouldExpand changed to:", shouldExpand);
    if (shouldExpand && setShouldExpand && !treeOpen && !tableOpen) {
      setTreeOpen(true);
      setTableOpen(true);
      setShouldExpand(false);
      if (filteredTree) {
        const allIds = extractAllIds(filteredTree);
        setExpandedItems(allIds);
      }
    }
  }, [shouldExpand, setShouldExpand, filteredTree, treeOpen, tableOpen]);

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
              diffType: "missingLinux",
            });
          } else if (!(k in obj1)) {
            result.push({
              id: uniqueId,
              label: `${k}: ${JSON.stringify(obj2[k])} (Missing SUN)`,
              color: missingSunColor,
              path: currentPath,
              diffType: "missingSun",
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
              diffType: "mismatches",
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

    const allDiffTypesUnchecked = !diffTypes.mismatches && !diffTypes.missingLinux && !diffTypes.missingSun;

    const filterTree = (nodes: any[]): any[] => {
      return nodes
        .map((node) => {
          if (allDiffTypesUnchecked) return null;

          const isAllowedDiffType = !node.diffType || diffTypes[node.diffType as keyof typeof diffTypes];
          if (!isAllowedDiffType) return null;

          if (diffTypes.missingLinux && !diffTypes.mismatches && !diffTypes.missingSun) {
            if (node.diffType !== "missingLinux") return null;
          }

          if (diffTypes.missingSun && !diffTypes.mismatches && !diffTypes.missingLinux) {
            if (node.diffType !== "missingSun") return null;
          }

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
      if (allDiffTypesUnchecked) return [{ key: "No differences", sun: "", linux: "", color: "gray", diffType: null }];

      let filteredByDiffType = rows.filter((item) => !item.diffType || diffTypes[item.diffType as keyof typeof diffTypes]);

      if (diffTypes.missingLinux && !diffTypes.mismatches && !diffTypes.missingSun) {
        filteredByDiffType = filteredByDiffType.filter((item) => item.diffType === "missingLinux");
      }

      if (diffTypes.missingSun && !diffTypes.mismatches && !diffTypes.missingLinux) {
        filteredByDiffType = filteredByDiffType.filter((item) => item.diffType === "missingSun");
      }

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

    if (diffTypes.missingLinux && !diffTypes.mismatches && !diffTypes.missingSun) {
      filteredTreeData = filteredTreeData.filter((node) => node.diffType === "missingLinux");
      filteredTableData = filteredTableData.filter((item) => item.diffType === "missingLinux");
    }

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
      ...filteredTable.map((row) => `${row.key},${row.sun},${row.linux}`),
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
    <Box
      ref={containerRef} // Ref to scroll to
      sx={{
        width: "100%",
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
        JSON Difference Viewer
      </Typography>

      {/* Customization Dropdowns */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          justifyContent: "center",
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <FormControl
          sx={{
            minWidth: "150px",
            bgcolor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
          }}
          variant="outlined"
        >
          <InputLabel sx={{ color: "white" }}>Mismatch Color</InputLabel>
          <Select
            value={mismatchColor}
            onChange={(e) => setMismatchColor(e.target.value as string)}
            label="Mismatch Color"
            sx={{
              color: mismatchColor,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
            }}
            MenuProps={{
              PaperProps: { sx: { bgcolor: "#2e2c2c", color: "white" } },
            }}
          >
            {colorOptions.map((color) => (
              <MenuItem key={color} value={color} sx={{ color }}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          sx={{
            minWidth: "150px",
            bgcolor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
          }}
          variant="outlined"
        >
          <InputLabel sx={{ color: "white" }}>Missing SUN Color</InputLabel>
          <Select
            value={missingSunColor}
            onChange={(e) => setMissingSunColor(e.target.value as string)}
            label="Missing SUN Color"
            sx={{
              color: missingSunColor,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
            }}
            MenuProps={{
              PaperProps: { sx: { bgcolor: "#2e2c2c", color: "white" } },
            }}
          >
            {colorOptions.map((color) => (
              <MenuItem key={color} value={color} sx={{ color }}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          sx={{
            minWidth: "150px",
            bgcolor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
          }}
          variant="outlined"
        >
          <InputLabel sx={{ color: "white" }}>Missing LINUX Color</InputLabel>
          <Select
            value={missingLinuxColor}
            onChange={(e) => setMissingLinuxColor(e.target.value as string)}
            label="Missing LINUX Color"
            sx={{
              color: missingLinuxColor,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
            }}
            MenuProps={{
              PaperProps: { sx: { bgcolor: "#2e2c2c", color: "white" } },
            }}
          >
            {colorOptions.map((color) => (
              <MenuItem key={color} value={color} sx={{ color }}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Search Box, Checkboxes, and Notes */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          justifyContent: "center",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "center", width: "100%", maxWidth: "600px" }}>
          <TextField
            label="Search by key"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            sx={{
              width: "100%",
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
            }}
            InputLabelProps={{ sx: { color: "white" } }}
          />
          <FormGroup sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
            <FormControlLabel
              control={<Checkbox checked={searchFields.fieldName} onChange={handleSearchFieldChange("fieldName")} sx={{ color: "white" }} />}
              label={<Typography sx={{ color: "white" }}>FieldName</Typography>}
            />
            <FormControlLabel
              control={<Checkbox checked={searchFields.sun} onChange={handleSearchFieldChange("sun")} sx={{ color: "white" }} />}
              label={<Typography sx={{ color: "white" }}>SUN</Typography>}
            />
            <FormControlLabel
              control={<Checkbox checked={searchFields.linux} onChange={handleSearchFieldChange("linux")} sx={{ color: "white" }} />}
              label={<Typography sx={{ color: "white" }}>LINUX</Typography>}
            />
          </FormGroup>
        </Box>
        <Tooltip title="Search filtering with these checkboxes applies only to the Table View, not the Tree View." placement="top" arrow>
          <Typography
            variant="caption"
            sx={{
              color: "white",
              textAlign: "center",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              p: 1,
              borderRadius: "4px",
            }}
          >
            * Search filtering applies only to Table View
          </Typography>
        </Tooltip>
        <Box sx={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "center", width: "100%", maxWidth: "600px" }}>
          <FormGroup sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
            <FormControlLabel
              control={<Checkbox checked={diffTypes.mismatches} onChange={handleDiffTypeChange("mismatches")} sx={{ color: "white" }} />}
              label={<Typography sx={{ color: "white" }}>Mismatches</Typography>}
            />
            <FormControlLabel
              control={<Checkbox checked={diffTypes.missingLinux} onChange={handleDiffTypeChange("missingLinux")} sx={{ color: "white" }} />}
              label={<Typography sx={{ color: "white" }}>Missing LINUX</Typography>}
            />
            <FormControlLabel
              control={<Checkbox checked={diffTypes.missingSun} onChange={handleDiffTypeChange("missingSun")} sx={{ color: "white" }} />}
              label={<Typography sx={{ color: "white" }}>Missing SUN</Typography>}
            />
          </FormGroup>
        </Box>
        <Tooltip title="These filters apply to both Tree View and Table View to show only specific types of differences, regardless of search." placement="top" arrow>
          <Typography
            variant="caption"
            sx={{
              color: "white",
              textAlign: "center",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              p: 1,
              borderRadius: "4px",
            }}
          >
            * Difference type filtering applies to both views, regardless of search
          </Typography>
        </Tooltip>
      </Box>

      {/* Tree View Section */}
      <Paper
        elevation={8}
        sx={{
          mb: 3,
          bgcolor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "all 0.3s ease",
          "&:hover": { boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "12px",
            bgcolor: "rgba(26, 32, 44, 0.8)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          <IconButton onClick={() => setTreeOpen(!treeOpen)} sx={{ color: "white" }}>
            {treeOpen ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
          <Typography sx={{ color: "white", fontWeight: 600 }}>Tree View</Typography>
        </Box>
        <Collapse in={treeOpen}>
          <CardContent sx={{ bgcolor: "#1a202c", borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" }}>
            {filteredTree && (
              <SimpleTreeView
                expandedItems={treeOpen ? expandedItems : []}
                onExpandedItemsChange={(newExpandedItems) => setExpandedItems(newExpandedItems)}
                sx={{
                  "& .MuiTreeItem-label": { color: "inherit" },
                  "& .MuiTreeItem-iconContainer": { color: "white" },
                  bgcolor: "#1a202c",
                  minHeight: "300px",
                }}
              >
                {filteredTree.map(renderTree)}
              </SimpleTreeView>
            )}
          </CardContent>
        </Collapse>
      </Paper>

      {/* Table View Section */}
      <Paper
        elevation={8}
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "all 0.3s ease",
          "&:hover": { boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px",
            bgcolor: "rgba(26, 32, 44, 0.8)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={() => setTableOpen(!tableOpen)} sx={{ color: "white" }}>
              {tableOpen ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </IconButton>
            <Typography sx={{ color: "white", fontWeight: 600 }}>Table View</Typography>
          </Box>
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
        </Box>
        <Collapse in={tableOpen}>
          <CardContent sx={{ bgcolor: "#1a202c", borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" }}>
            {filteredTable && (
              <TableContainer>
                <Table sx={{ minWidth: 650, bgcolor: "#1a202c" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "white", fontWeight: "bold", borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}>Field Name</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}>SUN</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}>LINUX</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTable.map((row) => (
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
            )}
          </CardContent>
        </Collapse>
      </Paper>
    </Box>
  );
});

export default JsonDiffViewer;