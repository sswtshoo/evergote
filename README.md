# Evergote

A minimal, markdown-based note-taking app with Notion-inspired block editing. Write in plain text, structure with blocks, and stay focused on the words.


---

## Features

- **Block-based editor** — Notion-inspired paragraph blocks with split, merge support with plans to add drag + reorder
- **Markdown native** — notes are stored and parsed as markdown
- **Distraction-free UI** — dark, typographic interface designed around writing
- **JWT authentication** — secure sign up, sign in, and session management
- **Full CRUD** — create, edit, and delete notes with instant feedback

---

## Tech Stack

### Frontend
| | |
|---|---|
| Language | TypeScript |
| Framework | React 18 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Animation | Motion (motion/react) |
| HTTP client | Axios |

### Backend
| | |
|---|---|
| Language | Go |
| Database | PostgreSQL |
| Auth | JWT (JSON Web Tokens) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Go 1.21+
- PostgreSQL 15

### Frontend

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:3000` by default. API requests are proxied to the backend at `http://localhost:5674`.

### Backend

```bash
cd server
go mod download
go run main.go
```

Make sure your PostgreSQL instance is running and the connection string is configured in your environment before starting the server.

### Environment variables

Create a `.env` file in the server directory:

```env
DATABASE_URL=postgres://user:password@localhost:5432/evergote
JWT_SECRET=your-secret-key
PORT=5674
```

---

## Project Structure

```
evergote/
├── client/                 # React frontend
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── editor/     # Block editor components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # SignIn, SignUp, Home
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # API client, markdown parser
│   └── index.css
└── server/                 # Go backend
    └── main.go
```

---

## License

MIT
