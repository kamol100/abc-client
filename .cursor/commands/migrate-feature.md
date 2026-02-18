# migrate-feature

You are migrating a feature from an old Next.js 14 project (Flowbite-based)
to a new Next.js 16 project using:

- App Router
- Server/Client Components Depend On Context
- shadcn/ui
- Strict TypeScript
- TanStack Query
- React Hook Form + Zod
- Proper separation of server/client logic
- Clean scalable architecture

Your task is to migrate ONE feature at a time.

-----------------------------------------
STEP 1 — ANALYZE OLD FEATURE
-----------------------------------------

1. Analyze the provided old feature files.
2. Identify:
   - UI components used (Flowbite parts)
   - Business logic
   - API calls
   - State management pattern
   - Form handling
   - Validation
   - Table logic
   - Side effects
   - Permissions (if any)

3. Extract:
   - Feature name
   - Data types
   - API endpoints
   - Reusable logic

-----------------------------------------
STEP 2 — DESIGN NEW ARCHITECTURE
-----------------------------------------

Design the new feature following this structure:

/components/{feature}
/components/{feature}/columns.tsx
/components/{feature}/{feature}-form.tsx
/components/{feature}/{feature}-schema.ts
/components/{feature}/{feature}-types.ts
/lib/api/{feature}.ts
/hooks/use-{feature}.ts (if needed)

Rules:
- Server Components by default
- "use client" only where required
- Extract types
- Use translation according i18next
- Use Zod for validation
- Use TanStack Query for fetching
- Replace Flowbite with shadcn components
- Use proper loading + error states
- Except button skeleton loader is priority
- No any types
- Full strict typing
- No duplicated logic
- Reusable abstraction when possible
- Never update shadcn core files like components/ui
- For re-usable method/function update lib/helper/helper.ts 

-----------------------------------------
STEP 3 — MIGRATION RULES
-----------------------------------------

1. Convert Flowbite:
   - Follow current architecture
   - Flowbite Button → shadcn Button
   - Flowbite Modal → shadcn Dialog
   - Flowbite Table → shadcn Table
   - Flowbite Input → shadcn Input
   - Flowbite Select → shadcn Select

2. Improve:
   - Remove unnecessary client components
   - Move fetch to server if possible
   - Add proper type inference
   - Add error boundary compatibility
   - Support dark/light mode

3. Use:
   - React Hook Form + Zod resolver
   - TanStack Query for client fetching
   - Suspense when useful

-----------------------------------------
STEP 4 — OUTPUT FORMAT
-----------------------------------------

Return:

1. 🧠 Architecture Explanation
2. 📁 New Folder Structure
3. 🧾 All new TypeScript types
4. 🧩 New shadcn components
5. 🔄 Refactored API logic
6. 🚀 Final improved version

If something from the old feature is poorly designed,
improve it instead of copying it.

-----------------------------------------
IMPORTANT
-----------------------------------------

- Do NOT blindly copy code.
- Always modernize to Next 16 standards.
- Always improve type safety.
- Make it scalable and future-proof.
- Keep UI consistent with shadcn theme.
- Follow SOLID principles.

Wait for old feature files before starting.
Before giving code, list the possible mistakes and confirm the rules. 