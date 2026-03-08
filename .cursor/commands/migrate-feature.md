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
- Use translation via i18next — see STEP 4 (Translation Workflow)
- Must use metadata title on page.tsx component
- Use the invoice-form.tsx (shadcn-isp-client/components/invoices/invoice-form.tsx) structure as a reference for the dynamic form section.
- Always try to use the FormBuilder component to generate forms. You may refactor the builder if needed, but do not break any existing functionality. If you encounter a special case where using FormBuilder seems impossible, ask me a clarifying question using the AskUserQuestion tool.
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
- Ensure mobile first design according tailwind css.
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
STEP 4 — TRANSLATION WORKFLOW (MANDATORY)
-----------------------------------------

Every migrated or new feature MUST have full translation coverage.
No hardcoded user-facing strings inside components — always use `t()` from `useTranslation()`.

1. Identify all translatable strings in the feature:
   - Menu items and navigation titles
   - Page titles and headings
   - Form field labels, placeholders, and tooltips
   - Validation error messages
   - Button text (Submit, Cancel, Delete, etc.)
   - Table column headers
   - Toast/notification messages
   - Empty states and status labels

2. Add keys to BOTH language files:
   - `public/lang/en.json` — English
   - `public/lang/bn.json` — Bangla

3. Key structure and naming conventions:

   Menu items → nested under `menu`:
   ```json
   "menu": {
     "{feature}": {
       "title": "Feature Name",
       "{sub_item}": { "title": "Sub Item" }
     }
   }
   ```

   Form fields → nested under `{feature}`:
   ```json
   "{feature}": {
     "{field_name}": {
       "label": "Field Label",
       "tooltip": "Helper text",
       "placeholder": "Placeholder text",
       "errors": {
         "required": "Field is required",
         "min": "Must be at least N characters"
       }
     }
   }
   ```

4. Key naming rules:
   - Use snake_case for multi-word keys (e.g. `income_expense`, `device_type`)
   - Group by feature at top level, then by field/section
   - Keep nesting shallow — max 3–4 levels deep
   - Every key in `en.json` MUST have a matching key in `bn.json` (and vice versa)

5. Bangla translation rules:
   - Use transliterated technical terms, NOT literal Bengali translations
   - Examples:
     - "Dashboard" → "ড্যাশবোর্ড" (NOT "পরিচালনা প্যানেল")
     - "Invoice" → "ইনভয়েস", "Payment" → "পেমেন্ট"
     - "Network" → "নেটওয়ার্ক", "Device" → "ডিভাইস"
     - "Package" → "প্যাকেজ", "Settings" → "সেটিংস"
   - For error messages, use natural Bangla phrasing:
     - "Name is required" → "নাম আবশ্যক"
     - "Enter the email address" → "ইমেইল ঠিকানা দিন"

6. Usage in components:
   ```tsx
   // Labels & placeholders
   <Label>"{feature}.{field}.label"</Label>
   // Menu titles
   title: "menu.{feature}.title"
   // Error messages (in Zod or form-schema)
   { required_error: "{feature}.{field}.errors.required" }
   //page.tsx title
    title: i18n.t("expense_type.title_plural")
   ```

7. If the feature adds a new menu item, update `hooks/use-menu-items.ts`
   with the corresponding `t("menu.{feature}.title")` call.

8. Validation checklist before completing migration:
   - [ ] No hardcoded strings in any component
   - [ ] All keys exist in both `en.json` and `bn.json`
   - [ ] Key structure is identical between both files
   - [ ] Bangla uses transliterated terms for technical words
   - [ ] `useTranslation()` is imported and used in every client component with text

-----------------------------------------
STEP 5 — OUTPUT FORMAT
-----------------------------------------
   - Prefer using custom components built on top of shadcn. Only use the core shadcn components if a suitable custom component is not available.

   ✅ **Correct:**
```customComponent
import Card from '@components/Card';
import ActionButton from "@/components/action-button";
```

❌ **Wrong:**
```typescript
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
```
-----------------------------------------
STEP 6 — OUTPUT FORMAT
-----------------------------------------

Return:

1. 🧠 Architecture Explanation
2. 📁 New Folder Structure
3. 🧾 All new TypeScript types
4. 🧩 New shadcn components
5. 🔄 Refactored API logic
6. 🌐 Translation keys (en.json + bn.json additions)
7. 🚀 Final improved version

If something from the old feature is poorly designed,
improve it instead of copying it.

-----------------------------------------
IMPORTANT
-----------------------------------------

- Do NOT blindly copy code.
- Use FormBuilder unless it impossible.
- Always modernize to Next 16 standards.
- Always improve type safety.
- Make it scalable and future-proof.
- Keep UI consistent with shadcn theme.
- Follow SOLID principles.
- NEVER hardcode user-facing strings — always use translation keys.
- ALWAYS update both en.json and bn.json with identical key structures.

Wait for old feature files before starting.
Before giving code, list the possible mistakes and confirm the rules. 