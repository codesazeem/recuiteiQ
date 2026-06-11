# RecruitIQ

A Next.js app for centralized recruitment management with MongoDB Atlas and AI-powered CV extraction.

## Quick Start

1. **Setup Environment**
   ```bash
   cp .env.local.example .env
   ```

2. **Add Your Credentials**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `OPENAI_API_KEY`: Your OpenAI API key (get one at https://platform.openai.com/api-keys)

3. **Install & Run**
   ```bash
   npm install
   npm run dev
   ```

4. **Access the App**
   - Homepage: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard
   - Add Candidate: http://localhost:3000/dashboard/candidates/add

## Features

### CV Upload & AI Extraction (MVP)
- Upload CVs in PDF or DOCX format
- Automatic extraction of:
  - Candidate Name
  - Email & Phone
  - Key Skills
  - Years of Experience
  - Current Role
- Review & edit extracted data before saving
- Centralized candidate repository

See [CV_UPLOAD_SETUP.md](./CV_UPLOAD_SETUP.md) for detailed setup instructions.

## Project Structure

```
src/
├── lib/
│   ├── mongodb.ts          # MongoDB connection
│   └── fileParser.ts       # PDF/DOCX parsing
├── repositories/
│   └── candidateRepository.ts
├── services/
│   ├── candidateService.ts
│   └── cvExtractionService.ts
└── controllers/
    └── candidateController.ts

app/
├── api/
│   ├── candidates/route.ts
│   └── cv/upload/route.ts
├── dashboard/
│   └── candidates/
│       ├── page.tsx
│       └── add/page.tsx
└── page.tsx

components/
├── CVUpload.tsx
└── CandidateForm.tsx
```

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **UI**: Tailwind CSS + Lucide Icons
- **AI**: OpenAI GPT-4o-mini
- **Validation**: Zod

