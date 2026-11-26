---
title: OLTs
summary: Open **OLTs**. The list is olts.access. Opening one OLT, testing the connection, polling, and reading its clients are stricter permissions and separate
keywords:
  - olts
language: en
translated_from_revision: "1"
---

Open **OLTs**. The list is olts.access. Opening one OLT, testing the connection, polling, and reading its clients are stricter permissions and separate guides. Do not put a management IP password in support.

## Ports

The OLT page has a **Ports** card under the status cards. **PON ports** lists each PON port with its status (Up, Link down, Disabled), since when it is down, ONUs online, clients affected, traffic, Tx power and temperature. **Uplink ports** lists the OLT's uplinks with speed and traffic; it is empty when the OLT reports no uplinks or its SNMP access gives no interface counters. **Show only problems** keeps the ports that are down or disabled. Click a column name to sort. The history button on a row opens that port's recent state changes. Port data comes from polling, so it needs saved SNMP access and polling turned on; the **NOC** page lists the ports that are down and the OLTs whose port data is off or out of date.
