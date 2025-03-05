import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  useMediaQuery,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Stack,
  IconButton,
  Zoom,
  Fade,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useCompanyTheme from "../../hooks/useCompanyTheme";
import {
  Search,
  LocationOn,
  BusinessCenter,
  ArrowForward,
  TrendingUp,
  LocalActivity,
  Work,
} from "@mui/icons-material";

interface JobsHeroProps {
  title?: string;
  subtitle?: string;
  onSearch?: (search: string) => void;
  popularSearches?: string[];
  popularCategories?: Array<{ id: number; name: string }>;
  isLoading?: boolean;
}

/**
 * Enhanced hero section for the jobs page with direct search capability
 */
const JobsHero: React.FC<JobsHeroProps> = ({
  title = "Discover Your Perfect Career Path",
  subtitle = "Thousands of opportunities waiting for your talent and expertise",
  onSearch,
  popularSearches = ["Software Engineer", "Marketing", "Sales", "Design"],
  popularCategories = [],
  isLoading = false,
}) => {
  const theme = useTheme();
  const companyTheme = useCompanyTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchValue, setSearchValue] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Hero search submitted:", searchValue);
    if (onSearch && searchValue.trim()) {
      onSearch(searchValue.trim());
    }
  };

  const handleQuickSearch = (keyword: string) => {
    console.log("Quick search clicked:", keyword);
    setSearchValue(keyword);
    if (onSearch) {
      onSearch(keyword.trim());
    }
  };

  // Calculate animation delays for staggered animations
  const animationDelays = [0, 100, 200, 300, 400, 500];

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: { xs: 8, md: 12 },
        pb: { xs: 10, md: 14 },
        mb: { xs: 4, md: 6 },
      }}
    >
      {/* Background gradient */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(120deg, ${companyTheme.primary}08 0%, ${companyTheme.primary}15 100%)`,
          zIndex: -2,
        }}
      />

      {/* Decorative patterns */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.4,
          backgroundImage: `
            radial-gradient(${companyTheme.primary}20 1px, transparent 1px),
            radial-gradient(${companyTheme.primary}15 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px, 50px 50px",
          backgroundPosition: "0 0, 25px 25px",
          zIndex: -1,
        }}
      />

      {/* Decorative shapes */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "150px",
          height: "150px",
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          background: `${companyTheme.primary}10`,
          animation: "float 8s ease-in-out infinite",
          zIndex: -1,
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
            "50%": { transform: "translateY(-20px) rotate(5deg)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: "100px",
          height: "100px",
          borderRadius: "63% 37% 54% 46% / 55% 48% 52% 45%",
          background: `${companyTheme.primary}15`,
          animation: "float2 9s ease-in-out infinite",
          zIndex: -1,
          "@keyframes float2": {
            "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
            "50%": { transform: "translateY(20px) rotate(-5deg)" },
          },
        }}
      />

      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Title with animation */}
          <Fade in={true} timeout={1000}>
            <Typography
              variant={isMobile ? "h3" : "h2"}
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: companyTheme.primaryGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textFillColor: "transparent",
                lineHeight: 1.2,
                maxWidth: "800px",
              }}
            >
              {title}
            </Typography>
          </Fade>

          {/* Subtitle with animation */}
          <Fade in={true} timeout={1500}>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 400,
                mb: 5,
                maxWidth: "700px",
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              {subtitle}
            </Typography>
          </Fade>

          {/* Hero search bar */}
          <Fade in={true} timeout={1800}>
            <Paper
              component="form"
              onSubmit={handleSearchSubmit}
              elevation={5}
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                maxWidth: "650px",
                p: "6px",
                mb: 4,
                borderRadius: "50px",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                },
              }}
            >
              <IconButton sx={{ p: "10px" }} aria-label="search">
                <Search />
              </IconButton>
              <TextField
                fullWidth
                placeholder="Search jobs, skills, or keywords..."
                variant="standard"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: "1.1rem", pl: 1 },
                }}
                disabled={isLoading}
              />
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isLoading || !searchValue.trim()}
                sx={{
                  background: companyTheme.primaryGradient,
                  borderRadius: "50px",
                  px: 3,
                  py: 1.2,
                  whiteSpace: "nowrap",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  },
                }}
                endIcon={<ArrowForward />}
              >
                Find Jobs
              </Button>
            </Paper>
          </Fade>

          {/* Popular searches */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
              gap: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Popular Searches
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent="center"
              sx={{ gap: 1 }}
            >
              {popularSearches.map((keyword, index) => (
                <Zoom
                  in={true}
                  style={{
                    transitionDelay: `${
                      animationDelays[index % animationDelays.length]
                    }ms`,
                  }}
                  key={keyword}
                >
                  <Chip
                    clickable
                    label={keyword}
                    color="default"
                    variant="outlined"
                    onClick={() => handleQuickSearch(keyword)}
                    icon={
                      index % 3 === 0 ? (
                        <TrendingUp fontSize="small" />
                      ) : index % 3 === 1 ? (
                        <LocalActivity fontSize="small" />
                      ) : (
                        <Work fontSize="small" />
                      )
                    }
                    sx={{
                      borderRadius: "50px",
                      px: 0.5,
                      backgroundColor: "rgba(255,255,255,0.7)",
                      backdropFilter: "blur(4px)",
                      borderColor: "rgba(0,0,0,0.1)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.9)",
                        borderColor: companyTheme.primary,
                      },
                    }}
                  />
                </Zoom>
              ))}
            </Stack>
          </Box>

          {/* Featured categories */}
          {popularCategories.length > 0 && (
            <Box
              sx={{
                mt: 4,
                width: "100%",
                maxWidth: "800px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Fade in={true} timeout={2500}>
                <Stack spacing={3}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <BusinessCenter fontSize="small" />
                    Featured Categories
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      justifyContent: "center",
                    }}
                  >
                    {popularCategories.slice(0, 6).map((category, index) => (
                      <Zoom
                        in={true}
                        style={{
                          transitionDelay: `${
                            300 +
                            animationDelays[index % animationDelays.length]
                          }ms`,
                        }}
                        key={category.id}
                      >
                        <Paper
                          elevation={2}
                          sx={{
                            px: 3,
                            py: 2,
                            borderRadius: 2,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            transition: "all 0.2s",
                            "&:hover": {
                              transform: "translateY(-3px)",
                              boxShadow: 3,
                              "& .MuiSvgIcon-root": {
                                color: companyTheme.primary,
                              },
                            },
                          }}
                          onClick={() => {
                            console.log(
                              "Category selected:",
                              category.name,
                              "ID:",
                              category.id
                            );
                            if (onSearch) onSearch(`category:${category.id}`);
                          }}
                        >
                          <BusinessCenter
                            className="MuiSvgIcon-root"
                            sx={{
                              color: "text.secondary",
                              transition: "color 0.2s",
                            }}
                          />
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {category.name}
                          </Typography>
                        </Paper>
                      </Zoom>
                    ))}
                  </Box>
                </Stack>
              </Fade>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default JobsHero;
