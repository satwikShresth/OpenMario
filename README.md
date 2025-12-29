# OpenMario

A modern platform for students to share and discover co-op salary information and course reviews.

![OpenMario Banner](./apps/client/public/openmario.png)

[![Join our Discord](https://img.shields.io/badge/Discord-Join%20Us-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ENRP6mtcwU)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3-000000?style=for-the-badge&logo=bun)](https://bun.sh)

> 💬 **Join our community!** Have questions or want to contribute? [Join our Discord server](https://discord.gg/ENRP6mtcwU)

## 🚀 Features

- **Salary Database**: Browse and contribute co-op salary information
- **Course Search**: Search and explore course offerings with detailed information
- **Interactive Feedback**: Built-in feedback system with Discord integration
- **Advanced Filtering**: Filter by year, program level, location, and more
- **Real-time Search**: Powered by MeiliSearch for instant results
- **Graph Analytics**: Neo4j-powered data relationships and insights

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **TanStack Router** for routing
- **TanStack Query** for data fetching
- **TanStack Form** for form management
- **Chakra UI v3** for components
- **Vite** for blazing-fast builds

### Backend
- **Bun** runtime
- **Hono** web framework
- **oRPC** for type-safe APIs
- **Drizzle ORM** for database management
- **PostgreSQL** for primary data storage
- **MeiliSearch** for search functionality
- **Neo4j** for graph data

### DevOps
- **Docker** & **Docker Compose** for containerization
- **Caddy** as reverse proxy
- **Turborepo** for monorepo management

## 📋 Prerequisites

- **Bun** >= 1.3.0
- **Docker** & **Docker Compose** (for production deployment)
- **Node.js** >= 18 (if using npm/yarn)

## 🚦 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/openmario.git
   cd openmario
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server
   PORT=3000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/openmario
   
   # MeiliSearch
   MEILI_HOST=http://localhost:7700
   MEILI_MASTER_KEY=your_master_key_here
   
   # Neo4j
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your_password_here
   
   # Client
   VITE_APP_TITLE=OpenMario
   VITE_LR_APP_ID=your_logrocket_id
   VITE_MEILI_HOST=http://localhost:7700
   VITE_DISCORD_WEBHOOK=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
   ```

4. **Start development servers**
   ```bash
   # Start all services (requires Docker)
   docker compose up postgres meilisearch neo4j -d
   
   # Start development
   bun run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api
   - MeiliSearch: http://localhost:7700

## 🐳 Docker Deployment

### Production Build

1. **Build the images**
   ```bash
   docker compose build
   ```

2. **Start all services**
   ```bash
   docker compose up -d
   ```

3. **Access the application**
   - Application: http://localhost:3000

### Services

The Docker setup includes:
- **server**: Backend API server (Bun)
- **client**: Frontend with Caddy reverse proxy
- **postgres**: PostgreSQL database
- **meilisearch**: Search engine
- **neo4j**: Graph database

## 📁 Project Structure

```
openmario/
├── apps/
│   ├── client/          # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── routes/
│   │   │   ├── hooks/
│   │   │   └── db/
│   │   └── Caddyfile
│   └── server/          # Bun backend
│       ├── src/
│       │   ├── contracts/
│       │   ├── router/
│       │   └── services/
│       └── drizzle/
├── packages/
│   ├── email/           # Email templates
│   └── meilisearch/     # Search index definitions
├── scripts/
├── docker-compose.yml
├── Dockerfile
└── turbo.json
```

## 🔧 Development Scripts

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Format code
bun run format

# Type checking
bun run type-check

# Clean build artifacts
bun run clean
```

## 🗄️ Database

### Migrations

```bash
# Generate migrations
cd apps/server
bun run drizzle-kit generate

# Run migrations (development)
bun run drizzle-kit push
```

### Seeding

```bash
cd apps/server/drizzle/openmario/seeds
bun run index.ts
```

## 🔍 Search Setup

MeiliSearch indexes need to be configured for optimal search:

```bash
cd packages/meilisearch/search_index
bun run index.ts
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Environment Variables

### Server Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `MEILI_HOST` | MeiliSearch host URL | Yes |
| `MEILI_MASTER_KEY` | MeiliSearch API key | Yes |
| `NEO4J_URI` | Neo4j connection URI | Yes |
| `NEO4J_USERNAME` | Neo4j username | Yes |
| `NEO4J_PASSWORD` | Neo4j password | Yes |

### Client Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_APP_TITLE` | Application title | No |
| `VITE_LR_APP_ID` | LogRocket app ID | Yes |
| `VITE_MEILI_HOST` | Public MeiliSearch URL | Yes |
| `VITE_DISCORD_WEBHOOK` | Discord webhook for feedback | Yes |

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Bun](https://bun.sh)
- UI components from [Chakra UI](https://chakra-ui.com)
- Routing powered by [TanStack Router](https://tanstack.com/router)
- Search powered by [MeiliSearch](https://www.meilisearch.com)

## 📞 Support

For support, feedback, or questions:
- Open an issue on GitHub
- Use the in-app feedback button
- Contact me on discord

---

## Community & Development

Join our Discord community to collaborate, ask questions, and contribute to the development of OpenMario:

[![Join our Discord](https://img.shields.io/badge/Discord-Join%20Us-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ENRP6mtcwU)

**[Join Discord Server](https://discord.gg/ENRP6mtcwU)**

Made with ❤️ for students


