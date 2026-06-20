import type {
  RevenueDataPoint,
  MetricSummary,
  ServicePopularity,
  AIInsight,
  BusinessHealth,
} from "./analytics-mock-data";

function escapeCsv(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatNumber(n: number): string {
  return n.toLocaleString("ru-RU");
}

export function exportAnalyticsCsv(
  revenue: RevenueDataPoint[],
  services: ServicePopularity[],
  metrics: MetricSummary,
  filename = "analytics-report",
) {
  const lines: string[] = [];

  lines.push("=== КЛЮЧЕВЫЕ МЕТРИКИ ===");
  lines.push("Метрика,Значение");
  lines.push(`LTV клиента,₽${formatNumber(metrics.ltv)}`);
  lines.push(`Средний чек,₽${formatNumber(metrics.avgCheck)}`);
  lines.push(`Конверсия,${metrics.conversionRate}%`);
  lines.push(`Retention rate,${metrics.retentionRate}%`);
  lines.push(`Рост дохода,${metrics.revenueGrowth}%`);
  lines.push(`Рост клиентов,${metrics.clientGrowth}%`);
  lines.push("");

  lines.push("=== ДОХОД ПО МЕСЯЦАМ ===");
  lines.push("Месяц,Доход (₽),Записи,Новые клиенты");
  for (const d of revenue) {
    lines.push([d.month, d.revenue, d.appointments, d.newClients].map(escapeCsv).join(","));
  }
  lines.push("");

  lines.push("=== ПОПУЛЯРНОСТЬ УСЛУГ ===");
  lines.push("Услуга,Категория,Кол-во записей,Доход (₽)");
  for (const s of services) {
    lines.push([s.name, s.category, s.count, s.revenue].map(escapeCsv).join(","));
  }

  const csvContent = "\uFEFF" + lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

function buildHtmlContent(
  revenue: RevenueDataPoint[],
  services: ServicePopularity[],
  metrics: MetricSummary,
  health: BusinessHealth,
  insights: AIInsight[],
): string {
  const healthColor = health.score >= 80 ? "#22c55e" : health.score >= 60 ? "#eab308" : "#ef4444";
  const insightTypeColor: Record<string, string> = {
    positive: "#22c55e",
    warning: "#eab308",
    suggestion: "#3b82f6",
    trend: "#a855f7",
  };

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Аналитический отчёт</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 20px; }
  h1 { color: #be3d6e; border-bottom: 2px solid #be3d6e; padding-bottom: 8px; }
  h2 { color: #4a4a4a; margin-top: 24px; }
  .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
  .metric-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
  .metric-value { font-size: 24px; font-weight: 700; color: #be3d6e; }
  .metric-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
  th { background: #f3f4f6; text-align: left; padding: 8px 12px; border-bottom: 2px solid #e5e7eb; }
  td { padding: 6px 12px; border-bottom: 1px solid #f3f4f6; }
  .health-bar { background: #f3f4f6; border-radius: 999px; height: 16px; overflow: hidden; margin: 8px 0; }
  .health-fill { height: 100%; border-radius: 999px; }
  .insight { border-left: 3px solid; padding: 8px 12px; margin: 8px 0; background: #f9fafb; border-radius: 0 6px 6px 0; }
  .insight-title { font-weight: 600; font-size: 14px; }
  .insight-desc { font-size: 13px; color: #4b5563; margin-top: 4px; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .date { color: #6b7280; font-size: 13px; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <div class="header">
    <h1>Аналитический отчёт</h1>
    <span class="date">${new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
  </div>

  <h2>Здоровье бизнеса</h2>
  <div class="health-bar">
    <div class="health-fill" style="width:${health.score}%;background:${healthColor}"></div>
  </div>
  <p><strong>${health.score}/100</strong> — ${health.score >= 80 ? "Отлично" : health.score >= 60 ? "Хорошо" : "Требует внимания"}</p>

  <h2>Ключевые метрики</h2>
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-value">₽${formatNumber(metrics.ltv)}</div>
      <div class="metric-label">LTV клиента</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">₽${formatNumber(metrics.avgCheck)}</div>
      <div class="metric-label">Средний чек</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${metrics.conversionRate}%</div>
      <div class="metric-label">Конверсия</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${metrics.retentionRate}%</div>
      <div class="metric-label">Retention rate</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">+${metrics.revenueGrowth}%</div>
      <div class="metric-label">Рост дохода</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">+${metrics.clientGrowth}%</div>
      <div class="metric-label">Рост клиентов</div>
    </div>
  </div>

  <h2>Доход по месяцам</h2>
  <table>
    <thead><tr><th>Месяц</th><th>Доход</th><th>Записи</th><th>Новые клиенты</th></tr></thead>
    <tbody>
      ${revenue.map(d => `<tr><td>${d.month}</td><td>₽${formatNumber(d.revenue)}</td><td>${d.appointments}</td><td>${d.newClients}</td></tr>`).join("")}
    </tbody>
  </table>

  <h2>Популярность услуг</h2>
  <table>
    <thead><tr><th>Услуга</th><th>Категория</th><th>Записей</th><th>Доход</th></tr></thead>
    <tbody>
      ${services.map(s => `<tr><td>${s.name}</td><td>${s.category}</td><td>${s.count}</td><td>₽${formatNumber(s.revenue)}</td></tr>`).join("")}
    </tbody>
  </table>

  <h2>AI-рекомендации</h2>
  ${insights.map(ins => `
    <div class="insight" style="border-color:${insightTypeColor[ins.type]}">
      <div class="insight-title">${ins.title}</div>
      <div class="insight-desc">${ins.description}</div>
    </div>
  `).join("")}
</body>
</html>`;
}

export function exportAnalyticsPdf(
  revenue: RevenueDataPoint[],
  services: ServicePopularity[],
  metrics: MetricSummary,
  health: BusinessHealth,
  insights: AIInsight[],
) {
  const html = buildHtmlContent(revenue, services, metrics, health, insights);
  printReport(html);
}

function printReport(html: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    downloadBlob(blob, "analytics-report.html");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}

export function exportAnalyticsExcel(
  revenue: RevenueDataPoint[],
  services: ServicePopularity[],
  metrics: MetricSummary,
) {
  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header"><Font ss:Bold="1" ss:Color="#be3d6e"/><Interior ss:Color="#f3f4f6" ss:Pattern="Solid"/></Style>
    <Style ss:ID="number"><NumberFormat ss:Format="#,##0"/></Style>
    <Style ss:ID="currency"><NumberFormat ss:Format="#,##0 ₽"/></Style>
    <Style ss:ID="percent"><NumberFormat ss:Format="0%"/></Style>
  </Styles>`;

  xml += `<Worksheet ss:Name="Метрики"><Table>
    <Row ss:StyleID="header"><Cell><Data ss:Type="String">Метрика</Data></Cell><Cell><Data ss:Type="String">Значение</Data></Cell></Row>
    <Row><Cell><Data ss:Type="String">LTV клиента</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${metrics.ltv}</Data></Cell></Row>
    <Row><Cell><Data ss:Type="String">Средний чек</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${metrics.avgCheck}</Data></Cell></Row>
    <Row><Cell><Data ss:Type="String">Конверсия</Data></Cell><Cell><Data ss:Type="String">${metrics.conversionRate}%</Data></Cell></Row>
    <Row><Cell><Data ss:Type="String">Retention rate</Data></Cell><Cell><Data ss:Type="String">${metrics.retentionRate}%</Data></Cell></Row>
    <Row><Cell><Data ss:Type="String">Рост дохода</Data></Cell><Cell><Data ss:Type="String">${metrics.revenueGrowth}%</Data></Cell></Row>
    <Row><Cell><Data ss:Type="String">Рост клиентов</Data></Cell><Cell><Data ss:Type="String">${metrics.clientGrowth}%</Data></Cell></Row>
  </Table></Worksheet>`;

  xml += `<Worksheet ss:Name="Доходы"><Table>
    <Row ss:StyleID="header"><Cell><Data ss:Type="String">Месяц</Data></Cell><Cell><Data ss:Type="String">Доход</Data></Cell><Cell><Data ss:Type="String">Записи</Data></Cell><Cell><Data ss:Type="String">Новые клиенты</Data></Cell></Row>`;
  for (const d of revenue) {
    xml += `<Row><Cell><Data ss:Type="String">${d.month}</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${d.revenue}</Data></Cell><Cell ss:StyleID="number"><Data ss:Type="Number">${d.appointments}</Data></Cell><Cell ss:StyleID="number"><Data ss:Type="Number">${d.newClients}</Data></Cell></Row>`;
  }
  xml += `</Table></Worksheet>`;

  xml += `<Worksheet ss:Name="Услуги"><Table>
    <Row ss:StyleID="header"><Cell><Data ss:Type="String">Услуга</Data></Cell><Cell><Data ss:Type="String">Категория</Data></Cell><Cell><Data ss:Type="String">Записей</Data></Cell><Cell><Data ss:Type="String">Доход</Data></Cell></Row>`;
  for (const s of services) {
    xml += `<Row><Cell><Data ss:Type="String">${s.name}</Data></Cell><Cell><Data ss:Type="String">${s.category}</Data></Cell><Cell ss:StyleID="number"><Data ss:Type="Number">${s.count}</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${s.revenue}</Data></Cell></Row>`;
  }
  xml += `</Table></Worksheet>`;
  xml += `</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  downloadBlob(blob, "analytics-report.xls");
}
