// src/theme.ts
import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3b82f6" }, // Blue for buttons
    secondary: { main: "#f97316" }, // Orange for text
    background: { default: "#1a202c", paper: "#2e2c2c" },
    text: { primary: "#ffffff", secondary: "#f97316" }, // White and orange
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#3b82f6" }, // Blue for buttons
    secondary: { main: "#f97316" }, // Orange for text
    background: { default: "#f3f4f6", paper: "#ffffff" },
    text: { primary: "#000000", secondary: "#f97316" }, // Black and orange
  },
});