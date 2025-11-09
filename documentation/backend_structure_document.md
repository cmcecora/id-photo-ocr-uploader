# Backend Structure Document

This document outlines the backend setup for the ID Photo Upload & AI Text Extraction tool. It covers the architecture, database, APIs, hosting, infrastructure, security, and maintenance practices in clear, everyday language.

## 1. Backend Architecture

**Overall Design**
- We use Node.js and Express to create a simple, layered server.  
- Requests come in through routes, get handled by controllers, and the actual work happens in service functions.  
- This keeps our code organized: routes only define the URL and HTTP method, controllers extract data from the request, and services do the heavy lifting (calling AI APIs, saving data to the database).

**Scalability, Maintainability, Performance**
- The server is stateless—each request stands on its own—so we can run many instances behind a load balancer.  
- Clear separation of concerns (routes → controllers → services) makes it easy to add new features or swap out components.  
- Middleware like compression and caching (if enabled) ensure requests are handled quickly.

## 2. Database Management

**Technology**
- We use **MongoDB**, a NoSQL database, to store extracted ID data.  
- We interact with MongoDB via **Mongoose**, which provides a schema layer and validation.

**Data Storage and Access**
- Data is stored as JSON-like documents in a single collection.  
- Mongoose schemas validate data before it’s saved.  
- We use indexes on key fields (e.g., ID number) for fast lookups.  
- Connection settings (database URL, credentials) live in environment variables.

## 3. Database Schema

**Document Structure (in plain language)**
Each entry in the `idRecords` collection represents one uploaded ID and includes:
- A unique record ID  
- The URL or path to the uploaded photo  
- The raw text returned by the AI OCR service  
- Parsed fields (like ID number, first and last name, date of birth, expiration date)  
- Timestamps for when the record was created and last updated  

**Example Mongoose Schema (for reference)**
```js
const IdRecordSchema = new mongoose.Schema({
  photoUrl: String,
  rawText:   String,
  fields: {
    idNumber:      String,
    firstName:     String,
    lastName:      String,
    dateOfBirth:   Date,
    expirationDate: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

## 4. API Design and Endpoints

We follow a simple RESTful style:

- **POST /api/id/upload**  
  Purpose: Accept a photo file, forward it to the AI OCR service, and return extracted text.  
  Input: multipart/form-data with key `photo`  
  Output: JSON containing raw text and parsed fields.

- **POST /api/id/save**  
  Purpose: Save edited ID data (after user review) into the database.  
  Input: JSON with record ID (optional), parsed fields, and photo URL  
  Output: JSON confirming save success and returning the saved record.

- **GET /api/id/:id**  
  Purpose: Retrieve a saved record by its unique ID.  
  Output: JSON with all stored fields and metadata.

- **GET /api/health**  
  Purpose: Simple health check endpoint.  
  Output: `{ status: 'OK' }`

## 5. Hosting Solutions

We host the backend on **AWS** using the following services:
- **Elastic Beanstalk** (or **ECS Fargate**) to run our Dockerized Node.js application.  
- **MongoDB Atlas** for a managed database cluster, ensuring automated backups and high availability.

**Why this setup?**
- **Reliability:** AWS guarantees uptime and automatic restarts.  
- **Scalability:** We can scale instances up or down based on traffic.  
- **Cost-effectiveness:** Pay only for the compute hours and database storage you use.

## 6. Infrastructure Components

- **Load Balancer (AWS ALB):** Distributes incoming HTTP(S) requests across multiple application instances.  
- **Autoscaling Group:** Automatically adds or removes server instances based on CPU or request load.  
- **CDN (Amazon CloudFront):** If we serve any static assets (logs, docs), CloudFront caches them globally for fast delivery.  
- **Optional Caching (Redis):** For very frequent reads, we can add a Redis layer to store recent responses.

These parts work together so users experience quick responses even under heavy load.

## 7. Security Measures

- **HTTPS Everywhere:** All traffic is encrypted using TLS certificates from AWS Certificate Manager.  
- **Helmet Middleware:** Sets HTTP headers to protect against common vulnerabilities.  
- **CORS Configuration:** Only allows our front-end domain to talk to the API.  
- **Input Validation & Sanitization:** We validate incoming files and form data to prevent injection attacks.  
- **Environment Variables:** Secrets (API keys, database credentials) never live in code—only in secure env vars.  
- **Database Encryption at Rest:** Provided by MongoDB Atlas by default.

## 8. Monitoring and Maintenance

- **Logging (Winston):** All requests, errors, and important events are logged. Logs are stored centrally in AWS CloudWatch.  
- **Health Metrics:** CPU, memory, response times, and error rates are tracked in CloudWatch dashboards.  
- **Alerts:** Set up alarms for high error rates or server CPU spikes; notifications go to our on-call channel.  
- **Automated Backups:** The database is backed up daily, with point-in-time recovery enabled.  
- **Dependency Updates:** We run a weekly process to check for and apply security patches to Node.js and npm packages.

## 9. Conclusion and Overall Backend Summary

This backend is a lean, scalable Node.js and Express service backed by MongoDB. It handles image uploads, calls an AI OCR service, and stores user-reviewed data. Hosted on AWS with load balancing, autoscaling, and managed databases, it delivers high reliability at a reasonable cost. Security, monitoring, and clear code structure ensure the system remains robust, maintainable, and ready for future growth.