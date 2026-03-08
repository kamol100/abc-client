# migrate-feature

You are migrating a **Settings feature** from an old **Next.js 14 (Flowbite UI)** project  
to a new **Next.js 16 project using the shadcn architecture**.

The goal is to **migrate functionality and behavior only**, not the original UI.

---

# STEP 1 — ANALYZE OLD FEATURE

Analyze the settings feature from the old project and extract:

- Core functionality
- Data structure
- API calls
- Business logic
- Tab structure

Do NOT replicate the old UI implementation.

Focus only on **how the feature works**, not **how it looks**.

---

# STEP 2 — NEW ARCHITECTURE DESIGN

The settings feature must follow the **new application architecture**.

### Navigation Changes

Old project:
- All settings were inside **one page**
- Navigation was done using **tabs**

New project:
- Create a **Settings parent menu**
- Each old **tab becomes a submenu page**

Example:

Old:
```

Settings Page

* General (tab)
* Billing (tab)
* SMS (tab)

```

New:
```

Settings (menu)

* General
* Billing
* SMS

```

Each submenu should have its **own page route**.

---

# STEP 3 — FORM INTERACTION RULES

The new settings UI must follow these interaction rules:

### 1. No Global Save Button
There must NOT be a global "Save" or "Edit" button.

---

### 2. Text / Textarea Fields

Each field must behave like **inline editing**:

Default state:
```

Value  [edit icon]

```

When edit icon is clicked:
```

[input field]

[Save] [Cancel]

```

Behavior:
- Save → send update API request
- Cancel → revert to previous value

---

### 3. Switch Fields

Switch fields must:

- Immediately trigger **API update on toggle**
- Persist changes in database

Example:
```

Enable SMS  [ON/OFF]

```

---

### 4. Dropdown Fields

Dropdowns must:

- Trigger API update **immediately on change**
- No save button required

---

# STEP 4 — FORM BUILDER USAGE

Use the **FormBuilder component** to implement settings forms.

Requirements:

- Reuse FormBuilder where possible
- Extend FormBuilder API **only if necessary**
- Do NOT break existing functionality
- Maintain backward compatibility

Possible extensions may include:

- Inline editing mode
- Field-level save actions
- Immediate update handlers

---

# IMPLEMENTATION GUIDELINES

- Follow the **new shadcn project structure**
- Keep components **modular and reusable**
- Maintain **consistent API patterns**
- Avoid copying old UI code
- Extract only the **logic and behavior**

-----------------------------------------
IMPORTANT
-----------------------------------------
# API POST payload sample
  - when saving or updating any setting must follow this pattern
  - every field can be nullabel and optional
 settings:{
  "gmap_api": "8221f92780e18b7a1eaba188861adf55",
  "invoice_due_reminder_channel": "voice",
  "telegram_vendor_delete": null
}

# EXPECTED OUTPUT

1. Feature analysis summary
2. New settings structure
3. Required routes/pages
4. FormBuilder adjustments (if needed)
5. Implementation plan for the migrated settings feature
```
