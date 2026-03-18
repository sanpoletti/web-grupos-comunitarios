import { NextRequest } from "next/server";
import sql from "mssql";

const config = {
  user: "sandra",
  password: "Ranelagh22",
  server: "10.22.0.253",
  database: "GruposComunitarios",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export async function GET(req: NextRequest) {

  const headers = new Headers();
  headers.append("Access-Control-Allow-Origin", "http://localhost:3001");
  headers.append("Access-Control-Allow-Methods", "GET,OPTIONS");
  headers.append("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {

    const pool = await sql.connect(config);

    const result = await pool.request().query(`
        EXEC _ESTADOS
    `);

    await pool.close();

    return new Response(
      JSON.stringify(result.recordset),
      { headers }
    );

  } catch (error) {

    console.error("Error cargando estados:", error);

    return new Response(
      JSON.stringify({ error: "Error cargando estados" }),
      { status: 500, headers }
    );
  }
}