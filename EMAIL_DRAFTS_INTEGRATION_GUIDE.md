# Email Drafts Integration Guide

This guide will help you integrate the Supabase `email_drafts` table with the Cold Mails page.

## Step 1: Database Setup

First, run the SQL script `create_email_drafts_table.sql` in your Supabase SQL editor to create the table and sample data.

## Step 2: Update ConversationHub.tsx

### 2.1 Add Imports
Add these imports at the top of the file:

```typescript
import { useEffect } from 'react';
import { EmailDraftsService, EmailDraft } from '@/services/emailDraftsService';
```

### 2.2 Add State Variables
Add these state variables after the existing ones:

```typescript
const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([]);
const [selectedEmailDraft, setSelectedEmailDraft] = useState<EmailDraft | null>(null);
const [showEmailDraftModal, setShowEmailDraftModal] = useState(false);
const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
```

### 2.3 Add useEffect for Fetching Drafts
Add this useEffect after the existing state declarations:

```typescript
// Fetch email drafts from Supabase
useEffect(() => {
  const fetchEmailDrafts = async () => {
    setIsLoadingDrafts(true);
    try {
      const drafts = await EmailDraftsService.getEmailDrafts();
      setEmailDrafts(drafts);
    } catch (error) {
      console.error('Error fetching email drafts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email drafts",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDrafts(false);
    }
  };

  fetchEmailDrafts();
}, [toast]);
```

### 2.4 Add Handler Functions
Add these functions after the useEffect:

```typescript
const handleEmailDraftClick = (draft: EmailDraft) => {
  setSelectedEmailDraft(draft);
  setShowEmailDraftModal(true);
};

const handleEmailDraftSendToOutlook = async (draft: EmailDraft) => {
  try {
    // Mark draft as sent
    await EmailDraftsService.markAsSent(draft.id);
    
    // Update local state
    setEmailDrafts(prev => prev.map(d => 
      d.id === draft.id ? { ...d, status: 'sent', delivered_status: 'delivered' } : d
    ));
    
    toast({
      title: "Success",
      description: "Email draft sent to Outlook successfully",
    });
    
    setShowEmailDraftModal(false);
    setSelectedEmailDraft(null);
  } catch (error) {
    console.error('Error sending draft to Outlook:', error);
    toast({
      title: "Error",
      description: "Failed to send draft to Outlook",
      variant: "destructive",
    });
  }
};
```

### 2.5 Update the renderConversationList Function
Replace the existing `renderConversationList` function with this updated version that includes email drafts:

```typescript
const renderConversationList = () => {
  if (activeTab === "article-draft") {
    return (
      <div className="overflow-y-auto h-full">
        {/* Email Drafts Section */}
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Email Drafts from Database</h3>
          {isLoadingDrafts ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading email drafts...</p>
            </div>
          ) : emailDrafts.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No email drafts found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailDrafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => handleEmailDraftClick(draft)}
                  className="p-4 border border-border rounded-lg cursor-pointer hover:bg-card hover:shadow-sm transition-all duration-200 bg-background"
                >
                  <div className="space-y-3">
                    {/* Draft ID */}
                    <div className="flex items-center justify-between">
                      <div className="bg-primary/15 px-3 py-1.5 rounded-lg">
                        <span className="text-sm font-mono font-bold text-primary">DRAFT-{draft.id.slice(0, 8)}</span>
                      </div>
                      <Badge 
                        variant={draft.status === 'draft' ? 'outline' : draft.status === 'sent' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
                      </Badge>
                    </div>
                    
                    {/* Subject */}
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground">{draft.subject}</h3>
                      </div>
                    </div>
                    
                    {/* Recipient */}
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground font-medium">{draft.recipient}</span>
                    </div>
                    
                    {/* Meta Information */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {draft.created_by}
                        </Badge>
                        {draft.replied && (
                          <Badge variant="default" className="text-xs bg-green-500">
                            Replied
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(draft.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Existing Conversations */}
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Mock Conversations</h3>
          {/* Keep your existing filteredConversations.map() here */}
        </div>
      </div>
    );
  }

  // Keep your existing default return statement
};
```

### 2.6 Add the Email Draft Modal
Add this modal at the end of the component, just before the closing `</div>`:

```typescript
{/* Email Draft Modal */}
<Dialog open={showEmailDraftModal} onOpenChange={setShowEmailDraftModal}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-500" />
        Email Draft Review
      </DialogTitle>
    </DialogHeader>
    
    {selectedEmailDraft && (
      <div className="space-y-6">
        {/* Draft Header */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
              <p className="text-lg font-semibold text-foreground">{selectedEmailDraft.subject}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Recipient</Label>
              <p className="text-lg font-medium text-foreground">{selectedEmailDraft.recipient}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge 
                variant={selectedEmailDraft.status === 'draft' ? 'outline' : selectedEmailDraft.status === 'sent' ? 'default' : 'secondary'}
                className="text-sm"
              >
                {selectedEmailDraft.status.charAt(0).toUpperCase() + selectedEmailDraft.status.slice(1)}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
              <p className="text-sm text-foreground">{selectedEmailDraft.created_by}</p>
            </div>
          </div>
        </div>
        
        {/* Email Body */}
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-2">Email Content</Label>
          <div className="bg-muted/30 p-4 rounded-lg border min-h-[300px]">
            <div className="whitespace-pre-wrap text-foreground font-medium">
              {selectedEmailDraft.body}
            </div>
          </div>
        </div>
        
        {/* Meta Information */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Created:</span>
              <span className="ml-2 text-foreground">
                {new Date(selectedEmailDraft.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Delivery Status:</span>
              <span className="ml-2 text-foreground capitalize">
                {selectedEmailDraft.delivered_status}
              </span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Replied:</span>
              <Badge 
                variant={selectedEmailDraft.replied ? 'default' : 'outline'}
                className="ml-2"
              >
                {selectedEmailDraft.replied ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => setShowEmailDraftModal(false)}
          >
            Close
          </Button>
          {selectedEmailDraft.status === 'draft' && (
            <Button 
              onClick={() => handleEmailDraftSendToOutlook(selectedEmailDraft)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Send to Outlook
            </Button>
          )}
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
```

## Step 3: Test the Integration

1. Make sure your Supabase connection is working
2. Navigate to the Cold Mails page
3. You should see the "Email Drafts from Database" section above the mock conversations
4. Click on any email draft to open the review modal
5. Use the "Send to Outlook" button to mark drafts as sent

## Features Included

- ✅ Display email drafts from Supabase database
- ✅ Click to review draft content
- ✅ Send drafts to Outlook (updates status)
- ✅ Loading states and error handling
- ✅ Responsive design with proper styling
- ✅ Integration with existing toast notifications

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify your Supabase connection in `src/lib/supabase.ts`
3. Ensure the `email_drafts` table exists in your database
4. Check that RLS policies are properly configured
5. Verify the `EmailDraftsService` is imported correctly

The integration will display email drafts from your Supabase database and allow users to review them before sending to Outlook, with proper status tracking and user feedback.
