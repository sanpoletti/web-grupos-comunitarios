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

export async function GET(req: NextRequest) {

  const headers = new Headers();
  headers.append("Access-Control-Allow-Origin", "*");

  try {

    const pool = await sql.connect(config);

    // 🔹 verificaciones
    const veri = await pool.request().query(`
      SELECT idverificacion, descripcion
      FROM verificacion
      ORDER BY idverificacion
    `);

    // 🔹 tipos (cumple, no cumple, etc)
    const tipos = await pool.request().query(`
      SELECT idtverificacion, descripcion
      FROM tverificacion
      ORDER BY idtverificacion
    `);

    await pool.close();

    return new Response(
      JSON.stringify({
        verificaciones: veri.recordset,
        tipos: tipos.recordset,
      }),
      { headers }
    );

  } catch (error) {

    console.error("Error verificaciones:", error);

    return new Response(
      JSON.stringify({ error: "Error cargando verificaciones" }),
      { status: 500, headers }
    );
  }
}