function escapeField(value: string): string {
  if (
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsvHeader(row: Record<string, unknown>): string {
  return Object.keys(row).map(escapeField).join(',');
}

export function toCsvRows(rows: Record<string, unknown>[]): string {
  const headers = Object.keys(rows[0]);

  return rows
    .map((row) =>
      headers
        .map((h) => {
          const value = row[h];
          if (value === null || value === undefined) return '';
          return escapeField(String(value));
        })
        .join(',')
    )
    .join('\n');
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  return toCsvHeader(rows[0]) + '\n' + toCsvRows(rows);
}
