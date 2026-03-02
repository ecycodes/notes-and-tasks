# Second Brain

A personal productivity app for taking notes and managing tasks, built with React and Supabase.

## Features

**Notes** — Split-view layout with a note list on the left and a rich-text editor on the right. Supports bold, italic, headings, bullet lists, code blocks, blockquotes and more via TipTap. Notes autosave as you type and can be starred or tagged.

**Tasks** — Kanban board with three columns: To Do, In Progress and Done. Cards can be reordered by dragging within a column and moved between columns. Each task has a title, description, priority level and tags.

**Dashboard** — Overview page showing total notes, open tasks and a recent activity section.

**Auth** — Email and password sign-in and sign-up powered by Supabase Auth. All data is scoped to the signed-in user via Row Level Security.

## Tech Stack

- React 18 with TypeScript
- Vite
- Tailwind CSS with shadcn/ui components
- Zustand for state management
- Supabase for database and authentication
- TipTap for rich-text editing
- dnd-kit for drag-and-drop
- Framer Motion for animations
- React Router v6

## Getting Started

Clone the repository and install dependencies.

```
npm install
```

Create a `.env` file in the root and add your Supabase credentials.

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the development server.

```
npm run dev
```

## Database Setup

Create the following tables in your Supabase project.

**notes**

| column | type |
| --- | --- |
| id | uuid, primary key |
| user_id | uuid, references auth.users |
| title | text |
| content | text |
| is_starred | boolean, default false |
| tags | text[], default {} |
| created_at | timestamptz, default now() |
| updated_at | timestamptz, default now() |

**tasks**

| column | type |
| --- | --- |
| id | uuid, primary key |
| user_id | uuid, references auth.users |
| title | text |
| description | text |
| status | text (todo, in_progress, done) |
| priority | text (low, medium, high) |
| tags | text[], default {} |
| position | integer, default 0 |
| created_at | timestamptz, default now() |

Enable Row Level Security on both tables and add policies so users can only read and write their own rows.

## Project Structure

```
src/
  components/layout/    shared layout (AppShell, Sidebar)
  features/auth/        sign-in, sign-up, settings
  features/dashboard/   dashboard page
  features/notes/       note list, editor, store
  features/tasks/       kanban board, store
  lib/                  Supabase client, utilities
```
