# Tarodan Admin Panel Documentation

## Overview

The Tarodan Admin Panel provides comprehensive management capabilities for the platform.

## Access

- Development: `http://localhost:3002`
- Production: `https://admin.tarodan.com`

### Default Credentials
- Email: `admin@tarodan.com`
- Password: `Admin123!`

⚠️ **Change the default password immediately after first login!**

---

## Features

### Dashboard
- Overview of key metrics
- Real-time statistics
- Quick actions
- Recent activity

### Analytics
- Sales reports
- Revenue charts
- User growth metrics
- Category performance
- Geographic distribution

### User Management
- View all users
- Edit user details
- Suspend/unsuspend users
- View seller profiles
- Manage user roles

### Product Management
- View all products
- Approve/reject pending products
- Edit product details
- Handle reported products
- Bulk actions

### Order Management
- View all orders
- Update order status
- Handle disputes
- Process refunds
- Generate invoices

### Trade Management
- Monitor active trades
- Resolve disputes
- View trade history
- Commission tracking

### Settings
- General settings
- Commission rules
- Payment configuration
- Shipping options
- Notification templates

### Moderation Queue
- Review reported content
- Approve/reject items
- Ban management
- Content filtering

### Audit Logs
- Track all admin actions
- User activity logs
- System events
- Security monitoring

---

## Commission Rules

### Creating Rules
1. Navigate to Settings > Commission
2. Click "Add Rule"
3. Configure:
   - Name and description
   - Percentage (0-100%)
   - Category (optional)
   - Membership tier (optional)
   - Priority

### Rule Priority
Rules are applied in priority order. Higher priority rules override lower ones.

### Default Rates
- Free tier: 10%
- Basic tier: 8%
- Premium tier: 5%
- Business tier: 3%

---

## Reports

### Available Reports
1. **Sales Report**: Daily/weekly/monthly sales
2. **User Report**: Registration and activity
3. **Product Report**: Listings and views
4. **Revenue Report**: Earnings and commissions
5. **Site Access Report**: Traffic analytics

### Export Formats
- PDF
- Excel (XLSX)
- CSV

---

## Security

### Authentication
- JWT-based authentication
- Session timeout: 24 hours
- Two-factor authentication (optional)

### Permissions
- Full admin access
- Read-only access
- Department-specific access

### Audit Trail
All admin actions are logged with:
- User ID
- Action type
- Timestamp
- IP address
- Previous/new values

---

## API Endpoints

All admin API endpoints are prefixed with `/admin/`.

### Dashboard
```
GET /admin/dashboard
```

### Users
```
GET /admin/users
GET /admin/users/:id
PATCH /admin/users/:id
POST /admin/users/:id/suspend
POST /admin/users/:id/unsuspend
```

### Products
```
GET /admin/products
GET /admin/products/:id
POST /admin/products/:id/approve
POST /admin/products/:id/reject
```

### Orders
```
GET /admin/orders
GET /admin/orders/:id
PATCH /admin/orders/:id/status
```

### Commission Rules
```
GET /admin/commission-rules
POST /admin/commission-rules
PATCH /admin/commission-rules/:id
DELETE /admin/commission-rules/:id
```

### Settings
```
GET /admin/settings
PATCH /admin/settings
```

### Reports
```
GET /admin/reports/sales
GET /admin/reports/users
GET /admin/reports/products
GET /admin/reports/revenue
```

### Moderation
```
GET /admin/moderation
POST /admin/moderation/:id/approve
POST /admin/moderation/:id/reject
```

### Audit Logs
```
GET /admin/audit-logs
```
