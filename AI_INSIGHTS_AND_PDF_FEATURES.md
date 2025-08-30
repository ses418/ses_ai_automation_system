# AI Insights and PDF Download Features

## Overview
This document describes the new features added to the View Questionnaires modal in the Proposal Maker page:
1. **AI Insights Toggle** - Switch between questionnaire view and AI insights view
2. **PDF Download** - Export the entire modal content as a downloadable PDF

## Features Implemented

### 1. AI Insights Toggle
- **Location**: Top of the View Questionnaires modal
- **Design**: Beautiful gradient toggle with smooth animations
- **Two Views**:
  - **Questionnaire** (Blue gradient) - Shows the original questionnaire form
  - **AI Insights** (Purple-pink gradient) - Shows AI-generated insights

#### AI Insights Sections
- **Clarification Points** (Blue theme)
  - Displays array data as numbered bullet points
  - Each point in a white card with blue accent
  
- **Conversation Starters** (Purple theme)
  - Shows conversation points for client meetings
  - Purple-themed cards with lightbulb icon
  
- **Key Assumptions** (Amber theme)
  - Lists important project assumptions
  - Amber-themed cards with brain icon

#### Data Source
- **Table**: `ai_insights`
- **Columns**: `clarification_points`, `conversation_points`, `assumptions` (all as JSON arrays)
- **Relationship**: Linked by `inquiry_id`

### 2. PDF Download Functionality
- **Button**: Green "Download PDF" button in both views
- **Location**: Left side of action buttons
- **Format**: A4 PDF with automatic page breaks
- **Filename**: `Questionnaire_{inquiry_id}_{date}.pdf`

#### PDF Generation Process
1. Captures modal content using html2canvas
2. Converts to high-quality PNG (2x scale)
3. Creates PDF with proper A4 dimensions
4. Handles content longer than one page
5. Downloads with descriptive filename

#### Technical Details
- **Library**: jsPDF + html2canvas
- **Quality**: High-resolution (2x scale) for crisp text
- **Page Handling**: Automatic pagination for long content
- **Error Handling**: User-friendly error messages and loading states

## Database Setup

### Required Tables
1. **greenfield_prescope_questionnaires** (existing)
   - Stores questionnaire form data
   - All form fields are properly mapped and saved

2. **ai_insights** (new)
   - Created via `create_ai_insights_table.sql`
   - Includes RLS policies and triggers
   - Sample data provided for testing

### Data Persistence
- **Save Questionnaire**: All form changes are stored in `greenfield_prescope_questionnaires`
- **Save AI Insights**: AI insights data is stored in `ai_insights`
- **Real-time Updates**: Changes are immediately synced to Supabase

## User Experience Features

### 1. Pro Tip Banner
- **Appearance**: Animated purple banner in questionnaire view
- **Message**: Suggests users switch to AI Insights
- **Animation**: Subtle pulse effect to draw attention

### 2. Smooth Transitions
- **Duration**: 300ms for all animations
- **Effects**: Hover states, button transitions, view switching
- **Responsive**: Works on all screen sizes

### 3. Loading States
- **PDF Generation**: Shows "Generating PDF" toast
- **Save Operations**: Immediate feedback on success/failure
- **Error Handling**: Clear error messages with retry options

## Installation and Setup

### 1. Install Dependencies
```bash
npm install jspdf html2canvas
```

### 2. Database Setup
```bash
# Run the SQL script in your Supabase project
psql -f create_ai_insights_table.sql
```

### 3. Verify Integration
- Check that the toggle button appears in the modal
- Test PDF download functionality
- Verify data is being saved to both tables

## Usage Instructions

### For Users
1. **Open View Questionnaires**: Click on an approved inquiry
2. **Switch Views**: Use the toggle button to switch between questionnaire and AI insights
3. **Edit Data**: Make changes to any form fields
4. **Save Changes**: Click "Save Questionnaire" or "Save AI Insights"
5. **Download PDF**: Click "Download PDF" to export current view

### For Developers
1. **Data Flow**: Form state → Supabase tables → PDF generation
2. **Error Handling**: Comprehensive try-catch blocks with user feedback
3. **Performance**: Optimized PDF generation with proper scaling
4. **Accessibility**: Proper ARIA labels and keyboard navigation

## Troubleshooting

### Common Issues
1. **PDF Generation Fails**
   - Check browser console for errors
   - Ensure modal content is properly rendered
   - Verify html2canvas compatibility

2. **Data Not Saving**
   - Check Supabase connection
   - Verify table permissions and RLS policies
   - Check browser console for error messages

3. **Toggle Not Working**
   - Verify state management is properly set up
   - Check for JavaScript errors in console
   - Ensure all required components are imported

### Performance Tips
- PDF generation works best with smaller content
- Consider pagination for very long questionnaires
- Test on different devices and screen sizes

## Future Enhancements
- **Template Selection**: Different PDF layouts and styles
- **Batch Export**: Download multiple questionnaires at once
- **Email Integration**: Send PDFs directly via email
- **Custom Branding**: Company logos and styling in PDFs
- **Offline Support**: Generate PDFs without internet connection
