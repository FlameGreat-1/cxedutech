export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(escapeField).join(',');

  const dataLines = rows.map((row) =>
    headers
      .map((h) => {
        const value = row[h];
        if (value === null || value === undefined) return '';
        return escapeField(String(value));
      })
      .join(',')
  );

  return [headerLine, ...dataLines].join('\n');
}

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
