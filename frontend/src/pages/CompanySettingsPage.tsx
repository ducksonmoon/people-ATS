import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  FormControlLabel,
  Switch,
  Slider,
  InputAdornment,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import {
  fetchCompanySettings,
  updateCompanySettings,
  CompanySettings,
} from "../redux/companySettingsSlice";
import { Link } from "react-router-dom";
import { useCompanyTheme } from "../hooks/useCompanyTheme";

const CompanySettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, loading, error } = useSelector(
    (state: RootState) => state.companySettings
  );
  const [localSettings, setLocalSettings] = useState<CompanySettings | null>(
    null
  );
  const [success, setSuccess] = useState<string>("");
  const companyTheme = useCompanyTheme();

  useEffect(() => {
    if (!settings) {
      dispatch(fetchCompanySettings());
    }
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (localSettings) {
      setLocalSettings({ ...localSettings, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    try {
      if (localSettings) {
        const resultAction = await dispatch(
          updateCompanySettings(localSettings)
        );
        if (updateCompanySettings.fulfilled.match(resultAction)) {
          setSuccess("Settings updated successfully.");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !localSettings) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress color="primary" />
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          companyTheme.primaryBackground ||
          "linear-gradient(135deg, #1E3A5F 30%, #3B4D61 90%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={8}
          sx={{
            p: 5,
            borderRadius: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, #F4F4F6, #FFFFFF)",
            boxShadow: "0px 6px 24px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: companyTheme.primary || "primary.main",
              mb: 3,
            }}
          >
            Company Settings
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 2 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Company Name"
                  name="companyName"
                  variant="outlined"
                  fullWidth
                  required
                  value={localSettings?.companyName || ""}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Industry"
                  name="industry"
                  variant="outlined"
                  fullWidth
                  value={localSettings?.industry || ""}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Website"
                  name="website"
                  variant="outlined"
                  fullWidth
                  value={localSettings?.website || ""}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Company Description"
                  name="description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={localSettings?.description || ""}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Logo URL"
                  name="logoUrl"
                  variant="outlined"
                  fullWidth
                  value={localSettings?.logoUrl || ""}
                  onChange={handleInputChange}
                  helperText="Optional: URL to your company logo"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Primary Color"
                  name="primaryColor"
                  variant="outlined"
                  fullWidth
                  value={localSettings?.primaryColor || ""}
                  onChange={handleInputChange}
                  helperText="Enter a hex code (e.g., #1E3A5F)"
                />
                <Box sx={{ mt: 1, textAlign: "left" }}>
                  <Button
                    component={Link}
                    to="/theme-preview"
                    variant="text"
                    size="small"
                    sx={{
                      pl: 0,
                      color: companyTheme.primary,
                      "&:hover": {
                        backgroundColor: "transparent",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Preview Theme Colors
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  variant="outlined"
                  fullWidth
                  value={localSettings?.contactEmail || ""}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ textAlign: "left", mb: 1 }}
                >
                  Default Growth Rate for Hiring Goals
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <Slider
                      value={(localSettings?.growthRate || 0.1) * 100}
                      onChange={(_, newValue) =>
                        setLocalSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                growthRate: (newValue as number) / 100,
                              }
                            : null
                        )
                      }
                      aria-labelledby="growth-rate-slider"
                      valueLabelDisplay="auto"
                      step={1}
                      min={1}
                      max={100}
                      valueLabelFormat={(value) => `${value}%`}
                      sx={{ color: companyTheme.primary }}
                    />
                  </Box>
                  <TextField
                    value={(localSettings?.growthRate || 0.1) * 100}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= 100) {
                        setLocalSettings((prev) =>
                          prev ? { ...prev, growthRate: value / 100 } : null
                        );
                      }
                    }}
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    inputProps={{ min: 1, max: 100 }}
                    sx={{ width: 100 }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "left", mb: 2 }}
                >
                  This rate is used to calculate target headcount for department
                  hiring goals
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings?.showNameInNav ?? true}
                      onChange={(e) =>
                        setLocalSettings((prev) =>
                          prev
                            ? { ...prev, showNameInNav: e.target.checked }
                            : null
                        )
                      }
                      name="showNameInNav"
                    />
                  }
                  label="Show Company Name in Navigation Bar"
                  sx={{
                    display: "block",
                    textAlign: "left",
                    ml: 0,
                    mb: 1,
                  }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "left", pl: 1 }}
                >
                  When disabled, only the logo will be shown in the navigation
                  bar
                </Typography>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: "bold",
                borderRadius: 2,
                background:
                  companyTheme.primaryGradient ||
                  "linear-gradient(135deg, #1E3A5F, #294263)",
                color: companyTheme.contrastText || "white",
              }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CompanySettingsPage;
