export function daysBetween(a: string | Date, b: string | Date): number {
  const d = (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.round(d));
}

export function fullName(o: { nombre: string; apellido: string } | null | undefined): string {
  return o ? `${o.nombre} ${o.apellido}` : "—";
}

export function fmtDate(s: string | Date | null | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

type Decimalish = { toNumber: () => number };
type MoneyInput = number | string | Decimalish;

export function fmtMoney(n: MoneyInput): string {
  const num =
    typeof n === "object" && n !== null && "toNumber" in n
      ? n.toNumber()
      : Number(n);

  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
export async function getDolarBlue(): Promise<number> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue", {
      next: { revalidate: 3600 }, // cachea 1 hora
    });
    const data = await res.json();
    return data.venta;
  } catch {
    return 0;
  }
}

export function pesToDolar(pesos: number, tipoCambio: number): string {
  if (!tipoCambio) return "";
  return `U$D ${(pesos / tipoCambio).toFixed(0)}`;
}

export function getRangoPeriodo(
  periodo: string,
  fechaDesde?: string,
  fechaHasta?: string
): { desde?: Date; hasta?: Date } {
  const hoy = new Date();
  const finDeHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);

  switch (periodo) {
    case "7d":
      return { desde: new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000), hasta: finDeHoy };
    case "30d":
      return { desde: new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000), hasta: finDeHoy };
    case "90d":
      return { desde: new Date(hoy.getTime() - 90 * 24 * 60 * 60 * 1000), hasta: finDeHoy };
    case "esteAnio":
      return { desde: new Date(hoy.getFullYear(), 0, 1), hasta: finDeHoy };
    case "mesAnterior":
      return {
        desde: new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1),
        hasta: new Date(hoy.getFullYear(), hoy.getMonth(), 0, 23, 59, 59, 999),
      };
    case "custom":
      return {
        desde: fechaDesde ? new Date(fechaDesde) : undefined,
        hasta: fechaHasta ? new Date(`${fechaHasta}T23:59:59.999`) : undefined,
      };
    case "esteMes":
    default:
      return { desde: new Date(hoy.getFullYear(), hoy.getMonth(), 1), hasta: finDeHoy };
  }
}

export function getCloudinaryUrl(url: string, width: number, height: number): string {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${width},h_${height},c_fill,f_auto,q_auto/`);
}