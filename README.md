# JoinMe - Frontend 🏃

The frontend of JoinMe, a social platform for organizing and joining local sports drop-in games.

Built with Next.js 16 + TypeScript + Tailwind CSS.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **STOMP.js + SockJS** - WebSocket real-time chat

## Pages

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Browse and filter local events |
| Login | `/login` | User authentication |
| Register | `/register` | Create account |
| Event Detail | `/events/:id` | View event, join/leave |
| Create Event | `/events/create` | Create a new game |
| Chat | `/events/:id/chat` | Real-time group chat |
| Notifications | `/notifications` | In-app notifications |
| Profile | `/profile` | User profile and stats |

## Getting Started

### Prerequisites
- Node.js 18+
- JoinMe Backend running on `http://localhost:8080`

### Installation
```bash
git clone https://github.com/Krisyu7/joinme-frontend.git
cd joinme-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend

The backend repository can be found here:
[JoinMe Backend](https://github.com/Krisyu7/joinme-backend)

## Author

Minghao Yu — [GitHub](https://github.com/Krisyu7)