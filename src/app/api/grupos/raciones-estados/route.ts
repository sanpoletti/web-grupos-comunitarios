import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "",
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT === "true",
  },
};

export async function OPTIONS() {
  const headers = new Headers();
  headers.append(
  "Access-Control-Allow-Origin",
  process.env.CORS_ORIGIN || "*"
);
  headers.append("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.append("Access-Control-Allow-Headers", "Content-Type");

  return new Response(null, { headers });
}

export async function GET(req: NextRequest) {
  const headers = new Headers();
  headers.append(
  "Access-Control-Allow-Origin",
  process.env.CORS_ORIGIN || "*"
);
  headers.append("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.append("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const url = new URL(req.url);
    const nroreg = Number(url.searchParams.get("nroregistro") || 0);
    const tGrupo = Number(url.searchParams.get("tGrupo") || 0);
    const IDHOGAR = 0; // opcional, usamos 0 para traer todos

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("nroreg", sql.Int, nroreg);
    request.input("tGrupo", sql.Int, tGrupo);
    request.input("IDHOGAR", sql.Int, IDHOGAR);

    const result = await request.execute("_Grupos");

    let data: any[] = result.recordset;

    const nombre = url.searchParams.get("grupo");

    if (nombre) {
      data = data.filter((g: any) =>
        g.grupo?.toLowerCase().includes(nombre.toLowerCase())
      );
    }

    return new Response(JSON.stringify(data), { headers });

  } catch (err) {
    console.error("Error en raciones-estados route:", err);
    return new Response(
      JSON.stringify({ error: "Error en API" }),
      { status: 500, headers }
    );
  }
}

/* ======================================
   POST - Guarda cambios del modal
   Ejecuta _ModificaRacionEstados
====================================== */

export async function POST(req: NextRequest) {

  const headers = new Headers();
  headers.append(
  "Access-Control-Allow-Origin",
  process.env.CORS_ORIGIN || "*"
);
  headers.append("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.append("Access-Control-Allow-Headers", "Content-Type");

  try {

    const body = await req.json();

    const pool = await sql.connect(config);
    const request = pool.request();

    request.input("IdHogar", sql.Int, body.idHogar);
    request.input("IdEstado", sql.Int, body.idEstado);
    request.input("desayuno", sql.Int, body.desayuno);
    request.input("almuerzo", sql.Int, body.almuerzo);
    request.input("merienda", sql.Int, body.merienda);
    request.input("cena", sql.Int, body.cena);

    await request.execute("_ModificaRacionEstados");

    return new Response(
      JSON.stringify({ ok: true }),
      { headers }
    );

  } catch (err) {

    console.error("Error guardando raciones:", err);

    return new Response(
      JSON.stringify({ error: "Error al guardar" }),
      { status: 500, headers }
    );
  }
}