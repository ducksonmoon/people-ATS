import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Divider,
  Paper,
  TextField,
  Avatar,
  Switch,
  FormControlLabel,
  Stack,
  useTheme,
} from "@mui/material";
import useCompanyTheme from "../hooks/useCompanyTheme";
import StyledButton, {
  StyledIconButton,
  StyledFab,
} from "../components/StyledButton";
import StyledCard, {
  StyledCardHeader,
  StyledCardContent,
  StyledCardActions,
} from "../components/StyledCard";
import StyledBadge, {
  StatusBadge,
  PriorityBadge,
} from "../components/StyledBadge";
import {
  LinearProgressWithLabel,
  CircularProgressWithLabel,
} from "../components/StyledProgress";

// Import icons for buttons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import NavigationIcon from "@mui/icons-material/Navigation";

// Sample component to demonstrate theme colors
const ColorSwatch = ({ color, name }: { color: string; name: string }) => (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <Box
      sx={{
        width: 50,
        height: 50,
        borderRadius: 1,
        backgroundColor: color,
        mb: 1,
        border: "1px solid",
        borderColor: "divider",
      }}
    />
    <Typography variant="body2">{name}</Typography>
    <Typography variant="caption">{color}</Typography>
  </Box>
);

const ThemePreviewPage: React.FC = () => {
  const companyTheme = useCompanyTheme();
  const [progress, setProgress] = useState<number>(65);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Company Theme Preview
      </Typography>

      {/* Color Palette Section */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={0} variant="outlined">
        <Typography variant="h6" gutterBottom>
          Company Color Palette
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item>
            <ColorSwatch color={companyTheme.primary} name="Primary" />
          </Grid>
          <Grid item>
            <ColorSwatch
              color={companyTheme.primaryLight}
              name="Primary Light"
            />
          </Grid>
          <Grid item>
            <ColorSwatch color={companyTheme.primaryDark} name="Primary Dark" />
          </Grid>
          <Grid item>
            <ColorSwatch
              color={companyTheme.primaryBackground}
              name="Primary BG (10%)"
            />
          </Grid>
          <Grid item>
            <ColorSwatch
              color={companyTheme.primaryBackgroundHover}
              name="Primary BG (15%)"
            />
          </Grid>
          <Grid item>
            <ColorSwatch
              color={companyTheme.primaryBackgroundActive}
              name="Primary BG (25%)"
            />
          </Grid>
          <Grid item>
            <Box
              sx={{
                background: companyTheme.primaryGradient,
                width: 100,
                height: 50,
                borderRadius: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: companyTheme.contrastText,
              }}
            >
              <Typography variant="caption">Gradient</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Buttons Section */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={0} variant="outlined">
        <Typography variant="h6" gutterBottom>
          Buttons
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Primary Button Variants
          </Typography>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item>
              <StyledButton variant="contained">Contained</StyledButton>
            </Grid>
            <Grid item>
              <StyledButton variant="outlined">Outlined</StyledButton>
            </Grid>
            <Grid item>
              <StyledButton variant="text">Text</StyledButton>
            </Grid>
            <Grid item>
              <StyledButton variant="gradient">Gradient</StyledButton>
            </Grid>
            <Grid item>
              <StyledButton variant="soft">Soft</StyledButton>
            </Grid>
            <Grid item>
              <StyledButton variant="rounded">Rounded</StyledButton>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
            With Elevation Effect
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <StyledButton variant="contained" elevated>
                Elevated
              </StyledButton>
            </Grid>
            <Grid item>
              <StyledButton variant="gradient" elevated>
                Gradient Elevated
              </StyledButton>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Button Sizes
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <StyledButton variant="contained" size="small">
                Small
              </StyledButton>
            </Grid>
            <Grid item>
              <StyledButton variant="contained" size="medium">
                Medium
              </StyledButton>
            </Grid>
            <Grid item>
              <StyledButton variant="contained" size="large">
                Large
              </StyledButton>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Loading State
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <StyledButton variant="contained" loading>
                Loading
              </StyledButton>
            </Grid>
            <Grid item>
              <StyledButton variant="outlined" loading>
                Loading
              </StyledButton>
            </Grid>
            <Grid item>
              <StyledButton variant="gradient" loading>
                Loading
              </StyledButton>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Icon Buttons
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <StyledIconButton color="primary">
                <EditIcon />
              </StyledIconButton>
            </Grid>
            <Grid item>
              <StyledIconButton color="primary" variant="contained">
                <DeleteIcon />
              </StyledIconButton>
            </Grid>
            <Grid item>
              <StyledIconButton color="primary" variant="outlined">
                <SaveIcon />
              </StyledIconButton>
            </Grid>
            <Grid item>
              <StyledIconButton color="primary" variant="soft">
                <SearchIcon />
              </StyledIconButton>
            </Grid>
            <Grid item>
              <StyledIconButton color="error">
                <FavoriteIcon />
              </StyledIconButton>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Floating Action Buttons (FAB)
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <StyledFab color="primary" aria-label="add">
                <AddIcon />
              </StyledFab>
            </Grid>
            <Grid item>
              <StyledFab color="primary" variant="extended">
                <NavigationIcon sx={{ mr: 1 }} />
                Navigate
              </StyledFab>
            </Grid>
            <Grid item>
              <StyledFab color="primary" variant="gradient">
                <AddIcon />
              </StyledFab>
            </Grid>
            <Grid item>
              <StyledFab color="primary" size="small">
                <EditIcon />
              </StyledFab>
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Other Button Colors
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <StyledButton variant="contained" color="secondary">
                Secondary
              </StyledButton>
            </Grid>
            <Grid item>
              <StyledButton variant="contained" color="success">
                Success
              </StyledButton>
            </Grid>
            <Grid item>
              <StyledButton variant="contained" color="error">
                Error
              </StyledButton>
            </Grid>
            <Grid item>
              <StyledButton variant="contained" color="warning">
                Warning
              </StyledButton>
            </Grid>
            <Grid item>
              <StyledButton variant="contained" color="info">
                Info
              </StyledButton>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Cards Section */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={0} variant="outlined">
        <Typography variant="h6" gutterBottom>
          Cards
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <StyledCardHeader
                title="Standard Card"
                subheader="Basic card example"
              />
              <StyledCardContent>
                <Typography variant="body2">
                  This is a basic card with no special styling, but it still
                  uses the company theme colors for interactive elements.
                </Typography>
              </StyledCardContent>
              <StyledCardActions>
                <StyledButton size="small">Action</StyledButton>
                <StyledButton size="small" variant="text">
                  Cancel
                </StyledButton>
              </StyledCardActions>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StyledCard highlighted>
              <StyledCardHeader
                title="Highlighted Card"
                subheader="With left border"
              />
              <StyledCardContent>
                <Typography variant="body2">
                  This card has a left border using the company's primary color,
                  making it stand out as an important element.
                </Typography>
              </StyledCardContent>
              <StyledCardActions>
                <StyledButton size="small">Action</StyledButton>
                <StyledButton size="small" variant="text">
                  Cancel
                </StyledButton>
              </StyledCardActions>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StyledCard outlineColor="primary" hoverEffect>
              <StyledCardHeader
                highlighted
                title="Premium Card"
                subheader="With gradient header"
              />
              <StyledCardContent>
                <Typography variant="body2">
                  This card has a gradient header using company colors, outline,
                  and a hover effect that lifts the card.
                </Typography>
              </StyledCardContent>
              <StyledCardActions>
                <StyledButton size="small">Action</StyledButton>
                <StyledButton size="small" variant="text">
                  Cancel
                </StyledButton>
              </StyledCardActions>
            </StyledCard>
          </Grid>
        </Grid>
      </Paper>

      {/* Badges Section */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={0} variant="outlined">
        <Typography variant="h6" gutterBottom>
          Badges
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Primary Badges
          </Typography>
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <StyledBadge label="Filled" variant="filled" />
            </Grid>
            <Grid item>
              <StyledBadge label="Outlined" variant="outlined" />
            </Grid>
            <Grid item>
              <StyledBadge label="Light" variant="light" />
            </Grid>
            <Grid item>
              <StyledBadge label="Gradient" variant="gradient" />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Status Badges
          </Typography>
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <StatusBadge status="Active" />
            </Grid>
            <Grid item>
              <StatusBadge status="Pending" />
            </Grid>
            <Grid item>
              <StatusBadge status="Rejected" />
            </Grid>
            <Grid item>
              <StatusBadge status="Draft" />
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Priority Badges
          </Typography>
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <PriorityBadge priority="High" />
            </Grid>
            <Grid item>
              <PriorityBadge priority="Medium" />
            </Grid>
            <Grid item>
              <PriorityBadge priority="Low" />
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Progress Section */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={0} variant="outlined">
        <Typography variant="h6" gutterBottom>
          Progress Indicators
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Linear Progress
            </Typography>
            <Box sx={{ mb: 3 }}>
              <LinearProgressWithLabel
                value={progress}
                label="Primary Progress"
                tooltipTitle="Using company primary color"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <LinearProgressWithLabel
                value={progress}
                color="success"
                label="Success Progress"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <LinearProgressWithLabel
                value={progress}
                color="warning"
                label="Warning Progress"
              />
            </Box>
            <Box sx={{ mb: 1 }}>
              <LinearProgressWithLabel
                value={progress}
                color="error"
                label="Error Progress"
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Circular Progress
            </Typography>
            <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <CircularProgressWithLabel
                value={progress}
                size={80}
                label="Primary"
              />
              <CircularProgressWithLabel
                value={progress}
                size={80}
                color="success"
                label="Success"
              />
              <CircularProgressWithLabel
                value={progress}
                size={80}
                color="warning"
                label="Warning"
              />
              <CircularProgressWithLabel
                value={progress}
                size={80}
                color="error"
                label="Error"
              />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Adjust Progress Value
          </Typography>
          <Box sx={{ width: 300 }}>
            <TextField
              type="number"
              label="Progress Value"
              InputProps={{ inputProps: { min: 0, max: 100 } }}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              fullWidth
              margin="normal"
              sx={{ mb: 2 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Other Styled Elements */}
      <Paper sx={{ p: 3 }} elevation={0} variant="outlined">
        <Typography variant="h6" gutterBottom>
          Other Styled Elements
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Avatar with Company Colors
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: companyTheme.primary,
                  color: companyTheme.contrastText,
                }}
              >
                JD
              </Avatar>
              <Avatar
                sx={{
                  bgcolor: companyTheme.primaryLight,
                  color: companyTheme.primary,
                }}
              >
                AB
              </Avatar>
              <Avatar
                sx={{
                  background: companyTheme.primaryGradient,
                  color: companyTheme.contrastText,
                }}
              >
                CK
              </Avatar>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Form Elements
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: companyTheme.primary,
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: companyTheme.primary,
                    },
                  }}
                />
              }
              label="Themed Switch"
            />
            <TextField
              label="Themed Input"
              variant="outlined"
              size="small"
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: companyTheme.primary,
                  },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: companyTheme.primary,
                },
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ThemePreviewPage;
