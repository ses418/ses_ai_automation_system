# Conversation Hub Newsletter System

A comprehensive newsletter management system built with React, TypeScript, and Supabase, featuring campaign creation, timeline management, and newsletter review workflows.

## Features

### 1. Campaign Creation
- **Campaign Name**: Text input for campaign identification
- **Date Range**: Start and end date pickers
- **Targeted Industry**: Multi-select dropdown with predefined industries
- **Email Group**: Multi-select dropdown for audience segmentation
- **Email IDs**: Multi-email input field for direct recipients
- **Frequency**: Dropdown for scheduling (Now, After 1 week, After 2 weeks, etc.)

### 2. Timeline Management
- **Webhook Integration**: Automatic timeline generation via n8n webhook
- **Editable Schedule**: Modify newsletter types for each scheduled date
- **Type Selection**: Choose from allowed newsletter types (general, industry_specific)
- **Save & Sync**: Update timeline and sync with webhook system

### 3. Newsletter Review & Management
- **Comprehensive Display**: Show all newsletter details in card format
- **Status Tracking**: Monitor approval status and send status
- **Inline Editing**: Edit subject lines directly in the interface
- **Content Preview**: Rendered HTML preview of newsletter content
- **Action Buttons**: Approve/Send to Outlook and Regenerate content

### 4. Search & Filtering
- **Text Search**: Search across subject lines and content
- **Status Filter**: Filter by approval status (approved, pending, rejected)
- **Type Filter**: Filter by newsletter type (general, industry_specific)
- **Real-time Results**: Instant filtering and search results

## Technical Architecture

### Frontend Components
- **React 18** with TypeScript
- **Shadcn/ui** components for consistent UI
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **React Query** for data fetching (optional)

### Backend Integration
- **Supabase** for database operations
- **n8n Webhooks** for external service communication
- **RESTful API** design pattern

### Database Schema
```sql
-- Core tables
newsletters          -- Newsletter content and metadata
campaigns            -- Campaign configuration and settings
campaign_newsletters -- Junction table linking campaigns to newsletters
```

## Setup Instructions

### 1. Database Setup
Run the SQL migration file to create the required tables:

```bash
# Execute the SQL file in your Supabase SQL editor
psql -h your-supabase-host -U your-username -d your-database -f create_newsletters_table.sql
```

### 2. Environment Configuration
Ensure your Supabase configuration is set up in `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. Webhook Configuration
The system uses these webhook endpoints:

- **Campaign Creation**: `https://n8n.sesai.in/webhook/e38ac54e-1dd9-4cd6-8681-0d9cce6ee36d`
- **Newsletter Approval**: `https://n8n.sesai.in/webhook/newsletter/approve`
- **Newsletter Regeneration**: `https://n8n.sesai.in/webhook/newsletter/regenerate`

## Usage Workflow

### Step 1: Create Campaign
1. Navigate to the Newsletter page
2. Fill in campaign details (name, dates, industries, email groups)
3. Submit to generate timeline via webhook
4. System automatically switches to Timeline tab

### Step 2: Edit Timeline
1. Review generated timeline dates
2. Modify newsletter types for each date as needed
3. Save changes to update webhook system
4. System automatically switches to Newsletter Review tab

### Step 3: Manage Newsletters
1. View all newsletters in card format
2. Use search and filters to find specific newsletters
3. Edit subject lines inline
4. Approve newsletters for sending to Outlook
5. Regenerate content when needed

## API Endpoints

### Campaign Management
```typescript
// Create new campaign
POST /webhook/e38ac54e-1dd9-4cd6-8681-0d9cce6ee36d
Body: CampaignData

// Update timeline
POST /webhook/e38ac54e-1dd9-4cd6-8681-0d9cce6ee36d
Body: { timeline, allowed-newsletter-type }
```

### Newsletter Actions
```typescript
// Approve and send newsletter
POST /webhook/newsletter/approve
Body: { newsletter_id: string }

// Regenerate newsletter content
PUT /webhook/newsletter/regenerate
Body: { newsletter_id: string }
```

## Data Models

### CampaignData Interface
```typescript
interface CampaignData {
  campaignName: string;
  startDate: string;
  endDate: string;
  targetedIndustry: string[];
  emailGroup: string[];
  emailIds: string[];
  frequency: string;
}
```

### Newsletter Interface
```typescript
interface Newsletter {
  newsletter_id: string;
  newsletter_type: string;
  subject_line: string;
  full_content: string;
  target_industry: string;
  approvalstatus: "approved" | "pending" | "rejected";
  status: "draft" | "ready" | "sent";
  approved_by: string;
  project_id: string;
  created_at?: string;
  updated_at?: string;
}
```

### TimelineItem Interface
```typescript
interface TimelineItem {
  date: string;
  "newsletter-type": string;
}
```

## Webhook Response Format

### Campaign Creation Response
```json
{
  "output": {
    "timeline": [
      { "date": "2025-09-02", "newsletter-type": "general" },
      { "date": "2025-09-04", "newsletter-type": "industry_specific" }
    ],
    "allowed-newsletter-type": ["general", "industry_specific"]
  }
}
```

## Error Handling

The system includes comprehensive error handling:

- **Network Errors**: Graceful fallback with user-friendly messages
- **Validation Errors**: Form validation with clear error indicators
- **Webhook Failures**: Retry mechanisms and fallback data
- **Database Errors**: Proper error logging and user notification

## Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **Authentication**: Protected routes and user verification

## Performance Optimizations

- **Database Indexes**: Optimized queries for common operations
- **Lazy Loading**: Components load only when needed
- **Debounced Search**: Efficient search with minimal API calls
- **Caching**: Local state management for better UX

## Customization

### Adding New Industries
Modify the `industries` array in `src/pages/Newsletter.tsx`:

```typescript
const industries = [
  "Technology", "Healthcare", "Finance", "Manufacturing", "Retail", 
  "Education", "Real Estate", "Transportation", "Energy", "Construction",
  "Your New Industry" // Add here
];
```

### Adding New Email Groups
Modify the `emailGroups` array:

```typescript
const emailGroups = [
  "VIP Clients", "Enterprise", "SMB", "Startups", "Partners", "Prospects",
  "Your New Group" // Add here
];
```

### Adding New Newsletter Types
1. Update the database schema
2. Modify the `allowedNewsletterTypes` handling
3. Update the type filter options

## Troubleshooting

### Common Issues

1. **Webhook Timeouts**: Check network connectivity and webhook endpoint status
2. **Database Connection**: Verify Supabase credentials and connection
3. **Form Validation**: Ensure all required fields are filled
4. **Permission Errors**: Check RLS policies and user authentication

### Debug Mode
Enable console logging for debugging:

```typescript
// In newsletterService.ts
console.log('Webhook response:', data);
console.log('Database error:', error);
```

## Future Enhancements

- **Email Templates**: Pre-built newsletter templates
- **Analytics Dashboard**: Campaign performance metrics
- **A/B Testing**: Subject line and content testing
- **Automated Scheduling**: Cron-based newsletter sending
- **Integration APIs**: Connect with email marketing platforms
- **Multi-language Support**: Internationalization features

## Support

For technical support or feature requests, please refer to the project documentation or contact the development team.

## License

This project is part of the Conversation Hub system and follows the same licensing terms.
