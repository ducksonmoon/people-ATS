import React from "react";
import {
  Paper,
  Typography,
  Box,
  useTheme,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

interface HiringTrendsProps {
  data: any[];
  title?: string;
}

/**
 * Component for displaying hiring trends chart
 */
const HiringTrends: React.FC<HiringTrendsProps> = ({
  data,
  title = "Hiring Trends",
}) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = React.useState("6months");

  // Filter data based on time range (this would be implemented with real data)
  const filteredData = React.useMemo(() => {
    // In a real implementation, you would filter the data based on timeRange
    return data;
  }, [data, timeRange]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Period"
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="3months">Last 3 Months</MenuItem>
            <MenuItem value="6months">Last 6 Months</MenuItem>
            <MenuItem value="1year">Last Year</MenuItem>
            <MenuItem value="ytd">Year to Date</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {data.length === 0 ? (
        <Box
          sx={{
            height: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="text.secondary">
            No hiring trend data available for this period
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: theme.palette.text.secondary }}
              axisLine={{ stroke: theme.palette.divider }}
            />
            <YAxis
              tick={{ fill: theme.palette.text.secondary }}
              axisLine={{ stroke: theme.palette.divider }}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider,
                borderRadius: 8,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Bar
              dataKey="applications"
              fill={theme.palette.primary.main}
              name="Applications"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="interviews"
              fill={theme.palette.info.main}
              name="Interviews"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="offers"
              fill={theme.palette.warning.main}
              name="Offers"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="hires"
              fill={theme.palette.success.main}
              name="Hires"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

export default HiringTrends;
