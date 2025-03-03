// components/Dashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import { fetchMigrationStats, fetchServicesToDiff, fetchEnvironmentsToDiff } from "../services/dataService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const Dashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<any[]>([]);
  const [percentageMigrated, setPercentageMigrated] = useState<number>(0);
  const [serviceFilter, setServiceFilter] = useState<string>("All");
  const [environmentFilter, setEnvironmentFilter] = useState<string>("All");
  const [apiFilter, setApiFilter] = useState<string>("All");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const data = fetchMigrationStats(startDate, endDate);
    console.log("Fetched migration stats:", data);
    setStats(data.stats);
    setPercentageMigrated(data.percentageMigrated);
  }, [startDate, endDate]);

  // Filter stats based on selections
  const filteredStats = stats.filter((stat) => {
    const matchesService = serviceFilter === "All" || stat.service === serviceFilter;
    const matchesEnvironment = environmentFilter === "All" || stat.environment === environmentFilter;
    const matchesApi = apiFilter === "All" || stat.apis.some((api: any) => api.api === apiFilter);
    return matchesService && matchesEnvironment && matchesApi;
  });

  // Determine chart data based on filters
  const chartData = () => {
    // Case 1: Service selected, All APIs, All Environments -> Show environments for that service
    if (serviceFilter !== "All" && apiFilter === "All" && environmentFilter === "All") {
      const environments = ["DEV", "BETA", "UAT", "PROD"];
      return {
        labels: environments,
        datasets: [
          {
            label: `Differences for ${serviceFilter}`,
            data: environments.map((env) => {
              const stat = stats.find((s) => s.service === serviceFilter && s.environment === env);
              return stat ? Math.round(stat.differencesCount) : 0;
            }),
            backgroundColor: "#ff9800", // Orange color
            borderRadius: 8,
          },
        ],
      };
    }

    // Case 2: Environment selected -> Show APIs for that environment
    if (environmentFilter !== "All") {
      const apis = [...new Set(filteredStats.flatMap((s) => s.apis.map((a: any) => a.api)))];
      return {
        labels: apis,
        datasets: [
          {
            label: `Differences in ${environmentFilter}`,
            data: apis.map((api) => {
              const differences = filteredStats
                .flatMap((s) => s.apis)
                .filter((a: any) => a.api === api)
                .reduce((sum: number, a: any) => sum + a.differences, 0);
              return Math.round(differences);
            }),
            backgroundColor: "#ff9800", // Orange color
            borderRadius: 8,
          },
        ],
      };
    }

    // Default: Show service-environment combinations
    return {
      labels: filteredStats.map((s) => `${s.service} (${s.environment})`),
      datasets: [
        {
          label: "Number of Differences",
          data: filteredStats.map((s) => Math.round(s.differencesCount)),
          backgroundColor: "#ff9800", // Orange color
          borderRadius: 8,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const, labels: { color: theme.palette.text.primary } },
      title: {
        display: true,
        text:
          serviceFilter !== "All" && apiFilter === "All" && environmentFilter === "All"
            ? `Differences by Environment for ${serviceFilter}`
            : environmentFilter !== "All"
            ? `API Differences in ${environmentFilter}`
            : "Differences by Service and Environment",
        color: theme.palette.text.primary,
        font: { size: 18, weight: "bold" as const },
      },
    },
    scales: {
      x: { ticks: { color: theme.palette.text.secondary } },
      y: {
        ticks: {
          color: theme.palette.text.secondary,
          stepSize: 1, // Ensure whole numbers
          callback: (value: number) => Number.isInteger(value) ? value : null, // Show only whole numbers
        },
      },
    },
    animation: {
      duration: 1500,
      easing: "easeOutBounce" as const,
    },
  };

  const uniqueApis = [...new Set(stats.flatMap((s) => s.apis.map((a: any) => a.api)))];

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: "background.default",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)",
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        overflow: "hidden",
        "&:hover": {
          boxShadow: "0 12px 48px rgba(0, 0, 0, 0.3)",
          transition: "all 0.3s ease-in-out",
        },
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          color: "white",
          textAlign: "center",
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
          animation: "fadeIn 1s ease-in",
          "@keyframes fadeIn": {
            "0%": { opacity: 0, transform: "translateY(-20px)" },
            "100%": { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        Migration Status Dashboard
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mt: 4 }}>
        {/* Progress Card */}
        <Paper
          elevation={8}
          sx={{
            p: 3,
            bgcolor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "translateY(-4px)" },
          }}
        >
          <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600 }}>
            Overall Migration Progress
          </Typography>
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={percentageMigrated}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: "rgba(255, 255, 255, 0.1)",
                "& .MuiLinearProgress-bar": {
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                },
              }}
            />
            <Typography
              sx={{ mt: 1, color: "text.secondary", fontWeight: 500 }}
            >
              {percentageMigrated.toFixed(2)}% of APIs fully migrated
            </Typography>
          </Box>
        </Paper>

        {/* Filters */}
        <Paper
          elevation={8}
          sx={{
            p: 3,
            bgcolor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
            <Tooltip title="Filter by Service" arrow>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel sx={{ color: "text.primary", fontWeight: 500 }}>Service</InputLabel>
                <Select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value as string)}
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
                  }}
                >
                  <MenuItem value="All">All Services</MenuItem>
                  {fetchServicesToDiff().map((service) => (
                    <MenuItem key={service} value={service}>{service}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Tooltip>

            <Tooltip title="Filter by Environment" arrow>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel sx={{ color: "text.primary", fontWeight: 500 }}>Environment</InputLabel>
                <Select
                  value={environmentFilter}
                  onChange={(e) => setEnvironmentFilter(e.target.value as string)}
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
                  }}
                >
                  <MenuItem value="All">All Environments</MenuItem>
                  {fetchEnvironmentsToDiff().map((env) => (
                    <MenuItem key={env} value={env}>{env}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Tooltip>

            <Tooltip title="Filter by API" arrow>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel sx={{ color: "text.primary", fontWeight: 500 }}>API</InputLabel>
                <Select
                  value={apiFilter}
                  onChange={(e) => setApiFilter(e.target.value as string)}
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
                  }}
                >
                  <MenuItem value="All">All APIs</MenuItem>
                  {uniqueApis.map((api) => (
                    <MenuItem key={api} value={api}>{api}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Tooltip>

            <TextField
              label="Start Date (YYYY-MM-DD)"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              variant="outlined"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
              }}
              InputLabelProps={{ sx: { color: "text.primary", fontWeight: 500 } }}
            />
            <TextField
              label="End Date (YYYY-MM-DD)"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              variant="outlined"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
              }}
              InputLabelProps={{ sx: { color: "text.primary", fontWeight: 500 } }}
            />
          </Box>
        </Paper>

        {/* Chart */}
        <Paper
          elevation={8}
          sx={{
            p: 3,
            bgcolor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <Bar data={chartData()} options={chartOptions} />
        </Paper>

        {/* Service Status */}
        <Paper
          elevation={8}
          sx={{
            p: 3,
            bgcolor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600, mb: 2 }}>
            Service Status
          </Typography>
          {filteredStats.map((stat) => (
            <Accordion
              key={`${stat.service}-${stat.environment}`}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                mb: 1,
                "&:before": { display: "none" },
                transition: "all 0.3s ease",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.12)" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "text.primary" }} />}
                sx={{ "& .MuiAccordionSummary-content": { alignItems: "center" } }}
              >
                <Typography sx={{ color: "text.primary", fontWeight: 500 }}>
                  {stat.service} ({stat.environment}): {stat.differencesCount} differences -{" "}
                  <Box
                    component="span"
                    sx={{
                      color: stat.status === "Completed" ? "#00e676" : "#ff9100",
                      fontWeight: 600,
                      px: 1,
                      py: 0.5,
                      bgcolor: stat.status === "Completed" ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 145, 0, 0.1)",
                      borderRadius: "12px",
                    }}
                  >
                    {stat.status}
                  </Box>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ pl: 2 }}>
                  {stat.apis.length > 0 ? (
                    stat.apis.map((api: any) => (
                      <Typography
                        key={api.diffingId}
                        sx={{ color: "text.secondary", mb: 1, fontSize: "0.95rem" }}
                      >
                        {api.api}: {api.differences} Differences -{" "}
                        <Box
                          component="span"
                          sx={{
                            color: api.status === "Completed" ? "#00e676" : "#ff9100",
                            fontWeight: 600,
                            px: 1,
                            py: 0.5,
                            bgcolor: api.status === "Completed" ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 145, 0, 0.1)",
                            borderRadius: "12px",
                          }}
                        >
                          {api.status}
                        </Box>
                      </Typography>
                    ))
                  ) : (
                    <Typography sx={{ color: "text.secondary", fontStyle: "italic" }}>
                      No APIs found for this service/environment in the selected time range.
                    </Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;