import React from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import {
  Box,
  Paper,
  Typography,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import CodeIcon from '@mui/icons-material/Code';
import TitleIcon from '@mui/icons-material/Title';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const JOB_TEMPLATES = [
  { 
    id: 'software-engineer', 
    name: 'Software Engineer', 
    template: `## About the Role

We're looking for a skilled Software Engineer to join our team.

## Responsibilities
- Design and develop high-quality software solutions
- Collaborate with cross-functional teams
- Write clean, maintainable code

## Requirements
- Bachelor's degree in Computer Science or similar field
- 3+ years of experience in software development
- Proficiency in [programming language]

## Benefits
- Competitive salary
- Remote work options
- Professional development opportunities` 
  },
  { 
    id: 'marketing-manager', 
    name: 'Marketing Manager', 
    template: `## About the Role

We're seeking a creative Marketing Manager to lead our marketing efforts.

## Responsibilities
- Develop and implement marketing strategies
- Manage social media presence
- Analyze campaign performance

## Requirements
- Bachelor's degree in Marketing or related field
- 4+ years of marketing experience
- Strong analytical and communication skills

## Benefits
- Competitive compensation
- Health insurance
- Flexible work hours` 
  },
  { 
    id: 'product-manager', 
    name: 'Product Manager',
    template: `## About the Role

We're looking for a strategic Product Manager to drive our product vision.

## Responsibilities
- Define product strategy and roadmap
- Work with engineering to deliver features
- Analyze market trends and user feedback

## Requirements
- Bachelor's degree in Business or relevant field
- 3+ years in product management
- Experience with agile methodologies

## Benefits
- Competitive salary
- Stock options
- Remote-friendly environment` 
  },
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Write a detailed job description...',
  maxLength = 5000,
}) => {
  const [selectedTemplate, setSelectedTemplate] = React.useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!editor) return;
    
    const template = JOB_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      editor.commands.setContent(template.template);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="space-between" 
        spacing={2} 
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" color="primary">
          Job Description
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="template-select-label">Apply Template</InputLabel>
          <Select
            labelId="template-select-label"
            value={selectedTemplate}
            label="Apply Template"
            onChange={(e) => applyTemplate(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {JOB_TEMPLATES.map((template) => (
              <MenuItem key={template.id} value={template.id}>
                {template.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Paper
        elevation={3}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 1,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <ToggleButtonGroup size="small" aria-label="Text formatting">
            <ToggleButton
              value="bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
              selected={editor.isActive('bold')}
              aria-label="bold"
            >
              <FormatBoldIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton
              value="italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              selected={editor.isActive('italic')}
              aria-label="italic"
            >
              <FormatItalicIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup size="small" aria-label="List formatting">
            <ToggleButton
              value="bulletList"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              selected={editor.isActive('bulletList')}
              aria-label="bullet list"
            >
              <FormatListBulletedIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton
              value="orderedList"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              selected={editor.isActive('orderedList')}
              aria-label="ordered list"
            >
              <FormatListNumberedIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup size="small" aria-label="Headings">
            <ToggleButton
              value="h2"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              selected={editor.isActive('heading', { level: 2 })}
              aria-label="heading 2"
            >
              <TitleIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup size="small" aria-label="Other formatting">
            <ToggleButton
              value="link"
              onClick={() => {
                const url = prompt('URL')
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run()
                }
              }}
              selected={editor.isActive('link')}
              aria-label="link"
            >
              <InsertLinkIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton
              value="code"
              onClick={() => editor.chain().focus().toggleCode().run()}
              selected={editor.isActive('code')}
              aria-label="code"
            >
              <CodeIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ marginLeft: 'auto' }}>
            <Tooltip title="Writing Tips: Use clear headings (Responsibilities, Requirements, Benefits), include specifics about the role, and keep sentences concise.">
              <IconButton size="small" color="info">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box 
          sx={{ 
            minHeight: 300, 
            p: 2,
            '& .ProseMirror': {
              outline: 'none', 
              height: '100%', 
              minHeight: 300,
              fontFamily: 'inherit',
              fontSize: '1rem',
              lineHeight: 1.6,
              '& p': { mb: 1 },
              '& h2': { mt: 2, mb: 1, fontWeight: 600 },
              '& ul, & ol': { pl: 3, mb: 1 },
            }
          }}
        >
          <EditorContent editor={editor} />
        </Box>

        <Divider />
        
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Chip 
            label={`${editor.storage.characterCount.characters()}/${maxLength} characters`}
            size="small"
            color={editor.storage.characterCount.characters() > maxLength ? "error" : "default"}
          />
          
          {editor.storage.characterCount.characters() < 200 && (
            <Typography variant="caption" color="error">
              Job descriptions under 200 characters may not be effective.
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default RichTextEditor; 