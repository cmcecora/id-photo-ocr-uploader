# Frontend Guideline Document for id-photo-ocr-uploader

This document outlines the frontend setup, design choices, and best practices for the **id-photo-ocr-uploader** project. It’s written in everyday language to help anyone—from designers to new developers—understand how the application is built and maintained.

## 1. Frontend Architecture

**Core Stack**
- **Vite**: Our build tool. It starts almost instantly, rebuilds on file changes, and produces optimized bundles for production.  
- **React (with TypeScript)**: We build the UI as discrete, reusable components, with type safety from TypeScript.  
- **Tailwind CSS**: A utility-first CSS framework for rapid styling without naming battles.  
- **shadcn/ui**: A set of accessible, Tailwind-based UI components (buttons, inputs, cards).  
- **Lucide React**: A simple, lightweight icon library.  
- **TanStack Query**: Manages server data—uploads, queries, caching, retries, loading/error states.  
- **React Hook Form + Zod**: Handles form state, validation, and schema enforcement.  
- **Sonner**: A toast notification library for user feedback.  
- **ESLint & Prettier**: Maintain code consistency.  
- **Vitest & React Testing Library**: Unit and integration testing.  

**How It Supports Our Goals**  
- **Scalability**: Feature-based folders and a services/API layer keep code organized as the app grows.  
- **Maintainability**: TypeScript, ESLint, Prettier, along with clear abstractions (custom hooks, service functions), minimize bugs and easing handovers.  
- **Performance**: Vite’s fast rebuilds, Tailwind’s PurgeCSS to remove unused styles, code-splitting, and smart data fetching (cache + background refetch) all deliver a snappy UI.

## 2. Design Principles

1. **Usability**: Interfaces should feel intuitive. We use clear labels, tooltips, and consistent patterns (e.g., primary vs. secondary buttons).  
2. **Accessibility**: Semantic HTML, ARIA attributes where needed, keyboard-focus management, and proper color contrast ensure everyone can use the app.  
3. **Responsiveness**: Mobile-first approach—layouts adapt gracefully from phones to desktops.  
4. **Consistency**: Shared design tokens (colors, fonts, spacing) and shadcn/ui components guarantee a cohesive look.  
5. **Simplicity**: Avoid clutter—show only what’s necessary (e.g., show form fields only after a successful upload).  

### Applying These Principles
- **Buttons**: Primary actions (Upload, Save) use a distinct color. Disabled or readonly states are visually muted.  
- **Forms**: Inline validation messages and toast notifications (via Sonner) guide the user without blocking them.  
- **Layouts**: A two-column grid on desktop that stacks to single-column on mobile, using Tailwind’s responsive utilities.

## 3. Styling and Theming

**Approach**  
- Utility-first CSS with Tailwind. We don’t write long class names—just the building blocks (e.g., `flex`, `p-4`, `bg-white`, `rounded-lg`).  
- No BEM or SMACSS—Tailwind’s atomic classes keep styles local to components.  

**Preprocessor & Frameworks**
- Tailwind (no SASS).  
- All component-level overrides happen in the Tailwind config or via shadcn’s built-in theming.

**Visual Style**  
- **Design Tone**: Modern, flat design with subtle shadows and rounded corners.  
- **Optional Accent**: A light glassmorphism effect (semi-transparent backgrounds) for cards or modals can be toggled via CSS utilities if desired.

**Color Palette**  
- Primary: `#3B82F6` (Blue)  
- Secondary: `#6B7280` (Gray)  
- Accent: `#10B981` (Emerald)  
- Background: `#F9FAFB` (Light Gray)  
- Surface: `#FFFFFF` (White)  
- Error: `#EF4444` (Red)  
- Success: `#22C55E` (Green)

**Font**  
- **Primary Font**: Inter, fallback to system-ui.  
- Set in `tailwind.config.js`:  
```js
module.exports = {
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui'],
    },
  },
};
```

## 4. Component Structure

**Feature-Based Organization**  
- `src/features/id-scanner/`: Contains domain logic for ID scanning.  
  - `components/UploadPanel.tsx`  
  - `components/DataForm.tsx`  
  - `hooks/useIdUpload.ts` (TanStack Query mutation)  
  - `IDScannerPage.tsx` (layout + orchestration)  
  - `types.ts` (data shapes)  

**Shared Components**  
- `src/components/ui/`: Reusable UI elements (buttons, inputs, cards) from shadcn/ui.  
- `src/services/api.ts`: Central API calls (e.g., `uploadIdPhoto`).  
- `src/hooks/`: Global hooks (e.g., `useToast`, `useMobileBreakpoint`).

**Why Component-Based Architecture?**  
- **Reusability**: Build once, use everywhere (e.g., a custom Button).  
- **Testability**: Small, focused components are easier to test.  
- **Maintainability**: Clear boundaries—logic in hooks/services, UI in components.

## 5. State Management

1. **Local UI State**: React’s `useState` for simple toggles (e.g., `isEditing`).  
2. **Server/API State**: TanStack Query handles uploads, caching, retries, and background refetching.  
3. **Form State**: React Hook Form manages field values, dirty/pristine status, and integrates with Zod for schema validation.

**Data Flow Example**  
- `UploadPanel` calls `useIdUpload` → triggers `POST /api/id/upload`.  
- On success, mutation’s `data` passes extracted fields to the parent page.  
- `DataForm` uses `reset(data)` to populate inputs and toggles readonly state.  
- User clicks “Edit” → local state `isEditing` flips → form fields unlocked.  
- On “Save” → React Hook Form + another mutation to persist final data.

## 6. Routing and Navigation

- **React Router DOM** (optional): If the app remains a single page, you can skip routing.  
- To support multiple pages (e.g., history, dashboard):  
  - Install `react-router-dom`.  
  - Define routes in `App.tsx`:  
    ```jsx
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IDScannerPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
    ```
- Navigation menus or sidebars can use `<Link>` components for client-side transitions.

## 7. Performance Optimization

- **Vite**: Fast dev server and optimized production build.  
- **Code Splitting**: Dynamic `import()` for heavy components or pages.  
- **Lazy Loading**: React’s `lazy` + `Suspense` for non-critical UI parts (e.g., history page).  
- **Tailwind Purge**: Automatically removes unused CSS in production.  
- **Image Optimization**: Compress uploads on the server, serve optimized previews.  
- **Caching**: TanStack Query caches and dedupes requests, reducing UI flicker.

## 8. Testing and Quality Assurance

1. **Unit Tests**: Vitest + React Testing Library—test component rendering, hook logic (e.g., `useIdUpload`).  
2. **Integration Tests**: Test the upload → populate → save flow in a headless environment.  
3. **End-to-End Tests** (optional): Cypress or Playwright can simulate real user interactions in the browser.  
4. **Linting and Formatting**: ESLint enforces code conventions; Prettier auto-formats on save or pre-commit.  
5. **Type Checking**: TypeScript flags mismatches before they become bugs.  
6. **Error Boundaries**: Wrap top-level components to catch rendering errors and show user-friendly fallbacks.

## 9. Conclusion and Overall Frontend Summary

This frontend setup provides a modern, maintainable, and high-performance foundation for the **id-photo-ocr-uploader**. By combining Vite, React, Tailwind CSS, and a suite of complementary tools (TanStack Query, React Hook Form, shadcn/ui), you get:

- A fast development cycle with hot reloads and type safety.  
- Clear separation between UI, business logic, and data fetching.  
- Responsive, accessible interfaces that look and feel consistent.  
- Scalable architecture—feature folders, custom hooks, and centralized API services.  
- Built-in quality checks (linting, testing, type checks) and performance optimizations.

Whether you continue building new features (drag-and-drop uploads, dashboard pages, analytics) or hand off this project to another team, these guidelines ensure everyone has a shared understanding of how the frontend works—and how to keep it clean, fast, and user-friendly.