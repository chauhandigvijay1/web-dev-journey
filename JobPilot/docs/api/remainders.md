# Reminder API

## Create Reminder

POST /reminders

Protected

Body:

{
  "jobId": "job_id",
  "date": "2026-04-25"
}

## Get Reminders

GET /reminders

Protected

## Scheduler

Runs automatically and sends email reminders.