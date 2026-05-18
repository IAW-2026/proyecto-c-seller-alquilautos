import { NextResponse } from "next/server";
import { getVehiculosDisponibles } from "@/lib/services/vehiculo.service";

export async function GET() {
  try {
    const result = await getVehiculosDisponibles();
    return NextResponse.json({ data: result.data, error: null }, { status: 200 });
  } catch {
    return NextResponse.json({ data: null, error: "Error interno del servidor" }, { status: 500 });
  }
}