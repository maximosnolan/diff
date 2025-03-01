// src/components/JsonDiffViewer.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@mui/material";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";

interface JsonDiffViewerProps {
  json1: any | null;
  json2: any | null;
}

const JsonDiffViewer: React.FC<JsonDiffViewerProps> = ({ json1, json2 }) => {
  const [diffTree, setDiffTree] = useState<any[] | null>(null);

  useEffect(() => {
    if (json1 && json2) {
      const buildDiffTree = (obj1: any, obj2: any, parentId: string = "root") => {
        let result: any[] = [];
        const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

        let idCounter = 0;
        allKeys.forEach((k) => {
          const uniqueId = `${parentId}-${k}-${idCounter++}`;
          if (!(k in obj2)) {
            result.push({ id: uniqueId, label: `${k} (Removed)`, color: "red" });
          } else if (!(k in obj1)) {
            result.push({ id: uniqueId, label: `${k} (Added)`, color: "green" });
          } else if (typeof obj1[k] === "object" && typeof obj2[k] === "object") {
            const children = buildDiffTree(obj1[k], obj2[k], uniqueId);
            if (children.length > 0) {
              result.push({ id: uniqueId, label: k, children: children });
            }
          } else if (obj1[k] !== obj2[k]) {
            result.push({ id: uniqueId, label: `${k}: ${obj1[k]} → ${obj2[k]}`, color: "yellow" });
          }
        });
        return result;
      };

      const diff = buildDiffTree(json1, json2);
      setDiffTree(diff.length > 0 ? diff : [{ id: "no-diff-0", label: "No differences found", color: "gray" }]);
    }
  }, [json1, json2]);

  const renderTree = (nodes: any) => (
    <TreeItem
      key={nodes.id}
      itemId={nodes.id}
      label={
        <span
          style={{
            color: nodes.color === "red" ? "red" :
                   nodes.color === "green" ? "green" :
                   nodes.color === "yellow" ? "yellow" : 
                   nodes.color === "gray" ? "gray" : "white",
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
    <div className="flex flex-col">
      {diffTree && (
        <Card sx={{ backgroundColor: '#1a202c', color: 'white', height: '100%' }}>
          <CardContent sx={{ height: '100%' }}>
            <SimpleTreeView
              sx={{
                '& .MuiTreeItem-label': { color: 'inherit' },
                '& .MuiTreeItem-iconContainer': { color: 'white' },
                backgroundColor: '#1a202c',
                color: 'white',
                minHeight: '100%',
                height: '100%',
              }}
            >
              {diffTree.map(renderTree)}
            </SimpleTreeView>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JsonDiffViewer;
