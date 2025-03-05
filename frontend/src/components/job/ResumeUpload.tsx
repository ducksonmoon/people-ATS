import React from "react";
import { Box, Paper, Typography, Button, alpha, useTheme } from "@mui/material";
import { AttachFile } from "@mui/icons-material";

interface ResumeUploadProps {
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  disabled?: boolean;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  resumeFile,
  setResumeFile,
  fileInputRef,
  disabled = false,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
        cursor: resumeFile || disabled ? "default" : "pointer",
        textAlign: "center",
        mb: 3,
        transition: "all 0.2s ease",
        "&:hover": resumeFile || disabled
          ? {}
          : {
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
            },
      }}
      onClick={() => !resumeFile && !disabled && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setResumeFile(e.target.files[0]);
          }
        }}
        accept=".pdf,.docx"
        disabled={disabled}
      />

      {resumeFile ? (
        <Box>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              color: theme.palette.primary.main,
            }}
          >
            Resume Selected
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mt: 1,
            }}
          >
            <AttachFile fontSize="small" color="primary" />
            <Typography>{resumeFile.name}</Typography>
          </Box>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setResumeFile(null);
            }}
            sx={{ mt: 2 }}
            disabled={disabled}
          >
            Remove
          </Button>
        </Box>
      ) : (
        <Box>
          <AttachFile
            sx={{
              fontSize: 40,
              color: alpha(theme.palette.primary.main, 0.5),
              mb: 1,
            }}
          />
          <Typography sx={{ fontWeight: 500 }}>Upload your resume</Typography>
          <Typography variant="body2" color="text.secondary">
            Drag and drop or click to browse (PDF or DOCX)
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ResumeUpload; 