# Tarodan API Documentation

## Base URL
- Development: `http://localhost:3001`
- Production: `https://api.tarodan.com`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Endpoints

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "username",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /auth/login
Login and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "username"
  }
}
```

#### POST /auth/forgot-password
Request a password reset email.

#### POST /auth/reset-password
Reset password with token.

---

## Products

#### GET /products
List products with filtering and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| categoryId | string | Filter by category ID |
| categorySlug | string | Filter by category slug |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| condition | string | NEW, LIKE_NEW, GOOD, FAIR, POOR |
| isTradeEnabled | boolean | Filter tradeable products |
| search | string | Search in name and description |
| sortBy | string | price, createdAt, viewCount |
| sortOrder | string | asc, desc |

#### GET /products/:id
Get product details.

#### POST /products
Create a new product (requires authentication).

#### PATCH /products/:id
Update a product (requires ownership).

#### DELETE /products/:id
Delete a product (requires ownership).

---

## Orders

#### GET /orders
List user's orders (requires authentication).

#### GET /orders/:id
Get order details.

#### POST /orders
Create a new order.

#### POST /orders/guest
Create a guest order (no authentication required).

#### POST /orders/:id/pay
Initiate payment for an order.

---

## Trades

#### GET /trades
List user's trades.

#### GET /trades/:id
Get trade details.

#### POST /trades
Create a new trade offer.

#### POST /trades/:id/accept
Accept a trade offer.

#### POST /trades/:id/reject
Reject a trade offer.

#### POST /trades/:id/counter
Make a counter offer.

---

## Collections

#### GET /collections/browse
Browse public collections.

#### GET /collections/me
Get user's collections.

#### GET /collections/:id
Get collection details.

#### POST /collections
Create a new collection.

#### POST /collections/:id/items
Add item to collection.

#### DELETE /collections/:id/items/:itemId
Remove item from collection.

---

## User

#### GET /users/me
Get current user profile.

#### PATCH /users/me
Update current user profile.

#### GET /users/me/addresses
Get user's addresses.

#### POST /users/me/addresses
Add a new address.

---

## Categories

#### GET /categories
List all categories.

#### GET /categories/:id
Get category details.

#### GET /categories/slug/:slug
Get category by slug.

---

## Notifications

#### GET /notifications
Get user's notifications.

#### GET /notifications/unread-count
Get unread notification count.

#### POST /notifications/:id/read
Mark notification as read.

#### POST /notifications/read-all
Mark all notifications as read.

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Internal Server Error
