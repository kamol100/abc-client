# MikroTik Sync regression workspace

Both bugs reproduced on 2026-11-25 are fixed. FT033-13 and FT033-14 retain their original correctness assertions; FT033-15 covers the explicit whole-company choice and mobile dialog. All three pass. The generic acceptance scenarios remain pending.

See [MIKROTIK-SYNC-001](MIKROTIK-SYNC-001.md), [passing evidence](evidence/fixed-run.json), [historical failures](evidence/run.json), and [runner instructions](../../mikrotik-sync/README.md).

Run `MKS_E2E_SLOW_MO=450 npm run test:e2e:mikrotik-sync -- --headed`. The fixture uses generated accounts on registered CP/MK hosts and disposable SQLite. The runner prints the report directory containing videos, screenshots, and sanitized evidence. No existing records or real routers are used.
