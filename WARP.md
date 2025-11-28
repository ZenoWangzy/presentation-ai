# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is **ALLWEONE? AI Presentation Generator** - an open-source, AI-powered presentation generator inspired by Gamma.app. It creates beautiful, customizable slides in minutes using AI content generation and a rich text editor.

**Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma (PostgreSQL), Plate Editor, Radix UI, NextAuth.js

## Development Commands

### Package Manager
This project uses **pnpm** as the package manager (v10.17.0).

```bash
# Install dependencies
pnpm install

# Development server with Turbo
pnpm dev

# Production build with Turbo
pnpm build

# Start production server
pnpm start
```

### Code Quality

```bash
# Lint code (using Biome)
pnpm lint
pnpm lint:fix

# Check code formatting and style (using Biome)
pnpm check
pnpm check:fix

# Type check without emitting
pnpm type
```

### Database Operations

```bash
# Push schema changes to database
pnpm db:push

# Open Prisma Studio
pnpm db:studio

# Generate Prisma client (runs automatically on install)
pnpm postinstall
```

## Core Architecture

### Presentation Generation Workflow
1. **User Input** �� Dashboard form with topic, slides count, language, style preferences
2. **Outline Generation** �� AI creates structured outline (with optional web search)
3. **Theme Selection** �� User chooses from 9 built-in themes or creates custom theme
4. **Content Generation** �� AI generates slides with text, images, and layout
5. **Real-time Editing** �� Plate Editor for rich text editing and customization
6. **Export/Present** �� Present mode or export to PowerPoint

### State Management Architecture
- **Central State**: `src/states/presentation-state.ts` using Zustand
- **Key States**: Generation status, slides data, theme config, UI state
- **Persistence**: Auto-save via Prisma to PostgreSQL

### Editor System (Plate Editor)
- **Base Kit**: `src/components/plate/editor-kit.tsx` - Main editor configuration
- **Custom Elements**: `src/components/presentation/editor/custom-elements/` - Presentation-specific components
- **Plugins**: Modular system for text formatting, images, tables, etc.
- **DND System**: `src/components/presentation/editor/dnd/` - Drag-and-drop functionality

### Theme System
- **Built-in Themes**: 9 predefined themes in `src/lib/presentation/themes`
- **Custom Themes**: User-created themes stored in database with full customization
- **Theme Creator**: `src/components/presentation/theme/ThemeCreator.tsx`
- **Theme Properties**: Colors, fonts, layouts stored as JSON in database

### AI Integration
- **Text Generation**: OpenAI API, Ollama, or LM Studio for local models
- **Image Generation**: Together AI, FLUX models for slide images
- **Web Search**: Tavily API for research-enhanced content
- **Model Selection**: Dynamic provider switching (OpenAI/Ollama/LM Studio)

### Database Schema (Prisma)
- **BaseDocument**: Generic document container
- **Presentation**: Slides content, theme, generation settings
- **CustomTheme**: User-created themes
- **User**: Authentication and user data
- **GeneratedImage**: AI-generated image tracking

## Key File Locations

### Core Application
- `src/app/` - Next.js App Router structure
- `src/app/presentation/` - Main presentation routes
- `src/components/presentation/` - Presentation-specific components
- `src/states/presentation-state.ts` - Central state management

### Editor Components
- `src/components/plate/` - Plate Editor configuration and plugins
- `src/components/presentation/editor/` - Presentation editor customizations
- `src/components/presentation/editor/custom-elements/` - Custom slide elements

### AI and Generation
- `src/app/api/presentation/generate/` - Generation API endpoints
- `src/app/_actions/presentation/` - Server actions for presentations
- `src/app/_actions/image/` - Image generation actions

## Environment Setup

Required environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection
- `OPENAI_API_KEY` - For AI content generation
- `TOGETHER_AI_API_KEY` - For AI image generation
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` - Authentication
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth
- `UPLOADTHING_TOKEN` - File uploads
- `UNSPLASH_ACCESS_KEY` - Stock images
- `TAVILY_API_KEY` - Web search

## Development Notes

### Local AI Models
Supports both Ollama and LM Studio for local model inference:
- Models appear automatically in Model Selector when services are running
- LM Studio requires CORS enabled
- Configured in presentation state with dynamic provider switching

### Code Style
- Uses **Biome** for linting and formatting (replaces ESLint/Prettier)
- TypeScript with strict mode enabled
- Tailwind CSS for styling with custom design system
- Component organization follows feature-based structure

### Testing
Currently no automated tests are implemented (marked as roadmap item).

### Key Patterns
- Server Actions for database operations
- React Query for data fetching and caching
- Zustand for client state management
- Streaming responses for AI generation
- Real-time updates during slide generation
