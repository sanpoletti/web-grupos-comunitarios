import { NextRequest } from "next/server";
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

// Helper para XML
const generarXMLIngestas = (ingestas: any[]) => {
  if (!ingestas || !ingestas.length) return `<root></root>`;

  const items = ingestas
    .map(
      (i) => `
      <item>
        <idingesta>${i.idingesta || 0}</idingesta>
        <idsupervision>${i.idsupervision || 0}</idsupervision>
        <cantidad>${i.cantidad}</cantidad>
      </item>`
    )
    .join("");

  return `<root>${items}</root>`;
};

const generarXMLVerificaciones = (verificaciones: any[]) => {
  if (!verificaciones || !verificaciones.length) return `<root></root>`;

  const items = verificaciones
    .map(
      (v) => `
      <item>
        <idverificacion>${v.idverificacion}</idverificacion>
        <idtverificacion>${v.idtverificacion}</idtverificacion>
      </item>`
    )
    .join("");

  return `<root>${items}</root>`;
};

// =================== GET ===================
export async function GET(req: NextRequest) {
  const headers = new Headers();
  headers.append("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  headers.append("Access-Control-Allow-Methods", "GET,OPTIONS");
  headers.append("Access-Control-Allow-Headers", "Content-Type");

  try {
    const { searchParams } = new URL(req.url);
    const idHogarParam = searchParams.get("idHogar");

    if (!idHogarParam) {
      return new Response(
        JSON.stringify({ error: "Falta el parámetro idHogar" }),
        { status: 400, headers }
      );
    }

    const idHogar = Number(idHogarParam);
    if (isNaN(idHogar)) {
      return new Response(
        JSON.stringify({ error: "idHogar debe ser un número" }),
        { status: 400, headers }
      );
    }

    const pool = await sql.connect(config);

    const result = await pool.request()
      .input("IDHOGAR", sql.Int, idHogar)
      .execute("_BUSCAR_SUPERVISION");

    const recordsets = result.recordsets as any[];
    const supervision = recordsets[0]?.[0] || null;
    const ingestas = recordsets[1] || [];
    const verificaciones = recordsets[2] || [];
    const fechas = recordsets[3]?.[0] || null;

    return new Response(
      JSON.stringify({ supervision, ingestas, verificaciones, fechas }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Error GET supervisión:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener supervisión", detalles: String(error) }),
      { status: 500, headers }
    );
  }
}

// =================== POST ===================
export async function POST(req: NextRequest) {
  const headers = new Headers();
  headers.append("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  headers.append("Access-Control-Allow-Methods", "POST,OPTIONS");
  headers.append("Access-Control-Allow-Headers", "Content-Type");

  try {
    const body = await req.json();

    if (!body.idHogar || isNaN(Number(body.idHogar))) {
      return new Response(
        JSON.stringify({ error: "idHogar inválido" }),
        { status: 400, headers }
      );
    }

    const pool = await sql.connect(config);
    const request = pool.request();

    const xmlIngestas = generarXMLIngestas(body.ingestas || []);
    const xmlVerificaciones = generarXMLVerificaciones(body.verificaciones || []);

    request.input("idSupervision", sql.Int, body.idSupervision || 0);
    request.input("idhogar", sql.Int, body.idHogar);
    request.input("observaciones", sql.VarChar(500), body.observaciones || "");
    request.input("conclusion", sql.VarChar(500), body.conclusion || "");
    request.input("idaccion", sql.Int, body.idAccion || 0);
    request.input("descripcionaccion", sql.VarChar(500), body.descripcionAccion || "");
    request.input("Ingestas", sql.Text, xmlIngestas);
    request.input("X_PATH", sql.VarChar(1000), "/root/item");
    request.input("Verificaciones", sql.Text, xmlVerificaciones);
    request.input("X_PATH_VERI", sql.VarChar(1000), "/root/item");

    await request.execute("_ALTAMODIFICA_SUPERVISION");

    // Insertar suspensión si corresponde
    if (body.idAccion === 1) {
      if (!body.fechaDesde) {
        throw new Error("Fecha desde obligatoria");
      }

      const request2 = pool.request();
      request2.input("idHogar", sql.Int, body.idHogar);
      request2.input("fechaInicio", sql.DateTime, new Date(body.fechaDesde));
      request2.input("fechaFin", sql.DateTime, body.fechaHasta ? new Date(body.fechaHasta) : null);
      request2.input("observaciones", sql.VarChar(sql.MAX), body.observaciones || "");
      request2.input("idmotivo", sql.Int, 1);
      request2.input("motivoOtro", sql.VarChar(sql.MAX), "");

      await request2.query(`
        INSERT INTO suspensiones (
          idHogar,
          observaciones,
          fechaInicio,
          fechaFin,
          idmotivo,
          motivoOtro
        )
        VALUES (
          @idHogar,
          @observaciones,
          @fechaInicio,
          @fechaFin,
          @idmotivo,
          @motivoOtro
        )
      `);
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Error POST supervisión:", error);
    return new Response(
      JSON.stringify({ error: "Error al guardar supervisión", detalles: String(error) }),
      { status: 500, headers }
    );
  }
}