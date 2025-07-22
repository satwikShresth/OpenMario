# OpenMario - Co-op Salary Board

OpenMario is a platform for anonymously collecting and sharing cooperative
education (co-op) salary information. This project helps students make informed
decisions about co-op opportunities by providing transparent salary data.

## Features

- Anonymous submission of co-op salary information
- Search and filter salary data by company, position, location, and more
- User authentication via magic links
- Detailed data visualization of compensation trends
- Company and position autocomplete to ensure data consistency

## Tech Stack

- **Backend**: Deno with REST API
- **Frontend**: React with Vite
- **Database**: PostgreSQL for data storage
- **Search Engine**: Meilisearch for fast and relevant search results
- **Deployment**: Docker and Docker Compose for containerization
- **Web Server**: Caddy for reverse proxy and SSL termination

## Getting Started

### Prerequisites

- Docker and Docker Compose (only requirement)
- Git (for cloning the repository)

### Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/openmario.git
   cd openmario
   ```

2. Configure environment variables:
   - Copy `.dev.env` to `.env` if running locally
   - Update the following variables in your `.env` file:
     - `MEILI_MASTER_KEY`: Set a secure key for Meilisearch
     - `EMAIL_API_KEY`: API key for your email provider
     - `SENDER_EMAIL`: Email address for sending magic links
     - `DOMAIN` or `APP_URL`: Your application domain
     - `JWT_SECRET_MAGIC_LINK`: Secret key for magic link tokens
     - `JWT_SECRET_CLIENT`: Secret key for client authentication
     - Update image names in `PRESTART_IMAGE`, `BACKEND_IMAGE`, and
       `REVERSE_PROXY_IMAGE`

### Running Locally

The application setup requires just two main steps:

1. **Seed the database** (required on first run):
   ```bash
   docker compose --profile seed up
   ```
   This initializes the PostgreSQL database with the necessary tables and
   initial data.

2. **Start all services**:
   ```bash
   docker compose --profile deploy up
   ```
   This command launches all the required services:
   - PostgreSQL database
   - Meilisearch server
   - Backend API server (Deno)
   - Frontend server with reverse proxy

The application should now be accessible at http://localhost (or the domain you
configured).

To stop all services, press `Ctrl+C` or run:

```bash
docker compose --profile deploy down
```

### Development Environment

For development with hot reloading:

```bash
docker compose --profile deploy up
```

This configuration enables:

- File watching and automatic reloading
- Exposed ports for direct access to services
- Development-specific settings

### Production Deployment

For production deployment:

```bash
docker compose --profile deploy -f docker-compose.yml up -d
```

This will:

- Start all services in detached mode with production configurations
- Use production-optimized Docker images
- Apply memory limits as defined in the docker-compose.yml file

## API Documentation

The API follows OpenAPI 3.0 standards. The full API documentation is available
in the `openapi.json` file.

### Authentication

The application uses magic link authentication:

1. Users request a login by providing their email
2. A magic link is sent to their email
3. Clicking the link validates the token and authenticates the user

### Key Endpoints

- **Authentication**
  - `POST /auth/login`: Request a magic link
  - `GET /auth/login/{token}`: Verify magic link token

- **Search Autocomplete**
  - `GET /autocomplete/company`: Search for companies
  - `GET /autocomplete/position`: Search for positions within a company
  - `GET /autocomplete/location`: Search for locations

- **Companies and Positions**
  - `GET /company-position`: Get user's companies and positions
  - `POST /company-position`: Create a new company-position pair

- **Submissions**
  - `GET /submissions`: Retrieve salary submissions with filtering
  - `POST /submissions`: Create new salary submission(s)
  - `PATCH /submissions`: Update existing submission
  - `GET /submissions/me`: Get authenticated user's submissions

## Folder Structure

```
.
├── back/                  # Backend code (Deno)
├── front/                 # Frontend code (React + Vite)
├── caddy/                 # Caddy server configuration
├── docker-compose.yml     # Production Docker Compose configuration
├── docker-compose.override.yml # Development overrides
└── .env                   # Environment variables
```

## Memory Usage

The application is optimized for low memory usage:

- Backend: 250MB limit, 150MB reservation
- Frontend: 200MB limit, 100MB reservation
- Database: 200MB limit, 100MB reservation
- Meilisearch: 500MB limit, 150MB reservation

## Search Implementation

The application uses Meilisearch for:

- Fast full-text search
- Typo-tolerant autocomplete
- Filtering and faceting of salary data

A search token is generated for users to perform searches securely.

## Contributing

Contributions are welcome! Please refer to our contribution guidelines for more
information.
