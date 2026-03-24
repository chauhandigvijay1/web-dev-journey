# JobPilot API Overview

Base URL (Local)

http://localhost:5051/api

Base URL (Production)

https://your-backend-url.onrender.com/api

## Authentication

Protected routes require JWT token.

Header:

Authorization: Bearer <token>

## Response Format

Success:

{
  "success": true,
  "data": {}
}

Error:

{
  "success": false,
  "message": "Something went wrong"
}