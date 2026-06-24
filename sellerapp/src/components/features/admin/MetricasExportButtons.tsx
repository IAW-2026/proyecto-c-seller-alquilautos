"use client";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface MetricaRow {
  metrica: string;
  valor: string | number;
}

interface MetricasExportButtonsProps {
  rows: MetricaRow[];
}

export function MetricasExportButtons({ rows }: MetricasExportButtonsProps) {
  const handleExcel = async () => {
    const XLSX = await import("xlsx");
    const data = rows.map(r => ({ "Métrica": r.metrica, "Valor": r.valor }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Métricas");
    XLSX.writeFile(wb, "metricas_plataforma.xlsx");
  };

  const handlePdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Métricas de la plataforma", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Métrica", "Valor"]],
      body: rows.map(r => [r.metrica, String(r.valor)]),
    });
    doc.save("metricas_plataforma.pdf");
  };

  return (
    <div className="flex gap-2">
      <Button variant="excel" size="md" onClick={handleExcel}>
        <Icon name="fileExcel" size={16} /> Excel
      </Button>
      <Button variant="pdf" size="md" onClick={handlePdf}>
        <Icon name="filePdf" size={16} /> PDF
      </Button>
    </div>
  );
}
