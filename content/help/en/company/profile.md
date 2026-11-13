---
title: Company profile
summary: Open **Company profile** or a reseller profile. The screen checks company-settings.access before it requests company/profile or reseller/profile. The API
keywords:
  - company profile
language: en
translated_from_revision: "1"
---

Open **Company profile** or a reseller profile. The screen checks company-settings.access before it requests company/profile or reseller/profile. The API route names are company.profile.view and reseller.profile.view, which are not the same strings and are not in the permission snapshot. If the profile does not load, that mismatch is the reason. Editing needs company-settings.edit.
