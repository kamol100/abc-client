"use client";

import { useSettings } from "@/context/app-provider";

export default function table() {
  const { settings: setting } = useSettings();
  return (
    <div className="flex flex-col h-[calc(100vh-40px)]">
      {/* Header (can be shown/hidden dynamically) */}
      {setting?.show_table_header && (
        <div className="shrink-0">
          <h1 className="p-4 bg-gray-200 h-20">Table Header</h1>
        </div>
      )}

      {/* Table wrapper takes remaining space */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full border border-gray-300">
          <thead className="sticky top-0 bg-white shadow">
            <tr>
              <th className="p-2 border">Column 1</th>
              <th className="p-2 border">Column 2</th>
              <th className="p-2 border">Column 3</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 100 }).map((_, i) => (
              <tr key={i}>
                <td className="p-2 border">Row {i + 1} - Col 1</td>
                <td className="p-2 border">Row {i + 1} - Col 2</td>
                <td className="p-2 border">Row {i + 1} - Col 3</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
