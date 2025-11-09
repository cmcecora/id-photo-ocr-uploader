# Security Guidelines for id-photo-ocr-uploader

## Introduction
This document provides comprehensive security guidelines for the **id-photo-ocr-uploader** application, a React/Vite frontend paired with a Node.js/Express backend for uploading ID photos and extracting text via AI. It consolidates security best practices into actionable controls, ensuring confidentiality, integrity, and availability throughout the system.

---

## 1. Security by Design & Core Principles
- **Embed Security Early:** Incorporate threat modeling and risk assessment at the start of each feature sprint.  
- **Least Privilege:** Grant services, database users, and frontend components only the permissions they require.  
- **Defense in Depth:** Layer controls (network, application, data) so that a breach in one layer does not compromise the entire application.  
- **Fail Securely:** Default to denying access on errors; avoid exposing stack traces or sensitive configuration details in responses.  
- **Secure Defaults:** All new endpoints, configurations, and third-party integrations must default to the most restrictive settings.

---

## 2. Authentication & Access Control
1. **Authentication**  
   - Require user authentication (JWT or session cookies) for all upload and data-entry endpoints (`POST /api/id/upload`, `POST /api/id/save`, etc.).  
   - Use industry-standard password hashing (bcrypt or Argon2) with unique salts if you manage user credentials.
2. **Session & Token Management**  
   - If using JWT, sign with a strong secret (at least 256 bits), validate `alg`, `exp`, and reject tokens signed with `none`.  
   - Enforce short-lived tokens (e.g., 15 min) with refresh tokens stored securely (HttpOnly, Secure cookies).  
   - Rotate tokens on logout or password change; revoke refresh tokens when compromised.
3. **Role-Based Access Control (RBAC)**  
   - Define roles (e.g., `user`, `admin`).  
   - Authorize every protected route server-side; never rely on client-side checks.  
   - Enforce server-side permission validation for data persistence operations.
4. **Multi-Factor Authentication (MFA)**  
   - Require MFA (TOTP, SMS, or authenticator app) for administrative operations or bulk downloads of ID records.

---

## 3. Input Handling & Processing
1. **File Upload Validation**  
   - Accept only known MIME types (`image/jpeg`, `image/png`).  
   - Enforce a maximum file size (e.g., 10 MB) on both client and server.  
   - Validate file headers (magic numbers) server-side.  
   - Sanitize and normalize filenames; store uploads with generated UUID names to prevent path traversal.
2. **Command & Injection Prevention**  
   - Use parameterized queries or a vetted ORM when interacting with the database.  
   - Avoid dynamically constructing shell commands; if required, use safe libraries and whitelist inputs.
3. **Cross-Site Scripting (XSS) & Template Injection**  
   - Escape or encode any user-provided strings before rendering in the UI.  
   - Use React’s built-in escaping; avoid `dangerouslySetInnerHTML` unless sanitized with a proven library.
4. **Redirect & Forward Validation**  
   - If implementing redirects after login or upload, validate destination URLs against an allow-list.

---

## 4. Data Protection & Privacy
1. **Encryption in Transit**  
   - Enforce HTTPS/TLS 1.2+ for all frontend-backend and backend-third-party communications.  
   - Use HSTS with `max-age` and `includeSubDomains` headers.
2. **Encryption at Rest**  
   - Encrypt sensitive database columns (PII, extracted text) using AES-256 or a managed encryption service.  
   - Store uploaded images in an encrypted object store (e.g., AWS S3 with SSE).
3. **Secrets Management**  
   - Never hardcode API keys or database credentials.  
   - Use a secrets manager (AWS Secrets Manager, HashiCorp Vault) and inject at runtime.  
   - Rotate secrets regularly and audit access logs.
4. **Data Minimization & Retention**  
   - Collect and store only the fields strictly necessary for OCR and business logic.  
   - Implement data-retention policies; automatically purge stale or user-deleted records to comply with GDPR/CCPA.
5. **Logging & Monitoring**  
   - Log authentication attempts, upload failures, and suspicious API usage at INFO or WARN levels.  
   - Mask or redact PII in logs; ensure logs are stored in a centralized, access-controlled system.

---

## 5. API & Service Security
1. **HTTPS & CORS**  
   - Serve all APIs exclusively over HTTPS.  
   - Configure CORS to allow only your frontend origin(s); avoid wildcards.
2. **Rate Limiting & Throttling**  
   - Apply per-user and per-IP rate limits on file upload and form-save endpoints to mitigate brute-force and DoS attacks.
3. **Input Validation**  
   - Centralize request schema validation using a library such as Zod on the server.  
   - Reject invalid payloads with `400 Bad Request` without revealing schema details.
4. **Least Privilege for Services**  
   - Ensure the Node.js service account can only write to the specific database collections/tables it needs.
5. **Versioning & Deprecation**  
   - Version your API (e.g., `/api/v1/id/upload`).  
   - Maintain backward compatibility or gracefully deprecate old versions with advance notice.

---

## 6. Web Application Security Hygiene
- **Content Security Policy (CSP):** Define a strict CSP to restrict script, style, and image sources.  
- **Security Headers:**  
  - `X-Frame-Options: DENY`  
  - `X-Content-Type-Options: nosniff`  
  - `Referrer-Policy: same-origin`  
- **CSRF Protection:**  
  - For stateful operations, implement CSRF tokens (Synchronizer or Double Submit Cookie pattern).  
- **Cookies:**  
  - Set `HttpOnly`, `Secure`, and `SameSite=Strict` on session or refresh-token cookies.  
- **Clickjacking Defense:**  
  - Leverage `frame-ancestors 'none'` in CSP or `X-Frame-Options` header.
- **Client Storage:**  
  - Avoid storing PII or JWTs in `localStorage`; prefer secure, HttpOnly cookies or in-memory storage.

---

## 7. Infrastructure & Configuration Management
1. **Server Hardening**  
   - Disable unused services and ports; run only required processes.  
   - Keep the operating system and packages up-to-date with security patches.
2. **Environment Segregation**  
   - Separate dev, staging, and production environments; enforce stricter controls in production.  
   - Disable debug endpoints and verbose error messages in production builds.
3. **Secure TLS Configuration**  
   - Disable weak ciphers (SSLv3, TLS 1.0/1.1).  
   - Use strong cipher suites (e.g., ECDHE-RSA-AES256-GCM).
4. **File System Permissions**  
   - Restrict read/write permissions to only the application user.  
   - Store uploaded files outside the webroot with minimal privileges.

---

## 8. Dependency Management & CI/CD Security
1. **Vet & Lock Dependencies**  
   - Maintain lockfiles (`package-lock.json`) and audit periodically with `npm audit` or `Snyk`.  
   - Remove unused packages to reduce attack surface.
2. **Automated Security Scanning**  
   - Integrate SCA tools in CI (GitHub Actions, Jenkins).  
   - Fail builds on critical/high CVEs.
3. **CI/CD Best Practices**  
   - Store build and deployment credentials in a secure vault.  
   - Enforce code reviews and static analysis (ESLint, Prettier).  
   - Run unit and integration tests (Vitest, React Testing Library) on every pull request.
4. **Secret Scanning**  
   - Enable secret-scanning alerts in your repository to detect accidental commits of credentials.

---

## Conclusion
Adhering to these guidelines will harden the id-photo-ocr-uploader application against common threats, ensure compliance with data-protection regulations, and maintain user trust. Regularly review and update practices to address emerging security challenges and evolving architectural changes.

**Next Steps:**  
- Perform an initial security assessment and penetration test.  
- Schedule quarterly reviews of dependencies and infrastructure configurations.  
- Integrate continuous monitoring and alerting for anomalous activities.

*Secure by design, continually verified.*