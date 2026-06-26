"use client";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface IngresoExportRow {
  fechaInicio: string;
  fechaFinal: string;
  vehiculo: string;
  dias: number;
  precioDia: number;
  totalARS: number;
  totalUSD: number;
}

interface ExportButtonsProps {
  rows: IngresoExportRow[];
  periodoLabel: string;
}

const HEADERS = ["Fecha inicio", "Fecha final", "Vehículo", "Días", "Precio/día (ARS)", "Total ARS", "Total USD"];

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

export function ExportButtons({ rows, periodoLabel }: ExportButtonsProps) {
  const fileBase = `ingresos_${periodoLabel.normalize("NFD").replace(DIACRITICS_REGEX, "").replace(/\s+/g, "_")}`;

  const handleExcel = async () => {
    const XLSX = await import("xlsx");
    const data = rows.map(r => ({
      "Fecha inicio": r.fechaInicio,
      "Fecha final": r.fechaFinal,
      "Vehículo": r.vehiculo,
      "Días": r.dias,
      "Precio/día (ARS)": r.precioDia,
      "Total ARS": r.totalARS,
      "Total USD": Number(r.totalUSD.toFixed(2)),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ingresos");
    XLSX.writeFile(wb, `${fileBase}.xlsx`);
  };

  const handlePdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Ingresos — ${periodoLabel}`, 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [HEADERS],
      body: rows.map(r => [
        r.fechaInicio,
        r.fechaFinal,
        r.vehiculo,
        String(r.dias),
        r.precioDia.toFixed(2),
        r.totalARS.toFixed(2),
        r.totalUSD.toFixed(2),
      ]),
    });
    doc.save(`${fileBase}.pdf`);
  };

  return (
    <div className="flex gap-2">
      <Button variant="excel" size="sm" onClick={handleExcel} disabled={rows.length === 0}>
        <Icon name="fileExcel" size={14} /> Exportar Excel
      </Button>
      <Button variant="pdf" size="sm" onClick={handlePdf} disabled={rows.length === 0}>
        <Icon name="filePdf" size={14} /> Exportar PDF
      </Button>
    </div>
  );
}
