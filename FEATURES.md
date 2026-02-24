# CaseTrack - Advocate Case Management System

## Overview
CaseTrack is a comprehensive, professional case management application designed specifically for legal advocates. It combines case tracking, hearing date management, and document organization in an elegant, easy-to-use interface.

## Key Features

### 1. **Professional User Interface**
- **Background Images**: Professional advocate, courthouse, case files, and legal consultation images throughout the app
- **Modern Design**: Clean, professional aesthetic with a blue color scheme appropriate for the legal industry
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Hero Header**: Stunning courthouse background with branded header on the dashboard

### 2. **Authentication System**
- **Secure Login/Registration**: Each advocate has their own account
- **Email-based Authentication**: Simple email and password login
- **Persistent Sessions**: User data persists across browser sessions

### 3. **Case Management**
- **Create New Cases**: Add cases with:
  - Client name
  - Case number
  - Court name
  - Case status (Active/Closed)
  - Case-level notes
  - Multiple hearing dates
  - Document and photo attachments

### 4. **File & Document Management** ⭐ NEW FEATURE
- **Drag & Drop Upload**: Simply drag files onto the upload area or click to browse
- **Multiple File Types**: Support for images, PDFs, documents, and more
- **Base64 Encoding**: Files stored directly in browser's localStorage (up to 5-10MB)
- **File Preview**: View thumbnails for images and manage all files
- **Download & Delete**: Download files or remove them as needed
- **File Indicators**: Quick visual indicator showing number of files attached to a case

### 5. **Multiple View Modes**

#### Dashboard View
- All cases sorted by next upcoming hearing date
- Quick stats showing total cases, active cases, and today's hearings
- Status filter (All/Active/Closed)
- Search functionality

#### Today's Hearings
- Displays all cases with hearings scheduled for today
- Color-coded indicators to highlight today's cases

#### Next 7 Days View
- Shows all hearings within the next week
- Organized chronologically
- Quick access to cases with upcoming hearings

#### Calendar View
- Monthly calendar grid showing all hearing dates
- Navigate between months
- Visual representation of hearing distribution

#### Timeline View
- Chronological view of all hearing dates
- Shows case and client details for each hearing
- Useful for long-term planning

### 6. **Search & Filtering**
- **Advanced Search**: Search by:
  - Client name
  - Case number
  - Court name
- **Status Filter**: Filter between Active and Closed cases
- **Real-time Results**: Instant filtering as you type

### 7. **Case Details & Notes**
- **Case-Level Notes**: Add overall case notes and reminders
- **Hearing-Specific Notes**: Add notes to individual hearing dates
- **Comprehensive Timeline**: View all hearings chronologically
- **Edit Capabilities**: Update notes and hearing dates anytime

## How to Use

### Creating a New Case with Files

1. **Click "New Case" Button** - Available in the top navigation
2. **Fill in Case Details**:
   - Enter client name
   - Enter case number
   - Select court name
   - Choose status (Active/Closed)
   - Add case notes

3. **Add Hearing Dates**:
   - Click "Add Date" button
   - Select the hearing date
   - Optionally add hearing time
   - Click "Add" to add more dates

4. **Upload Case Files** (NEW!):
   - Scroll to "Case Documents & Photos" section
   - Drag and drop files OR click "browse files"
   - Add images, PDFs, or documents (max 5MB each)
   - Files appear immediately in the list

5. **Submit Case** - Click "Create Case" to save

### Managing Files in Existing Cases

1. **Open Case Details** - Click on any case card
2. **Scroll to "Case Files & Documents"** section
3. **Add More Files**:
   - Use the upload area to add additional documents
   - Files are stored with the case

4. **View/Download Files**:
   - Click image icon to view full-size images
   - Click file icon to download
   - Click X to delete

### Viewing and Organizing Cases

- **All Cases**: Default view showing all cases sorted by next hearing
- **Today's Hearings**: Focus on what's happening today
- **Next 7 Days**: Plan ahead with upcoming hearings
- **Calendar**: Visual overview of hearing schedule
- **Timeline**: Detailed chronological view

## Technical Details

### Data Storage
- **Browser localStorage**: All data stored locally in your browser
- **Base64 Encoding**: Files converted to text format for localStorage compatibility
- **User Segregation**: Each user has separate case storage

### File Handling
- Maximum file size: 5MB
- Supported types: Images (PNG, JPG, etc.), PDFs, documents
- Automatic file size formatting (B, KB, MB)
- Timestamp tracking for uploads

### Design Features
- **Professional Color Scheme**: Deep blue primary color with light neutrals
- **Accessibility**: Proper contrast ratios and ARIA labels
- **Responsive**: Mobile-first design that scales to desktop
- **Performance**: Optimized for fast loading and smooth interactions

## Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Tips & Best Practices

1. **File Organization**: Organize case documents logically with clear file names
2. **Regular Notes**: Keep hearing notes updated for future reference
3. **Archive Closed Cases**: Mark cases as "Closed" to filter them out from active views
4. **Backup Important Docs**: Consider backing up important files as localStorage has size limits
5. **Search Frequently**: Use search to quickly locate cases by client or case number

## Storage Considerations
- Average localStorage limit: 5-10MB per browser
- Files are stored as base64, increasing size by ~33%
- Recommendation: Keep high-res images to a reasonable number per case
- Total storage = All user cases + all files

## Upcoming Enhancements
- Cloud storage integration for unlimited file storage
- Email notifications for upcoming hearings
- Case collaboration features
- Export to PDF functionality
