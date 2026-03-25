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

// helper para XML
const generarXMLIngestas = (ingestas: any[]) => {
  if (!ingestas || !ingestas.length) {
    return `<root></root>`;
  }

  const items = ingestas
    .map(
      (i) => `
      <item>
        <idingesta>${i.idingesta || 0}</idingesta>
        <idsupervision>${i.idsupervision || 0}</idsupervision>
        <cantidad>${i.cantidad}</cantidad>
      </item>
    `
    )
    .join("");

  return `<root>${items}</root>`;
};

export async function POST(req: NextRequest) {

  const headers = new Headers();
  headers.append("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  headers.append("Access-Control-Allow-Methods", "POST,OPTIONS");
  headers.append("Access-Control-Allow-Headers", "Content-Type");

  try {

    const body = await req.json();

    const pool = await sql.connect(config);
    const request = pool.request();

    const xmlIngestas = generarXMLIngestas(body.ingestas || []);

    request.input("idSupervision", sql.Int, body.idSupervision || 0);
    request.input("idhogar", sql.Int, body.idHogar);
    request.input("observaciones", sql.VarChar(500), body.observaciones || "");
    request.input("conclusion", sql.VarChar(500), body.conclusion || "");
    request.input("idaccion", sql.Int, body.idAccion || 0);
    request.input("descripcionaccion", sql.VarChar(500), body.descripcionAccion || "");
    request.input("Ingestas", sql.Text, xmlIngestas);
    request.input("X_PATH", sql.VarChar(1000), "/root/item");

    await request.execute("_ALTAMODIFICA_SUPERVISION");

    return new Response(
      JSON.stringify({ ok: true }),
      { headers }
    );

  } catch (error) {

    console.error("Error SP supervisión:", error);

    return new Response(
      JSON.stringify({ error: "Error al guardar supervisión" }),
      { status: 500, headers }
    );
  }
}