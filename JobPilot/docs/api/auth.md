# Authentication API

## Register

POST /auth/register

Body:

{
  "name": "Aditya",
  "username": "aditya01",
  "email": "aditya@gmail.com",
  "password": "Password123"
}

## Login

POST /auth/login

Body:

{
  "identifier": "aditya@gmail.com",
  "password": "Password123"
}

identifier = email or username

## Current User

GET /auth/me

Protected Route

## Logout

POST /auth/logout

## Google Login

POST /auth/google

Body:

{
  "token": "google_id_token"
}