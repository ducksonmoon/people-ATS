import React from "react";
import { Box, Typography, Chip, Button, useTheme, alpha } from "@mui/material";
import {
  LocationOn,
  Category,
  AccessTime,
  Business,
} from "@mui/icons-material";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useCompanyTheme } from "../../hooks/useCompanyTheme";

interface JobHeaderProps {
  title: string;
  company: string;
  location: string | { id: number; name: string };
  category: string | { id: number; name: string };
  createdAt: string;
  onApplyClick: () => void;
}

const JobHeader: React.FC<JobHeaderProps> = ({
  title,
  company,
  location,
  category,
  createdAt,
  onApplyClick,
}) => {
  const theme = useTheme();
  const companyTheme = useCompanyTheme();

  // Format location and category depending on whether they're strings or objects
  const formatValue = (
    value: string | { id: number; name: string }
  ): string => {
    return typeof value === "string" ? value : value.name;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", md: "center" },
        mb: 4,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: companyTheme.primary || theme.palette.primary.main,
          }}
        >
          {title}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <Business fontSize="small" />
          {company}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Chip
            icon={<LocationOn fontSize="small" />}
            label={formatValue(location)}
            color="primary"
            variant="outlined"
            size="medium"
            sx={{
              borderColor: companyTheme.primary,
              color: companyTheme.primary,
            }}
          />
          <Chip
            icon={<Category fontSize="small" />}
            label={formatValue(category)}
            color="primary"
            variant="outlined"
            size="medium"
            sx={{
              borderColor: companyTheme.primary,
              color: companyTheme.primary,
            }}
          />
          <Chip
            icon={<AccessTime fontSize="small" />}
            label={`Posted ${formatDistanceToNow(parseISO(createdAt), {
              addSuffix: true,
            })}`}
            color="primary"
            variant="outlined"
            size="medium"
            sx={{
              borderColor: companyTheme.primary,
              color: companyTheme.primary,
            }}
          />
        </Box>
      </Box>

      <Button
        variant="contained"
        size="large"
        onClick={onApplyClick}
        sx={{
          mt: { xs: 3, md: 0 },
          px: 4,
          py: 1.5,
          background:
            companyTheme.primaryGradient ||
            `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: companyTheme.contrastText || "white",
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: `0 8px 20px ${alpha(
            companyTheme.primary || theme.palette.primary.main,
            0.3
          )}`,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 12px 25px ${alpha(
              companyTheme.primary || theme.palette.primary.main,
              0.4
            )}`,
          },
        }}
      >
        Apply Now
      </Button>
    </Box>
  );
};

export default JobHeader;
