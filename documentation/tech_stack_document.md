# Tech Stack Document

This document explains the key technology choices behind the **ID Photo Upload & AI Text Extraction Tool**, using everyday language so everyone—from business stakeholders to designers—can understand why each piece was chosen and how it fits together.

---

## Frontend Technologies

We chose modern, high-quality tools to build a fast, responsive, and easy-to-maintain user interface:

- **Vite**
  • A lightning-fast build tool that offers instant feedback during development (hot-module reloading) and optimizes code for production (tree shaking).

- **React**
  • A component-based library that lets us break the UI into small, reusable pieces like `UploadPanel` and `DataForm`.

- **TypeScript**
  • Adds simple type checks to JavaScript, catching mistakes early and making the code more predictable.

- **Tailwind CSS**
  • A utility-first styling framework. Instead of writing custom CSS files, we apply small, composable classes directly in our markup to build layouts quickly (e.g., two-column on desktop, stacked on mobile).

- **shadcn/ui**
  • A ready-made set of accessible UI components (buttons, inputs, cards) that match Tailwind’s approach, helping us keep the look-and-feel consistent.

- **Lucide React**
  • A simple, open-source icon library. We use these icons for buttons and status indicators.

- **TanStack Query (React Query)**
  • Manages all server communication. It handles loading, error, and success states automatically, so we can show spinners or error messages without writing complex code.

- **React Hook Form + Zod**
  • **React Hook Form** manages form state (values, validation, `readonly` vs. `editable`).
  • **Zod** defines a clear schema for each field (e.g., `firstName` must be a string), ensuring data is valid before submission.

- **Sonner**
  • A toast notifications library. Whenever the user makes a mistake (wrong file type, too large, OCR fails), we show a quick, friendly message.

- **react-dropzone** (optional)
  • If we want drag-and-drop file uploads, this library makes it easy to add that interaction.

- **ESLint & Prettier**
  • Enforce consistent code style and catch common errors before code is merged.

- **Vitest & React Testing Library**
  • Provide unit and integration tests for components like `UploadPanel` and `DataForm`, ensuring reliability as the project grows.

---

## Backend Technologies

The backend powers file uploads, calls the AI service, and stores data. We selected tools that are well-known, easy to scale, and simple to maintain:

- **Node.js + Express**
  • A lightweight server framework that handles HTTP requests (e.g., `POST /api/id/upload`) and routing.

- **MongoDB**
  • A flexible, document-oriented database that stores structured OCR results and user-edited data.

- **Mongoose** (or native MongoDB driver)
  • Defines data models (schemas) right in the code, making it easy to read and update records.

- **Axios or Fetch API**
  • Used in a centralized service layer (`src/services/api.ts`) to send requests from the frontend to the Express server.

- **Anthropic API**
  • A third-party AI service that performs the OCR (extracts text from the uploaded photo).

- **Custom Hooks (e.g., `useIdUpload`)**
  • Encapsulate upload logic with TanStack Query, keeping components focused on how things look rather than how data flows.

---

## Infrastructure and Deployment

We set up a modern workflow so that releasing updates is predictable and reliable:

- **Git & GitHub**
  • Version control system and code hosting. Every change is reviewed in a pull request, ensuring quality.

- **GitHub Actions (CI/CD)**
  • Automatically runs linting, tests, and builds whenever code is pushed. On success, it can deploy the latest version.

- **Hosting**
  • **Frontend**: Vercel or Netlify—both support Vite out of the box and give instant global delivery.
  • **Backend**: Heroku, Vercel serverless functions, or another Node-friendly platform for easy scaling.

- **Environment Variables**
  • Sensitive keys (Anthropic API token, database URL) live in a `.env` file and never get checked into Git.

---

## Third-Party Integrations

To deliver key features without reinventing the wheel, we’ve integrated these services:

- **Anthropic API**
  • Provides AI-powered OCR for extracting text from ID photos.

- **Sonner**
  • Displays toast notifications for validation errors or success messages.

- **Lucide Icons**
  • Supplies consistent, lightweight SVG icons.

- **react-dropzone**
  • (Optional) Enables drag-and-drop file uploads in the `UploadPanel`.

---

## Security and Performance Considerations

We’ve built in safeguards and optimizations to keep the app secure and fast:

- **Authentication & Authorization**
  • (If needed) You can layer on JWT or session-based auth in Express to protect routes.

- **Input Validation**
  • Zod schemas validate every form field on the frontend. The backend repeats validation before saving data.

- **Error Handling**
  • TanStack Query `onError` callbacks and React Error Boundaries catch and display unexpected issues.

- **Rate Limits & File Size Checks**
  • Frontend enforces a maximum file size (10 MB) and allowed types (`.jpg`, `.png`).

- **HTTPS Everywhere**
  • Both frontend and backend run over HTTPS to keep data in transit encrypted.

- **Performance**
  • Vite’s build step optimizes assets (minification, code splitting).
  • TanStack Query caches API responses, reducing unnecessary network calls.
  • Tailwind CSS purges unused styles, keeping the CSS bundle small.

---

## Conclusion and Overall Tech Stack Summary

We selected this stack to hit three main goals:

1. **Speed of Development**: Vite + React + shadcn/ui + Tailwind let us prototype and iterate quickly.
2. **Reliability & Maintainability**: TypeScript, ESLint, Prettier, and well-tested code ensure long-term quality.
3. **Scalability & Extensibility**: The clear separation of frontend, backend, and service layers makes it easy to add features (e.g., user accounts, history pages) later.

In short, this combination of tools delivers a polished, responsive user experience for uploading ID photos, extracting text via AI, editing results, and saving them—all while keeping the codebase clean, secure, and ready for future growth.