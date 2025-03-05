import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { DepartmentMetric } from "../../types";

interface DepartmentMetricsProps {
  data: DepartmentMetric[];
  onViewDepartment: (id: number) => void;
}

/**
 * Component that displays department metrics including headcount,
 * open requisitions, turnover rate, and hiring progress
 */
const DepartmentMetrics: React.FC<DepartmentMetricsProps> = ({
  data,
  onViewDepartment,
}) => {
  const theme = useTheme();

  // Calculate overall company metrics
  const companyMetrics = useMemo(() => {
    if (data.length === 0) return null;

    return {
      totalCurrentHeadcount: data.reduce(
        (sum, dept) => sum + dept.currentHeadcount,
        0
      ),
      totalTargetHeadcount: data.reduce(
        (sum, dept) => sum + dept.targetHeadcount,
        0
      ),
      totalOpenRequisitions: data.reduce(
        (sum, dept) => sum + dept.openRequisitions,
        0
      ),
      avgTurnoverRate:
        data.reduce((sum, dept) => sum + (dept.turnoverRate || 0), 0) /
        data.length,
    };
  }, [data]);

  // Helper function to determine color based on headcount progress
  const getHeadcountColor = (current: number, target: number): string => {
    const ratio = current / target;
    if (ratio >= 0.9) return theme.palette.success.main;
    if (ratio >= 0.7) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Helper function to determine color based on turnover rate
  const getTurnoverColor = (rate: number | undefined): string => {
    if (!rate) return theme.palette.text.secondary;
    if (rate <= 5) return theme.palette.success.main;
    if (rate <= 15) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Card elevation={0} sx={{ height: "100%" }}>
      <CardHeader
        title="Department Metrics"
        titleTypographyProps={{ variant: "h6" }}
        action={
          companyMetrics && (
            <Chip
              label={`${Math.round(
                (companyMetrics.totalCurrentHeadcount /
                  companyMetrics.totalTargetHeadcount) *
                  100
              )}% Staffed Overall`}
              color={
                companyMetrics.totalCurrentHeadcount >=
                companyMetrics.totalTargetHeadcount * 0.9
                  ? "success"
                  : "warning"
              }
              size="small"
              sx={{ mr: 1 }}
            />
          )
        }
      />
      <CardContent sx={{ pb: 1.5 }}>
        {data.length === 0 ? (
          <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
            No department metrics available
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Department</TableCell>
                  <TableCell align="right">Headcount</TableCell>
                  <TableCell align="right">Open Reqs</TableCell>
                  <TableCell align="right">Turnover</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((dept) => (
                  <TableRow key={dept.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {dept.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: getHeadcountColor(
                              dept.currentHeadcount,
                              dept.targetHeadcount
                            ),
                          }}
                        >
                          {dept.currentHeadcount}/{dept.targetHeadcount}
                        </Typography>
                        {dept.currentHeadcount < dept.targetHeadcount ? (
                          <TrendingUpIcon
                            fontSize="small"
                            sx={{ ml: 0.5, color: theme.palette.success.main }}
                          />
                        ) : dept.currentHeadcount > dept.targetHeadcount ? (
                          <TrendingDownIcon
                            fontSize="small"
                            sx={{ ml: 0.5, color: theme.palette.error.main }}
                          />
                        ) : null}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={dept.openRequisitions}
                        size="small"
                        color={dept.openRequisitions > 0 ? "info" : "default"}
                        sx={{
                          minWidth: 30,
                          height: 20,
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: getTurnoverColor(dept.turnoverRate),
                        }}
                      >
                        {dept.turnoverRate
                          ? `${dept.turnoverRate.toFixed(1)}%`
                          : "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View department details">
                        <IconButton
                          size="small"
                          onClick={() => onViewDepartment(dept.id)}
                          aria-label={`View ${dept.name} details`}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {companyMetrics && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 3,
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Total Headcount
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {companyMetrics.totalCurrentHeadcount}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Open Requisitions
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {companyMetrics.totalOpenRequisitions}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Avg Turnover Rate
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: getTurnoverColor(companyMetrics.avgTurnoverRate),
                }}
              >
                {companyMetrics.avgTurnoverRate.toFixed(1)}%
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentMetrics;
