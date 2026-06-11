# CV Upload & AI Extraction Feature Setup

## Overview
This feature enables users to upload CVs (PDF or DOCX) and automatically extract candidate information using OpenAI's GPT-4 model.

## Required Setup

### 1. OpenAI API Key
You need an OpenAI API key to enable CV extraction.

**Steps:**
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in to your OpenAI account
3. Create a new API key
4. Copy the key

**Add to `.env`:**
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
```

### 2. Environment Configuration
Your `.env` file should contain:
```
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-proj-...
```

### 3. Install Dependencies
All required packages are already installed:
- `pdf-parse` - Extract text from PDFs
- `pdfjs-dist` - PDF rendering
- `docx` - DOCX file support
- `openai` - OpenAI API client

## How It Works

### Upload Flow
1. User navigates to `/dashboard/candidates/add`
2. User uploads a PDF or DOCX file
3. System extracts text from the file
4. OpenAI API processes the text to extract:
   - First Name
   - Last Name
   - Email
   - Phone Number
   - Current Role
   - Years of Experience
   - Key Skills (array)

5. User reviews the extracted data
6. User confirms or edits the information
7. Candidate is saved to MongoDB

### API Endpoints

#### Upload & Extract
**POST** `/api/cv/upload`
- Accept: multipart/form-data with `cv` file
- Returns: Extracted candidate JSON

```json
{
  "success": true,
  "candidate": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1 (555) 123-4567",
    "currentRole": "Senior Software Engineer",
    "yearsOfExperience": 8,
    "skills": ["JavaScript", "React", "Node.js", "MongoDB"]
  },
  "rawText": "..."
}
```

#### Create Candidate
**POST** `/api/candidates`
- Content-Type: application/json
- Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "currentRole": "Senior Software Engineer",
  "status": "lead",
  "tags": ["JavaScript", "React", "Node.js"],
  "summary": "..."
}
```

#### List Candidates
**GET** `/api/candidates`
- Returns: Array of all candidates

## File Constraints
- **Format**: PDF or DOCX only
- **Size**: Max 10MB
- **Content**: Must contain readable text

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "OPENAI_API_KEY is not defined" | Missing env variable | Add key to `.env` |
| "Invalid file type" | Wrong file format | Upload PDF or DOCX |
| "File size exceeds 10MB" | File too large | Compress or split CV |
| "Could not extract text" | Unreadable PDF (scanned image) | Ensure CV is text-based |
| "Failed to extract candidate info" | OpenAI API error | Check API key validity |

## Testing

### Test Upload Locally
```bash
npm run dev
# Navigate to http://localhost:3000/dashboard/candidates/add
# Upload a sample CV in PDF or DOCX format
```

### Test via curl
```bash
curl -X POST http://localhost:3000/api/cv/upload \
  -F "cv=@path/to/resume.pdf"
```

## Cost Implications
OpenAI API charges per token. Each CV extraction costs approximately **$0.0001** using GPT-4o mini.

- Average CV: ~300-500 tokens
- Monthly cost estimate: $5-20 (depending on volume)

## Troubleshooting

### CV upload fails silently
- Check browser console for errors
- Verify API key in `.env` is correct
- Check server logs for API errors

### Extracted data is incomplete
- Ensure CV contains all required fields
- Try re-uploading in a different format (PDF vs DOCX)
- Manually edit fields in the form

### "Could not extract text from file"
- CV might be image-based (scanned document)
- Convert scanned PDF to OCR format
- Ensure PDF/DOCX is not corrupted

## Next Steps
- [ ] Add duplicate candidate detection
- [ ] Store CV file in cloud storage (S3, Cloudinary)
- [ ] Add OCR support for scanned documents
- [ ] Batch upload multiple CVs
