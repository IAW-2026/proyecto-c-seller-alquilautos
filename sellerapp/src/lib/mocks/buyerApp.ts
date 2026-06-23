import { Alquilador } from "@/lib/types";

export async function getAlquilador(
  id: string
): Promise<{ data: Alquilador | null; error: string | null }> {
  try {
    const res = await fetch(`${process.env.BUYER_API_URL}/api/alquilador/${id}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    


    if (!res.ok) {
      return { data: null, error: `Buyer App respondió ${res.status}` };
    }

    const json = await res.json();

    return { data: json as Alquilador, error: null };
  } catch {
    return { data: null, error: "No se pudo contactar a Buyer App" };
  }
}