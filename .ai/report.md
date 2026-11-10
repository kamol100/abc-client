## Summary

The BTRC report download now saves the ISP Downstream Info workbook. The spreadsheet is built by the API. This app only requests that file and saves it.

## Frontend

- Client and reseller downloads fall back to `.xlsx` names: `BTRC_Clients_List.xlsx` and `BTRC_Resellers_List.xlsx`.
- The proxy route forwards the workbook content type.
- The button label is "Download XLSX Report" in English and Bangla.
- The reports marketing copy that listed the old columns now lists the downstream columns.

## Checks

- `npx vitest run tests/unit/reports/btrc-report.test.tsx`: 6 passed.
- `en.json` and `bn.json` both parse.

## Notes

- The logged-in download was not opened in the browser. No app session was running, and the file contents are covered by the API tests.
- Other marketing sentences outside the reports module still say XLS.
