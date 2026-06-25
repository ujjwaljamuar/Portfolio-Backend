first read how this project has been implemented
below is a new requirement which will follow the same backend project style for development,
new style unless its necessary

# DSA Knowledge Base - Backend Requirements

## Objective

Implement a private DSA Knowledge Base backend inside the existing Node.js + TypeScript application.

The DSA module is intended for the admin user only.

Authentication already exists and should be reused.

Do not modify the existing blog functionality.

---

# Existing System

Already available:

- Node.js
- TypeScript
- Express
- MongoDB
- Mongoose
- JWT Authentication
- Admin Middleware
- Cloudinary Upload APIs

Reuse existing authentication and middleware.

All DSA APIs must be protected.

---

# Collection

Create a new MongoDB collection:

```text
dsa_problems
```

---

# Schema Design

## DsaProblem

```ts
interface DsaProblem {
  _id: string;

  title: string;

  platform: "LeetCode" | "NeetCode" | "InterviewBit" | "Custom";

  problemUrl?: string;

  difficulty: "Easy" | "Medium" | "Hard";

  tags: string[];

  status: "todo" | "solved" | "revision";

  question: string;

  approaches: DsaApproach[];

  notes?: string;

  revisionCount: number;

  lastRevisedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

---

## DsaApproach

A problem can contain multiple approaches.

```ts
interface DsaApproach {
  order: number;

  title: string;

  intuition: string;

  approach: string;

  solution: string;
}
```

All content fields are markdown strings.

---

# Markdown Fields

The following fields store markdown:

```text
question

approaches[].intuition

approaches[].approach

approaches[].solution

notes
```

No markdown processing is required in backend.

Store raw markdown.

---

# Validation

Required:

```text
title
difficulty
status
question
approaches
```

Approaches array must contain at least one approach.

Each approach must contain:

```text
title
intuition
approach
solution
```

---

# Database Indexes

Create indexes:

```text
title
difficulty
status
tags
```

Create Mongo text index on:

```text
title
tags
notes
```

---

# APIs

All APIs must be protected by existing admin authentication middleware.

---

## Create Problem

```http
POST /api/admin/dsa
```

Creates a new problem.

---

## Get Problems

```http
GET /api/admin/dsa
```

Supports optional query parameters:

```http
?difficulty=Hard

?status=revision

?tag=graph

?difficulty=Hard&status=revision
```

Filters should work together.

---

## Search Problems

```http
GET /api/admin/dsa/search?q=segment tree
```

Search using Mongo text search.

Search fields:

- title
- tags
- notes

---

## Get Single Problem

```http
GET /api/admin/dsa/:id
```

---

## Update Problem

```http
PUT /api/admin/dsa/:id
```

---

## Delete Problem

```http
DELETE /api/admin/dsa/:id
```

---

## Update Status

```http
PATCH /api/admin/dsa/:id/status
```

Body:

```json
{
  "status": "revision"
}
```

Allowed values:

```text
todo
solved
revision
```

---

# Revision Tracking

Implement now.

When status changes to:

```text
revision
```

Update:

```text
lastRevisedAt
```

Add endpoint:

```http
POST /api/admin/dsa/:id/revise
```

Behavior:

- Increment revisionCount by 1
- Update lastRevisedAt

---

# Statistics API

Implement:

```http
GET /api/admin/dsa/stats
```

Return:

```json
{
  "total": 100,
  "todo": 10,
  "solved": 75,
  "revision": 15,
  "easy": 30,
  "medium": 50,
  "hard": 20
}
```

---

# Folder Structure

Follow existing backend architecture.

Suggested:

```text
models/
  dsa.model.ts

controllers/
  dsa.controller.ts

routes/
  dsa.routes.ts

services/
  dsa.service.ts
```

---

# Deliverables

Implement:

- Mongoose schema
- Validation
- CRUD APIs
- Search
- Filters
- Statistics endpoint
- Revision endpoint
- Route registration
- Authentication protection

Backend should be fully functional and ready for frontend integration.
