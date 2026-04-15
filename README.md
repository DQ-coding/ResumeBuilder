# ResumeBuilder

Build your resume for free with a modern, intuitive editor.

## Quick Links

- 📦 **Repository**: https://github.com/DQ-coding/ResumeBuilder
- 🚀 **Live Demo**: (Coming soon - Deployed to Vercel)
- 📖 **Documentation**: See [AGENT.md](../AGENT.md) for development guide
- 📋 **Requirements**: See [PRD.md](../PRD.md) for product requirements

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/DQ-coding/ResumeBuilder.git
cd ResumeBuilder/client

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local and add your Supabase credentials

# 4. Start development server
npm run dev
```

Visit http://localhost:5173 in your browser.

## Features (MVP - Phase 1)

- ✅ User authentication (Supabase Auth)
- ✅ Resume management (create, edit, delete)
- ✅ Real-time preview editor
- ✅ High-quality PDF export
- ✅ Avatar upload
- ✅ Public resume sharing
- ✅ 5 core resume sections (basic info, summary, work experience, education, skills)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (Auth + PostgreSQL + Storage)
- **Deployment**: Vercel (frontend) + Supabase (backend)

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Check code quality
- `npm run test` - Run tests
- `npx tsc --noEmit` - Type check

See [AGENT.md](../AGENT.md) for more development guidelines.

## Project Structure

```
client/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── services/      # Supabase API calls
│   ├── store/         # State management (Zustand)
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript type definitions
├── .env.example       # Environment variables template
└── package.json       # Dependencies and scripts
```

## Documentation

- [AGENT.md](../AGENT.md) - AI Agent development guide
- [PRD.md](../PRD.md) - Product requirements with implementation status
- [Architecture.md](../Architecture.md) - Technical architecture evolution
- [GIT.md](../GIT.md) - Git workflow and push requirements

## License

MIT

## Repository

**GitHub**: https://github.com/DQ-coding/ResumeBuilder
