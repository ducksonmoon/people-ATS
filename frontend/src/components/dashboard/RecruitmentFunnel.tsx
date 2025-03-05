import React from "react";
import { Paper, Typography, Box, useTheme, Chip, Grid } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

interface RecruitmentFunnelProps {
  data: any[];
  title?: string;
}

/**
 * Component for displaying the recruitment funnel chart
 */
const RecruitmentFunnel: React.FC<RecruitmentFunnelProps> = ({
  data,
  title = "Recruitment Funnel",
}) => {
  const theme = useTheme();

  // Calculate conversion rates from one stage to the next
  const conversionRates = React.useMemo(() => {
    if (!data || data.length < 2) return [];

    const rates = [];
    for (let i = 0; i < data.length - 1; i++) {
      const currentStage = data[i];
      const nextStage = data[i + 1];

      if (currentStage.value === 0) continue;

      const conversionRate = (nextStage.value / currentStage.value) * 100;
      rates.push({
        from: currentStage.name,
        to: nextStage.name,
        rate: conversionRate.toFixed(1),
      });
    }

    return rates;
  }, [data]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        {title}
      </Typography>

      <Box sx={{ flexGrow: 1 }}>
        {data.length === 0 ? (
          <Box
            sx={{
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.secondary">
              No recruitment funnel data available
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                  borderRadius: 8,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={theme.palette.primary.main}
                fill={theme.palette.primary.main}
                fillOpacity={0.7}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>

      {/* Conversion Rates */}
      {conversionRates.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Conversion Rates
          </Typography>

          <Grid container spacing={1}>
            {conversionRates.map((rate, index) => (
              <Grid item xs={12} key={index}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2">
                    {rate.from} → {rate.to}
                  </Typography>
                  <Chip
                    label={`${rate.rate}%`}
                    size="small"
                    color={
                      parseFloat(rate.rate) > 50
                        ? "success"
                        : parseFloat(rate.rate) > 20
                        ? "primary"
                        : "warning"
                    }
                    sx={{ fontWeight: 600, minWidth: 60 }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default RecruitmentFunnel;
