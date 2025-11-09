# Project Requirements Document: id-photo-ocr-uploader

## 1. Project Overview

The **id-photo-ocr-uploader** is a web application that lets users upload photos of identity documents (IDs) and automatically extracts text data (name, ID number, date of birth, etc.) from the image using an AI-powered OCR service. On the front end, users interact with a two-column layout: an Upload Panel on the left for file selection and a Data Form on the right that populates with the extracted text. A simple Save/Edit workflow allows users to review or adjust any fields before persisting the data to a backend database.

We’re building this tool to streamline manual data entry from physical IDs, reduce human error, and speed up on-boarding processes for services that require identity verification. Success is measured by accurate data extraction (minimum 90% field accuracy), a smooth user experience (upload-to-form load under 3 seconds), and seamless integration with our Node.js/Express and MongoDB backend.

## 2. In-Scope vs. Out-of-Scope

**In-Scope (MVP)**
- Drag-and-drop and click-to-select file upload (max 10 MB, image/png or image/jpeg).
- Client-side validation for file type and size with immediate error feedback (toast notifications).
- Preview of the selected image before upload.
- `POST /api/id/upload` endpoint to send the image to the server.
- Server-side call to an OCR AI model (e.g., Anthropic API) to extract text.
- JSON response mapping extracted fields:
  - ID Number
  - Last Name
  - First Name
  - Date of Birth
  - Issue Date
  - Expiration Date
- Two-column layout: left panel (UploadPanel) and right panel (DataForm).
- React Hook Form + Zod schema for form state, validation, and read-only/editable toggling.
- SAVE button to send corrected data to `POST /api/id/save` and store it in MongoDB.
- EDIT button to switch form fields from read-only to editable.
- Toast notifications (Sonner) for successes and failures.

**Out-of-Scope (Phase 2+)**
- User authentication or role-based access control.
- Multi-language support.
- Audit logs or change history.
- Bulk upload or batch processing.
- Dashboard, reporting, or analytics pages.
- CI/CD pipelines and automated deployments.

## 3. User Flow

A new visitor lands on the ID Scanner page. The left side shows a card labeled “Upload ID Photo” with drag-and-drop support and a “Choose File” button. The right side displays a disabled form with placeholders for ID fields, along with disabled SAVE and EDIT buttons. The user drags or selects a valid image file. If the image is too large or has the wrong format, an error toast pops up. Otherwise, a preview appears in the left card and the upload mutation begins automatically.

While the image is processing, a spinner appears in the left panel. Once the server returns extracted text, the Data Form on the right populates automatically and the SAVE/EDIT buttons become active. The user clicks EDIT to unlock the fields, makes any necessary corrections, then clicks SAVE. A second API call sends the finalized data to the server, storing it in MongoDB. A success toast confirms completion, and the form resets for a new upload.

## 4. Core Features

- **UploadPanel Component**: Drag-and-drop + click-to-select UI with preview, client-side validation, and loading state.
- **DataForm Component**: Displays extracted fields in read-only inputs, toggles to editable mode on EDIT, and validates changes.
- **IDScannerPage**: Two-column layout orchestrating UploadPanel and DataForm, manages shared state.
- **API Service Layer** (`src/services/api.ts`): Functions `uploadIdPhoto(file)` and `saveIdData(data)` that wrap fetch/axios calls.
- **Custom Hook** (`useIdUpload.ts`): Encapsulates TanStack Query mutation for image upload and onSuccess logic.
- **State Management**: React Hook Form for form state, Zod for schema validation, TanStack Query for server state.
- **Notifications**: Sonner toast for all user feedback (errors, success messages).
- **Error Boundary**: Global React Error Boundary to catch unexpected UI errors.

## 5. Tech Stack & Tools

- **Frontend**:
  - React (via Vite)
  - TypeScript
  - Tailwind CSS + shadcn/ui component library
  - Lucide React icons
  - TanStack Query (react-query)
  - React Hook Form + Zod
  - Sonner (toast notifications)
- **Backend**:
  - Node.js + Express
  - MongoDB (via Mongoose or your favorite ODM)
  - OCR AI integration (Anthropic API or equivalent)
- **Dev Tools**:
  - ESLint, Prettier, TypeScript
  - Vitest + React Testing Library for unit/integration tests
  - Vite path aliases (`@/`) for cleaner imports

## 6. Non-Functional Requirements

- **Performance**: Upload-to-form population under 3 seconds on average; form rendering under 100 ms.
- **Security**: HTTPS everywhere; sanitize user inputs; validate file types/sizes client & server side; store API keys in `.env`.
- **Usability**: Responsive design for mobile and desktop; accessible form controls (ARIA labels, keyboard navigation).
- **Reliability**: Retry logic on transient API failures (up to 2 retries).
- **Maintainability**: Clear module boundaries, centralized API layer, reusable hooks.

## 7. Constraints & Assumptions

- OCR AI service (Anthropic or equivalent) is reliably available and returns structured JSON.
- The environment supports Node.js v16+ and modern browser APIs (File API).
- All secrets (API keys, base URLs) are stored in environment variables.
- No user authentication in MVP; we assume a trusted environment.
- Backend and database are hosted and reachable from the front end (CORS configured).

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: The OCR service may throttle requests. Mitigation: implement client-side rate limiting or queueing.
- **Large File Uploads**: Browsers may choke on huge images; we cap at 10 MB and show errors.
- **CORS & Networking**: Ensure Express enables the correct CORS headers for the Vite dev server and production origin.
- **Error Handling**: Without robust onError callbacks, failed uploads or saves could leave the UI in an inconsistent state. Use TanStack Query’s `onError` and global Error Boundary.
- **Form Schema Drift**: If the OCR service returns unexpected fields, Zod schema validation may fail. Keep schema in sync or use permissive parsing with `unknown` fields.

---
This document captures the MVP requirements for the ID Photo OCR Uploader. It defines clear boundaries, user flows, features, and constraints so that any AI-driven or human-led technical spec (Tech Stack, Frontend/Backend Docs, File Structure) can be derived without gaps.