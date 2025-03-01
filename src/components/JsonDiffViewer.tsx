import React, { useState } from "react";
import { Card, CardContent } from "@mui/material";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import JsonInput from "./JsonInput"; // Ensure this matches your file structure and export

const JsonDiffViewer = () => {
  const [json1, setJson1] = useState<any | null>(null);
  const [json2, setJson2] = useState<any | null>(null);
  const [diffTree, setDiffTree] = useState<any[] | null>(null);
  const [error, setError] = useState<string>("");

  const handleCompare = (json1Data: any, json2Data: any) => {
    console.log("JSON 1:", JSON.stringify(json1Data, null, 2));
    console.log("JSON 2:", JSON.stringify(json2Data, null, 2));

    const buildDiffTree = (obj1: any, obj2: any, parentId: string = "root") => {
      let result: any[] = [];
      const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

      let idCounter = 0;
      allKeys.forEach((k) => {
        const uniqueId = `${parentId}-${k}-${idCounter++}`; // Ensure unique IDs
        if (!(k in obj2)) {
          result.push({ id: uniqueId, label: `${k} (Removed)`, color: "red" });
        } else if (!(k in obj1)) {
          result.push({ id: uniqueId, label: `${k} (Added)`, color: "green" });
        } else if (typeof obj1[k] === "object" && typeof obj2[k] === "object") {
          const children = buildDiffTree(obj1[k], obj2[k], uniqueId);
          if (children.length > 0) { // Only include if there are differences
            result.push({ 
              id: uniqueId, 
              label: k, 
              children: children 
            });
          }
        } else if (obj1[k] !== obj2[k]) {
          result.push({ 
            id: uniqueId, 
            label: `${k}: ${obj1[k]} → ${obj2[k]}`, 
            color: "yellow" 
          });
        }
      });
      return result;
    };

    const diff = buildDiffTree(json1Data, json2Data);
    console.log("Diff Tree:", JSON.stringify(diff, null, 2));
    setDiffTree(diff.length > 0 ? diff : [{ id: "no-diff-0", label: "No differences found", color: "gray" }]);
  };

  const renderTree = (nodes: any) => (
    <TreeItem 
      key={nodes.id} 
      itemId={nodes.id} // Use `itemId` instead of `nodeId`
      label={
        <span 
          style={{ 
            color: nodes.color === "red" ? "red" : 
                  nodes.color === "green" ? "green" : 
                  nodes.color === "yellow" ? "yellow" : 
                  nodes.color === "gray" ? "gray" : "white"
          }}
        >
          {nodes.label}
        </span>
      }
    >
      {Array.isArray(nodes.children) ? nodes.children.map(renderTree) : null}
    </TreeItem>
  );

  return (
  <div className="p-6 max-w-6xl mx-auto bg-gray-900 text-white flex flex-col sm:flex-row gap-6 debug">
    <div className="w-full sm:w-1/2 flex flex-col"> {/* Ensure this div has flex properties */}
      <JsonInput 
        onCompare={handleCompare} 
        json1={json1} 
        setJson1={setJson1} 
        json2={json2} 
        setJson2={setJson2} 
        error={error} 
        setError={setError} 
      />
    </div>

    <div className="w-full sm:w-1/2 flex flex-col"> {/* Ensure this div has flex properties */}
      {diffTree && (
        <Card sx={{ backgroundColor: '#1a202c', color: 'white', height: '100%' }}>
          <CardContent sx={{ height: '100%' }}>
            <SimpleTreeView
              sx={{
                '& .MuiTreeItem-label': { color: 'inherit' }, // Inherit color from label
                '& .MuiTreeItem-iconContainer': { color: 'white' },
                backgroundColor: '#1a202c', // Ensure dark background
                color: 'white', // Ensure text is visible
                minHeight: '100%', // Fill the container height
                height: '100%', // Ensure it takes full height of CardContent
              }}
            >
              {diffTree.map(renderTree)}
            </SimpleTreeView>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
);

};

export default JsonDiffViewer;