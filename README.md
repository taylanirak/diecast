# Tarodan

İkinci el eşya alım satım ve takas platformu.

## 🚀 Özellikler

- **Ürün Listeleme**: Kullanıcılar ürünlerini kolayca listeleyebilir
- **Takas Sistemi**: Ürünler arası takas teklifleri
- **Güvenli Ödeme**: PayTR ve Iyzico entegrasyonu
- **Kargo Takibi**: Yurtiçi ve Aras kargo entegrasyonu
- **Gerçek Zamanlı Bildirimler**: WebSocket ile anlık bildirimler
- **Admin Paneli**: Kapsamlı yönetim arayüzü

## 📁 Proje Yapısı

```
tarodan/
├── apps/
│   ├── web/          # Next.js Public Web
│   ├── admin/        # Next.js Admin Panel
│   ├── mobile/       # React Native + Expo
│   └── api/          # NestJS Backend
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── api-client/   # API client
│   ├── core/         # Business logic
│   ├── ui/           # Shared UI components
│   └── validators/   # Validation schemas
├── infrastructure/
│   ├── docker-compose.yml
│   └── config/
├── scripts/
└── docs/
```

## 🛠️ Teknolojiler

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Search**: Elasticsearch
- **Storage**: MinIO (S3-compatible)
- **Queue**: Bull (Redis-backed)

### Frontend
- **Web**: Next.js 14 (App Router)
- **Admin**: Next.js 14
- **Mobile**: React Native + Expo
- **Styling**: Tailwind CSS
- **State**: Zustand

### Infrastructure
- **Container**: Docker
- **Reverse Proxy**: Traefik
- **Monitoring**: Prometheus + Grafana
- **Logging**: Loki

## 🚀 Kurulum

### Gereksinimler
- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose

### Geliştirme Ortamı

```bash
# Bağımlılıkları yükle
pnpm install

# Docker servislerini başlat (PostgreSQL, Redis, MinIO, etc.)
pnpm docker:up

# Veritabanı migrasyonlarını çalıştır
pnpm db:migrate

# Seed data ekle
pnpm db:seed

# Geliştirme sunucusunu başlat
pnpm dev
```

### Ortam Değişkenleri

Her uygulama için `.env.local` dosyası oluşturun:

```bash
# apps/api/.env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tarodan"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret"
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"

# apps/web/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3001"

# apps/admin/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 📚 Dokümantasyon

- [Proje Planı](docs/PROJECT.md)
- [Veritabanı Şeması](docs/SCHEMA.md)
- [API Dokümantasyonu](docs/API.md)
- [Admin Paneli](docs/ADMIN.md)

## 🔗 Bağlantılar

Geliştirme ortamında:
- **Web**: http://localhost:3000
- **Admin**: http://localhost:3002
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **MinIO Console**: http://localhost:9001
- **Mailhog**: http://localhost:8025

## 📝 Lisans

MIT License
