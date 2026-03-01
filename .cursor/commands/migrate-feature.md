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
/components/{feature}/{feature}-type.ts        — Zod schemas + types (RowSchema, FormSchema, Refs)
/components/{feature}/{feature}-form-schema.ts — UI form field config (AccordionSection[] / FormFieldConfig[])
/components/{feature}/{feature}-form.tsx       — Form component (uses AccordionFormBuilder or FormBuilder)
/components/{feature}/{feature}-column.tsx     — TanStack Table column definitions
/components/{feature}/{feature}-table.tsx      — List page with DataTable + useApiQuery
/components/{feature}/{feature}-filter-schema.ts — Filter field config (optional, if table has filters)
/hooks/use-{feature}.ts (if needed)

Rules:
- Server Components by default
- "use client" only where required
- Extract types into {feature}-type.ts following this structure:
  - Ref schemas for nested objects (e.g. RoleRefSchema, UserRefSchema)
  - Sub-schemas for reusable parts (e.g. SalaryItemSchema)
  - RowSchema with .passthrough() for API list/table responses
  - FormSchema for form validation only (no API response fields like id, relations)
  - Export distinct types: {Feature}Row, {Feature}FormInput, {Feature}Payload
  - Reference: zone-type.ts, sub-zone-type.ts
- Use translation according i18next
- Must use metadata title on page.tsx component
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
- Must follow theme setting
- Ensure mobile first design
- Ensure using ActionButton (components/action-button.tsx) instead Button
- Ensure the dynamic form UI looks clean and well-structured. For example, when multiple items are added by clicking the plus button, the delete (trash) icon should be properly aligned with each item in the list.

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
   - Support dark/light mode and theme setting

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