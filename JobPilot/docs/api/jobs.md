# Jobs API

## Create Job

POST /jobs

Protected

Body:

{
  "title": "Frontend Developer",
  "company": "Google",
  "location": "Remote",
  "status": "Applied"
}

## Get All Jobs

GET /jobs

Protected

## Get Single Job

GET /jobs/:id

Protected

## Update Job

PUT /jobs/:id

Protected

## Delete Job

DELETE /jobs/:id

Protected

## Update Status

PATCH /jobs/:id/status

Body:

{
  "status": "Interview"
}

## Extract Job From URL

POST /jobs/extract

Body:

{
  "url": "https://company.com/job/123"
}