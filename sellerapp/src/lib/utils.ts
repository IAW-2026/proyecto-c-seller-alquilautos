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
//api externa para obtener el dolar blue para convertir precios de pesos a dolares 
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

export function getCloudinaryUrl(url: string, width: number, height: number): string {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${width},h_${height},c_fill,f_auto,q_auto/`);
}