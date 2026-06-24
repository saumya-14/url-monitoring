# Uptime Monitoring Application

A lightweight, containerized real-time uptime monitoring application. It periodically performs health checks on registered HTTP/HTTPS URLs, records status metrics (HTTP response status, response latency, and timestamps), and displays a self-updating frontend dashboard with the operational status of all monitored links.

---

## ⚡ 1-Line Setup

To build and launch the entire ecosystem locally, run the following single command from the repository root:

```bash
docker compose up  
```

*Once running:*
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend Health Endpoint**: [http://localhost:5000/health](http://localhost:5000/health)

---

## Architecture Overview

The application follows a classic three-tier architecture containerized with Docker:

```
[ Next.js Frontend Dashboard ] (Port 3000)
             │
             ▼
[ Express.js Backend API ]     (Port 5000) ◄─── [ Cron Monitoring Service (node-cron) ]
             │                                                    │
             ▼                                                    ▼
[ MongoDB Database Container ] (Port 27017) ◄─────────────────────┘
```

1. **Frontend**: A client dashboard built with Next.js (App Router), TypeScript, and Tailwind CSS. It communicates with the Backend REST API and periodically auto-refreshes to show the latest status of all monitors.
2. **Backend**: An Express.js server running in Node.js. It exposes endpoints to register URLs, retrieve current status, and run dashboard aggregations. 
3. **Uptime Monitor**: A lightweight scheduler running within the backend service via `node-cron`. Every minute, it queries the MongoDB database for all registered URLs and triggers concurrent HTTP GET requests using `axios` (with a 10-second timeout) to determine status.
4. **Database**: MongoDB stores URL registration documents and time-series logs of every individual health check execution.

---

## Tech Stack

* **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Axios
* **Backend**: Node.js, Express.js, Mongoose (MongoDB ODM), node-cron (scheduler), Axios (HTTP Client)
* **Database**: MongoDB (v7.0)
* **DevOps**: Docker, Docker Compose

---

## Repository Structure

```
url-monitoring/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection configuration
│   │   ├── controllers/     # Controller logic (URLs registration & Dashboard statistics)
│   │   ├── jobs/            # cron schedules (periodic background check runner)
│   │   ├── models/          # Mongoose Schemas (Url, HealthCheck)
│   │   ├── routes/          # Express API route endpoints
│   │   ├── services/        # Business logic & axios ping actions
│   │   ├── app.js           # Express app setup and middleware configuration
│   │   └── server.js        # Entry point: starts database, mounts cron, runs server
│   ├── Dockerfile           # Docker configuration for Backend
│   ├── package.json         # Backend dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── app/                 # Next.js App Router (views, styles, layout)
│   │   ├── globals.css      # Tailwind styling
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Dashboard UI & URL submit form
│   ├── src/
│   │   └── lib/             # API client services
│   │       └── api.js       # Axios configurations & endpoints requests
│   ├── Dockerfile           # Multi-stage Docker configuration for Frontend
│   ├── tsconfig.json        # TypeScript configuration
│   └── package.json         # Frontend dependencies
├── docker-compose.yml       # Orchestrates MongoDB, Backend, and Frontend containers
├── README.md                # System documentation (this file)
└── AI_LOG.md                # Development log
```

---

## API Endpoints

### 1. `GET /health`
* **Description**: Returns the operational status of the Backend API service.
* **Response**: `200 OK`
  ```json
  {
    "status": "ok"
  }
  ```

### 2. `POST /api/urls`
* **Description**: Registers a new URL to be monitored by the background cron scheduler.
* **Request Body**:
  ```json
  {
    "url": "https://example.com"
  }
  ```
* **Response**: `201 Created`
  ```json
  {
    "_id": "649f8a3d5e2b4d0012bcab11",
    "url": "https://example.com",
    "createdAt": "2026-06-24T07:20:00.000Z"
  }
  ```

### 3. `GET /api/urls`
* **Description**: Lists all registered URLs currently configured for monitoring.
* **Response**: `200 OK`
  ```json
  [
    {
      "_id": "649f8a3d5e2b4d0012bcab11",
      "url": "https://example.com",
      "createdAt": "2026-06-24T07:20:00.000Z"
    }
  ]
  ```

### 4. `GET /api/dashboard`
* **Description**: Aggregates and returns the latest status metrics for all registered URLs.
* **Response**: `200 OK`
  ```json
  [
    {
      "url": "https://example.com",
      "status": "UP",
      "statusCode": 200,
      "responseTime": 142,
      "lastChecked": "2026-06-24T07:21:00.000Z"
    }
  ]
  ```

---

## 🧪 Testing Steps (Verification Instructions)

Follow these exact steps to verify the application's up/down tracking logic:

### Test Case 1: Healthy URL Test
1. Open the dashboard at [http://localhost:3000](http://localhost:3000).
2. Locate the "Register a URL" form, enter:
   `https://example.com`
   and click **Add URL**.
3. **Expected Result**:
   - The URL is added immediately, displaying a status of **PENDING**.
   - Within **60 seconds**, the background cron task triggers a health check.
   - The UI automatically refreshes, and the status transitions from **PENDING ➔ UP** with an HTTP status code `200` and response latency (e.g. `85ms`).

### Test Case 2: Invalid/Broken URL Test
1. On the same dashboard page, enter:
   `https://hbdddffndjfndf.com`
   and click **Add URL**.
2. **Expected Result**:
   - The URL is added immediately, displaying a status of **PENDING**.
   - Within **60 seconds**, the background cron task attempts to request the invalid host and encounters a failure.
   - The UI automatically refreshes, and the status transitions from **PENDING ➔ DOWN** with an empty or `null` status code and latency.

---

## ☁️ Deployment Sketch & Infrastructure-as-Code (IaC)

Here is how we would map out a resilient cloud topology to host this MVP application on AWS:

### 1. Topology Design
```
                       [ Internet ]
                            │
                            ▼
                 [ Load Balancer (ALB) ]
                  ┌─────────┴─────────┐
                  │ Path: /           │ Path: /api/* or /health
                  ▼                   ▼
      [ Next.js Frontend ECS ]   [ Express Backend ECS ] (Auto-scaled ECS/Fargate Task)
      (Fargate / Amplify Hosting)     │
                                      ▼
                           [ MongoDB Atlas / DocumentDB ]
                           (Multi-AZ replica set with SSL)
```

- **Compute**: **AWS ECS (Fargate)** for serverless container deployment.
- **Routing**: **AWS Application Load Balancer (ALB)** to manage path routing between Frontend and Backend.
- **Database**: Managed **MongoDB Atlas** database in a multi-AZ setup, connected via VPC peering.

### 2. Hypothetical Terraform Snippet (Deployment)

This brief Terraform snippet demonstrates how the frontend and backend containers would be orchestrated using **AWS App Runner** (a fast container runner equivalent to ECS/Fargate) to host this system:

```hcl
# Provider Definition
provider "aws" {
  region = "us-east-1"
}

# 1. Backend Service Configuration (Express API & Cron)
resource "aws_apprunner_service" "backend" {
  service_name = "uptime-monitor-backend"

  source_configuration {
    image_repository {
      image_identifier      = "123456789012.dkr.ecr.us-east-1.amazonaws.com/url-monitor-backend:latest"
      image_repository_type = "ECR"
      
      image_configuration {
        port = "5000"
        runtime_environment_variables = {
          NODE_ENV    = "production"
          PORT        = "5000"
          MONGODB_URI = "mongodb+srv://admin:securepwd@prod-cluster.mongodb.net/uptime"
        }
      }
    }
    auto_deployments_enabled = true
  }
}

# 2. Frontend Service Configuration (Next.js App)
resource "aws_apprunner_service" "frontend" {
  service_name = "uptime-monitor-frontend"

  source_configuration {
    image_repository {
      image_identifier      = "123456789012.dkr.ecr.us-east-1.amazonaws.com/url-monitor-frontend:latest"
      image_repository_type = "ECR"
      
      image_configuration {
        port = "3000"
        runtime_environment_variables = {
          # Dynamically inject backend address generated by Terraform
          NEXT_PUBLIC_API_URL = "https://${aws_apprunner_service.backend.service_url}/api"
        }
      }
    }
    auto_deployments_enabled = true
  }
}

# Outputs for Easy Access
output "frontend_url" {
  value       = "https://${aws_apprunner_service.frontend.service_url}"
  description = "The URL of the Web Dashboard"
}
```
