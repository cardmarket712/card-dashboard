export const num = (n: number, d = 0) =>
  n.toLocaleString("ko-KR", { maximumFractionDigits: d });
export const money = (n: number) =>
  n >= 10000 ? `${num(n / 10000, 2)}조원` : `${num(n, 1)}억원`;
export function csv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  const blob = new Blob(
    [
      "\uFEFF" +
        [headers, ...rows.map((r) => headers.map((h) => r[h]))]
          .map((r) => r.map(escape).join(","))
          .join("\r\n"),
    ],
    { type: "text/csv;charset=utf-8;" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name + ".csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
