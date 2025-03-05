import React from "react";
import { Box, Container, Typography, Button, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1E3A5F 30%, #3B4D61 90%)",
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
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              mb: 2,
            }}
          >
            Welcome to People-ATS
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 4,
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            A modern **Applicant Tracking System (ATS)** to streamline your
            hiring process. Manage job postings, track applications, and engage
            with candidates seamlessly.
          </Typography>

          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #1E3A5F, #294263)",
                }}
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  borderRadius: 2,
                  borderColor: "#1E3A5F",
                  color: "#1E3A5F",
                  "&:hover": {
                    background: "#1E3A5F",
                    color: "#FFFFFF",
                  },
                }}
                onClick={() => navigate("/register")}
              >
                Sign Up
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;
