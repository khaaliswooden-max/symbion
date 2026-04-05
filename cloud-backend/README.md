# Symbion Cloud Backend API

Cloud backend API server for the Symbion Gut-Brain Interface platform.

## Features

- ✅ RESTful API with Express.js
- ✅ MongoDB database with Mongoose ODM
- ✅ JWT authentication & authorization
- ✅ Rate limiting & security (Helmet)
- ✅ Request validation (express-validator)
- ✅ Swagger API documentation
- ✅ Winston logging
- ✅ Error handling middleware
- ✅ CORS configuration
- ✅ Compression middleware

## Prerequisites

- Node.js >= 18.x
- MongoDB >= 6.x
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## Configuration

Key environment variables:

```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/symbion
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

See `.env.example` for full configuration options.

## Running the Server

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `PUT /api/v1/users/preferences` - Update preferences

### Devices
- `GET /api/v1/devices` - List user devices
- `POST /api/v1/devices` - Register new device
- `GET /api/v1/devices/:id` - Get device details
- `PUT /api/v1/devices/:id` - Update device
- `DELETE /api/v1/devices/:id` - Delete device
- `POST /api/v1/devices/:id/status` - Update device status

### Sensor Readings
- `POST /api/v1/sensors/readings` - Submit readings
- `GET /api/v1/sensors/readings` - Get readings (with filters)
- `GET /api/v1/sensors/readings/:id` - Get specific reading
- `GET /api/v1/sensors/latest` - Get latest reading

### Analytics
- `GET /api/v1/analytics/summary` - Get analytics summary
- `GET /api/v1/analytics/trends` - Get analyte trends
- `GET /api/v1/analytics/correlations` - Get correlations
- `GET /api/v1/analytics/anomalies` - Detect anomalies
- `GET /api/v1/analytics/export` - Export data as CSV

## API Documentation

Interactive API documentation is available at:

```
http://localhost:3000/api-docs
```

Powered by Swagger/OpenAPI 3.0

## Project Structure

```
cloud-backend/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB configuration
│   │   └── swagger.js       # Swagger setup
│   ├── controllers/         # Request handlers
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   ├── errorHandler.js  # Global error handler
│   │   └── rateLimiter.js   # Rate limiting
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── utils/
│   │   └── logger.js        # Winston logger
│   └── server.js            # Entry point
├── logs/                    # Log files
├── .env                     # Environment variables
├── .env.example             # Environment template
├── package.json
└── README.md
```

## Authentication

All protected endpoints require a Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/v1/users/profile
```

### Getting a Token

1. Register:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

2. Login:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

Response will include `accessToken` and `refreshToken`.

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "message": "Validation failed",
    "status": 422,
    "errors": [...]
  }
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

Default limits:
- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

## Logging

Logs are written to:
- Console (colorized, development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

Log levels: `error`, `warn`, `info`, `debug`

## Security Features

- Helmet.js security headers
- CORS configuration
- Rate limiting
- JWT authentication
- Password hashing (bcrypt)
- Input validation
- MongoDB injection prevention

## Testing

```bash
npm test
```

## Production Deployment

### Docker

```bash
# Build image
docker build -t symbion-api .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://host:27017/symbion \
  symbion-api
```

### PM2 (Process Manager)

```bash
pm2 start src/server.js --name symbion-api
pm2 logs symbion-api
pm2 restart symbion-api
```

## Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-01T10:00:00.000Z",
  "uptime": 3600,
  "version": "v1"
}
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/khaaliswooden-max/symbion/issues
- Email: support@symbion.health

---

Made with ❤️ by the Symbion team

