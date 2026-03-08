
Migrate the **SMS Send feature** from the old project to the new architecture with some improvements.

Follow the migration guideline defined in
`@shadcn-isp-client/.cursor/commands/migrate-feature.md`.

Analyze the old implementation from:

```
@isp-client/components/sms-sent/
```

Focus on **functionality only** — UI will follow the new project components and patterns.

---

# Feature Changes (Important)

In the **old project** the SMS feature had **two tabs**:

* `Single SMS`
* `Bulk SMS`

In the **new project**, both features must be merged into **one single page**.

---

# Default Page Layout

The page should contain these fields:

1. **Phone Number Field**
2. **SMS Template Dropdown**
3. **SMS Body Textarea**

### Default Behavior

* Users can **send SMS to any number manually**
* Required fields:

  * `phone_number`
  * `sms_body`
* SMS can be sent **without selecting a template**

---

# Template Behavior

When a user **selects a template** from the dropdown:

A **client table must appear under the SMS body field**.

### Table Requirements

* Client list with **filter options**
* **Filters must be visible by default** (no hide/show toggle)
* Provide a **Sort Option**:

  * Active Clients
  * Inactive Clients
  * All Clients

---

# SMS Count Behavior

Display the **total SMS count that will be sent**.

Example:

* Table pagination: **10 items per page**
* Page 1 → 10 clients
* Page 2 → 5 clients

Total SMS = **15**

The **"All Clients" option must include a tooltip** explaining this behavior.

### Tooltip Example

```
This will send SMS to all clients that match the current filters.
Example: If 10 clients are shown per page and there are 15 total clients,
then 15 SMS will be sent.
```

The **SMS count indicator must always display the number of SMS that will be sent**.

---

# Implementation Notes

* Follow **new project architecture**
* Use **existing table, filter, and form components**
* Reuse **template logic from old project**
* Ensure **manual SMS and bulk SMS work together on the same page**

