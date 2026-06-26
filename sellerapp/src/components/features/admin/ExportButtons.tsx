"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";

interface ExportButtonsProps<P> {
  action: (params: P) => Promise<{ data?: Record<string, string | number>[]; error?: string }>;
  params: P;
  filename: string;
  title: string;
}

export function ExportButtons<P>({ action, params, filename, title }: ExportButtonsProps<P>) {
  const [loading, setLoading] = useState<"excel" | "pdf" | null>(null);
  const [toast, setToast] = useToast();

  const fetchData = async () => {
    const result = await action(params);
    if (result.error) { setToast(result.error); return null; }
    if (!result.data || result.data.length === 0) { setToast("No hay datos para exportar"); return null; }
    return result.data;
  };

  const handleExcel = async () => {
    setLoading("excel");
    const data = await fetchData();
    setLoading(null);
    if (!data) return;

    const XLSX = await import("xlsx");
    const sheet = XLSX.utils.json_to_sheet(data);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Datos");
    XLSX.writeFile(book, `${filename}.xlsx`);
  };

  const handlePdf = async () => {
    setLoading("pdf");
    const data = await fetchData();
    setLoading(null);
    if (!data) return;

    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const headers = Object.keys(data[0]);

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(title, 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [headers],
      body: data.map(row => headers.map(h => String(row[h]))),
      styles: { fontSize: 8 },
    });
    doc.save(`${filename}.pdf`);
  };

  return (
    <>
      {toast}
      <div className="flex gap-2">
        <Button variant="excel" size="md" onClick={handleExcel} disabled={loading !== null}>
          <Icon name="fileExcel" size={16} /> {loading === "excel" ? "Exportando..." : "Excel"}
        </Button>
        <Button variant="pdf" size="md" onClick={handlePdf} disabled={loading !== null}>
          <Icon name="filePdf" size={16} /> {loading === "pdf" ? "Exportando..." : "PDF"}
        </Button>
      </div>
    </>
  );
}
