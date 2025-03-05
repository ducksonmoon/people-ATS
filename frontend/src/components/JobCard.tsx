import React from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  Button,
  Avatar,
  useTheme
} from "@mui/material";
import { LocationOn, Category, CalendarToday } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface JobCardProps {
  id: number;
  title: string;
  description: string;
  company: string;
  companyLogo?: string;
  location: string;
  category: string;
  createdAt: string;
}

const JobCard: React.FC<JobCardProps> = ({
  id,
  title,
  description,
  company,
  companyLogo,
  location,
  category,
  createdAt,
}) => {
  const theme = useTheme();
  
  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };
  
  // Create a short description for preview
  const shortDescription = stripHtml(description).substring(0, 150) + '...';
  
  return (
    <Card 
      sx={{ 
        mb: 3,
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
          {companyLogo ? (
            <Avatar
              src={companyLogo}
              alt={company}
              sx={{ width: 50, height: 50 }}
            />
          ) : (
            <Avatar
              sx={{ 
                width: 50, 
                height: 50, 
                bgcolor: theme.palette.primary.main,
              }}
            >
              {company.charAt(0).toUpperCase()}
            </Avatar>
          )}
          
          <Box>
            <Typography 
              variant="h6" 
              component={RouterLink} 
              to={`/jobs/${id}`}
              sx={{ 
                fontWeight: 600,
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {company}
            </Typography>
          </Box>
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 3 }}
        >
          {shortDescription}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1, 
          mb: 3,
          alignItems: 'center',
        }}>
          <Chip 
            icon={<LocationOn fontSize="small" />} 
            label={location} 
            size="small" 
            sx={{ borderRadius: 1 }}
          />
          <Chip 
            icon={<Category fontSize="small" />} 
            label={category} 
            size="small" 
            sx={{ borderRadius: 1 }}
          />
          <Chip 
            icon={<CalendarToday fontSize="small" />} 
            label={`Posted ${dayjs(createdAt).fromNow()}`} 
            size="small" 
            sx={{ borderRadius: 1 }}
          />
        </Box>
        
        <Button
          component={RouterLink}
          to={`/jobs/${id}`}
          variant="contained"
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: "white",
            borderRadius: 1.5,
            px: 3,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            }
          }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobCard;
