import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  useTheme,
  alpha,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import ResumeUpload from "./ResumeUpload";
import API from "../../services/api";

interface ApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  jobId: number;
  jobTitle: string;
  companyName: string;
  userId?: number;
}

const ApplicationDialog: React.FC<ApplicationDialogProps> = ({
  open,
  onClose,
  jobId,
  jobTitle,
  companyName,
  userId,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [applicationNote, setApplicationNote] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Validate form
    if (!resumeFile) {
      setSubmitError("Please upload your resume");
      return;
    }

    if (!userId && (!name || !email)) {
      setSubmitError("Please provide your name and email");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("jobId", jobId.toString());

      if (userId) {
        formData.append("applicantId", userId.toString());
      } else {
        formData.append("name", name);
        formData.append("email", email);
        formData.append("phone", phone);
      }

      formData.append("note", applicationNote);

      if (includeCoverLetter && coverLetter) {
        formData.append("coverLetter", coverLetter);
      }

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await API.post("/applications/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Store the application ID for guest users to track their application
      if (!userId && response.data.id) {
        localStorage.setItem(
          "applicationUuids",
          JSON.stringify([
            ...JSON.parse(localStorage.getItem("applicationUuids") || "[]"),
            {
              jobId: jobId,
              applicationId: response.data.id,
              timestamp: new Date().toISOString(),
            },
          ])
        );
      }

      setSubmitSuccess("Application submitted successfully!");
      resetForm();

      setTimeout(() => {
        onClose();
        setSubmitSuccess(null);
      }, 2000);
    } catch (err) {
      console.error("Error submitting application:", err);
      // Show more specific error messages
      if (err.response) {
        if (err.response.status === 400) {
          setSubmitError(
            err.response.data.message ||
              "Invalid application data. Please check your information."
          );
        } else if (err.response.status === 413) {
          setSubmitError(
            "Your resume file is too large. Please upload a smaller file (max 5MB)."
          );
        } else if (err.response.status === 415) {
          setSubmitError(
            "Unsupported file type. Please upload a PDF or DOCX file."
          );
        } else {
          setSubmitError(
            `Server error: ${
              err.response.data.message || "Please try again later."
            }`
          );
        }
      } else {
        setSubmitError(
          "Failed to submit application. Please check your network connection and try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setApplicationNote("");
    setResumeFile(null);
    setIncludeCoverLetter(false);
    setCoverLetter("");
  };

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: theme.palette.primary.main }}
        >
          Apply for: {jobTitle}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          at {companyName}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {submitSuccess ? (
          <Alert
            severity="success"
            variant="filled"
            sx={{
              my: 3,
              py: 2,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography variant="body1">{submitSuccess}</Typography>
          </Alert>
        ) : (
          <>
            {submitError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {submitError}
              </Alert>
            )}

            <Typography sx={{ mb: 3, mt: 1 }}>
              Complete the form below to submit your application.
            </Typography>

            {!userId && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                  Your Information
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Full Name"
                    required
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={submitting}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />
                  <TextField
                    label="Email"
                    required
                    fullWidth
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />
                  <TextField
                    label="Phone (Optional)"
                    fullWidth
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={submitting}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Resume
            </Typography>
            <ResumeUpload
              resumeFile={resumeFile}
              setResumeFile={setResumeFile}
              fileInputRef={fileInputRef}
              disabled={submitting}
            />

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Additional Information
            </Typography>
            <TextField
              label="Why are you interested in this position?"
              multiline
              rows={3}
              fullWidth
              value={applicationNote}
              onChange={(e) => setApplicationNote(e.target.value)}
              placeholder="Briefly introduce yourself and explain why you're interested in this role..."
              sx={{ mb: 3 }}
              disabled={submitting}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={includeCoverLetter}
                  onChange={(e) => setIncludeCoverLetter(e.target.checked)}
                  disabled={submitting}
                  color="primary"
                />
              }
              label="Include a cover letter"
              sx={{ mb: 2 }}
            />

            {includeCoverLetter && (
              <TextField
                label="Cover Letter"
                multiline
                rows={6}
                fullWidth
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write a detailed cover letter explaining your qualifications, experience, and why you're a good fit for this position..."
                sx={{ mb: 3 }}
                disabled={submitting}
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 2 },
                }}
              />
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={() => {
            onClose();
            if (!submitSuccess) resetForm();
          }}
          disabled={submitting}
          size="large"
          sx={{ px: 3 }}
        >
          {submitSuccess ? "Close" : "Cancel"}
        </Button>
        {!submitSuccess && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            size="large"
            sx={{
              ml: 1,
              px: 4,
              py: 1.2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              borderRadius: 2,
            }}
            startIcon={
              submitting ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationDialog;
