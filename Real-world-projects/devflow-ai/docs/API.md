# API Documentation

## Base URL

https://devflow-api-ubnd.onrender.com

---

## Auth APIs

### Signup

POST /api/auth/signup

Body:
{
"name": "John",
"email": "[john@gmail.com](mailto:john@gmail.com)",
"password": "123456"
}

---

### Login

POST /api/auth/login

---

## Chat APIs

### Create Chat

POST /api/chats

---

### Send Message

POST /api/ai

---

## Payment APIs

### Create Order

POST /api/payments/create-order

---

### Verify Payment

POST /api/payments/verify

---

## Health Check

GET /api/health
