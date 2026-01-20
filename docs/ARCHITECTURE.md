# TARODAN System Architecture

## Overview

TARODAN is a collectible toy marketplace platform with a modern, scalable architecture. The system follows a client-gateway-data pattern where all client applications communicate through a single API Gateway.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                       │
├─────────────────────┬─────────────────────┬─────────────────────────────────┤
│    Web Application  │  Mobile Application │      Admin Panel                │
│    (Next.js 14)     │  (React Native +    │      (Next.js 14)               │
│    Port: 3000       │   Expo)             │      Port: 3002                 │
│    tarodan.com      │  iOS & Android      │      admin.tarodan.com          │
└─────────┬───────────┴──────────┬──────────┴───────────────┬─────────────────┘
          │                      │                          │
          └──────────────────────┼──────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (NestJS)                                 │
│                              Port: 3001                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Auth &    │  │   Request   │  │  Business   │  │    Background       │ │
│  │   AuthZ     │  │   Routing   │  │   Logic     │  │    Workers          │ │
│  │  (JWT/2FA)  │  │ (REST/GQL)  │  │ (Services)  │  │    (BullMQ)         │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────────┐
│   PostgreSQL    │  │     Redis       │  │      Elasticsearch              │
│   Port: 5432    │  │   Port: 6379    │  │      Port: 9200                 │
├─────────────────┤  ├─────────────────┤  ├─────────────────────────────────┤
│ • Users         │  │ • Caching       │  │ • Full-text search              │
│ • Products      │  │ • Sessions      │  │ • Product search                │
│ • Orders        │  │ • Rate limiting │  │ • Filtering                     │
│ • Payments      │  │ • Job queues    │  │ • Analytics                     │
│ • Shipments     │  │ • Pub/Sub       │  │                                 │
│ • Analytics     │  │                 │  │                                 │
└─────────────────┘  └─────────────────┘  └─────────────────────────────────┘
```

## Components

### 1. Client Applications

#### Web Application (Next.js 14)
- **Location**: `tarodan/apps/web`
- **Port**: 3000
- **Domain**: tarodan.com
- **Features**:
  - Server-side rendering (SSR) and Static Site Generation (SSG)
  - SEO optimized
  - Tailwind CSS for styling
  - App Router architecture
  - Public access with authentication for user features

#### Mobile Application (React Native + Expo)
- **Location**: `tarodan/apps/mobile`
- **Platforms**: iOS and Android
- **Features**:
  - Expo Router for navigation
  - Push notifications via Expo Push
  - Secure token storage with expo-secure-store
  - Native features integration

#### Admin Panel (Next.js 14)
- **Location**: `tarodan/apps/admin`
- **Port**: 3002
- **Domain**: admin.tarodan.com
- **Features**:
  - Shadcn/UI component library
  - Recharts for analytics visualization
  - Authentication required for all routes
  - Dashboard with real-time statistics

### 2. API Gateway (NestJS)

- **Location**: `tarodan/apps/api`
- **Port**: 3001
- **Domain**: api.tarodan.com

The API Gateway is the central access point for all client applications. No client communicates directly with databases.

#### Responsibilities:

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Two-factor authentication (2FA)
   - Passport.js strategies

2. **Request Routing**
   - REST API endpoints
   - GraphQL API (Apollo Server)
   - WebSocket connections (Socket.io)
   - Webhook handling

3. **Business Logic**
   - Service layer for all business operations
   - Input validation with class-validator
   - Error handling and transformation

4. **Data Coordination**
   - Prisma ORM for PostgreSQL
   - Redis client for caching
   - Elasticsearch client for search

5. **Background Processing**
   - BullMQ job queues
   - Workers for: Email, Push, Image, Payment, Shipping, Search

### 3. Data Services

#### PostgreSQL (Primary Database)
- **Port**: 5432
- **ORM**: Prisma
- **Data Stored**:
  - Users and authentication
  - Products and categories
  - Orders and order items
  - Payments and transactions
  - Shipments and tracking
  - Messages and threads
  - Reviews and ratings
  - Support tickets

#### Redis (In-Memory Store)
- **Port**: 6379
- **Usage**:
  - Session management
  - Response caching
  - Rate limiting
  - Job queues (BullMQ)
  - Pub/Sub for real-time events
  - Admin session storage

#### Elasticsearch (Search Engine)
- **Port**: 9200
- **Usage**:
  - Product full-text search
  - Filtering and faceting
  - Search suggestions
  - Analytics aggregations

## Data Flow

### Request Flow
```
Client App → Traefik (Load Balancer) → API Gateway → Service → Data Layer
```

### Authentication Flow
```
1. Client sends credentials to /auth/login
2. API Gateway validates with PostgreSQL
3. JWT token generated and returned
4. Client stores token (localStorage/SecureStore)
5. Subsequent requests include Authorization header
6. API Gateway validates JWT on each request
```

### Search Flow
```
1. Client sends search query
2. API Gateway routes to SearchModule
3. Elasticsearch performs full-text search
4. Results enriched with PostgreSQL data
5. Response cached in Redis
6. Results returned to client
```

## File Structure

```
tarodan/
├── apps/
│   ├── api/                 # NestJS API Gateway
│   │   ├── src/
│   │   │   ├── modules/     # Feature modules
│   │   │   ├── prisma/      # Database service
│   │   │   ├── workers/     # Background workers
│   │   │   └── shared/      # Shared utilities
│   │   └── prisma/
│   │       └── schema.prisma
│   ├── web/                 # Next.js Web Application
│   │   └── src/
│   │       ├── app/         # App Router pages
│   │       ├── components/  # React components
│   │       └── lib/         # Utilities & API client
│   ├── admin/               # Next.js Admin Panel
│   │   └── src/
│   │       ├── app/         # Admin pages
│   │       ├── components/  # Admin components
│   │       └── lib/         # Admin utilities
│   └── mobile/              # React Native Mobile App
│       └── src/
│           ├── screens/     # App screens
│           ├── components/  # Mobile components
│           └── services/    # API & services
├── packages/                # Shared packages
│   ├── types/              # TypeScript types
│   ├── api-client/         # Shared API client
│   ├── validators/         # Validation schemas
│   └── ui/                 # Shared UI components
├── infrastructure/          # Docker & deployment
│   ├── docker-compose.yml
│   └── config/
└── docs/                    # Documentation
```

## API Modules

| Module | Description | Endpoints |
|--------|-------------|-----------|
| Auth | Authentication & authorization | /auth/* |
| User | User management | /users/* |
| Product | Product CRUD & listing | /products/* |
| Category | Category management | /categories/* |
| Offer | Price offers & negotiation | /offers/* |
| Order | Order processing | /orders/* |
| Payment | Payment processing (iyzico) | /payments/* |
| Shipping | Shipment tracking (Aras) | /shipping/* |
| Trade | Item trading/swapping | /trades/* |
| Messaging | User messaging | /messages/* |
| Notification | Push & in-app notifications | /notifications/* |
| Search | Elasticsearch search | /search/* |
| Admin | Admin operations | /admin/* |
| Health | Health checks | /health/* |

## Health Check Endpoints

| Endpoint | Purpose |
|----------|---------|
| GET /health | Basic API status |
| GET /health/detailed | Full service status with latencies |
| GET /health/live | Kubernetes liveness probe |
| GET /health/ready | Kubernetes readiness probe |

## Security

- **HTTPS**: All traffic encrypted via Traefik with Let's Encrypt
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based with guards
- **Rate Limiting**: Traefik middleware + NestJS throttling
- **Input Validation**: class-validator decorators
- **SQL Injection**: Prevented by Prisma ORM
- **XSS**: React's built-in escaping + CSP headers

## Scalability

- **Horizontal Scaling**: API replicas behind Traefik load balancer
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for frequently accessed data
- **Search**: Elasticsearch for heavy search operations
- **Async Processing**: BullMQ workers for background tasks

## Monitoring

- **Prometheus**: Metrics collection (port 9090)
- **Grafana**: Dashboards and alerting (port 3003)
- **Loki**: Log aggregation
- **Sentry**: Error tracking and performance
