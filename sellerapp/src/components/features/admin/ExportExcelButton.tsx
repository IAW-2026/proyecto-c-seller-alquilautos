"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface ExportExcelButtonProps<P> {
  action: (params: P) => Promise<{ data?: Record<string, string | number>[]; error?: string }>;
  params: P;
  filename: string;
  label?: string;
}

export function ExportExcelButton<P>({ action, params, filename, label = "Exportar" }: ExportExcelButtonProps<P>) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useToast();

  const handleExport = async () => {
    setLoading(true);
    const result = await action(params);
    setLoading(false);

    if (result.error) { setToast(result.error); return; }
    if (!result.data || result.data.length === 0) { setToast("No hay datos para exportar"); return; }

    const sheet = XLSX.utils.json_to_sheet(result.data);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Datos");
    XLSX.writeFile(book, filename);
  };

  return (
    <>
      {toast}
      <Button variant="secondary" size="md" onClick={handleExport} disabled={loading}>
        {loading ? "Exportando..." : label}
      </Button>
    </>
  );
}
