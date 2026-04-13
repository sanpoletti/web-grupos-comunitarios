"use client";

import { useEffect, useState } from "react";

interface Derivacion {
  id: number;
  grupoOrigen: string;
  persona: string;
  estado: "PENDIENTE" | "DERIVADO";
}

export default function DerivacionesListado() {
  const [data, setData] = useState<Derivacion[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("derivaciones");
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error leyendo derivaciones:", error);
    }
  }, []);

  const derivar = (id: number) => {
    const actualizadas: Derivacion[] = data.map((d) =>
      d.id === id ? { ...d, estado: "DERIVADO" } : d
    );

    setData(actualizadas);

    try {
      localStorage.setItem("derivaciones", JSON.stringify(actualizadas));
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Listado de Derivaciones</h1>

      {data.length === 0 ? (
        <p>No hay derivaciones cargadas</p>
      ) : (
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>Grupo Origen</th>
              <th>Persona</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {data.map((d) => (
              <tr key={d.id}>
                <td>{d.grupoOrigen}</td>
                <td>{d.persona}</td>
                <td>{d.estado}</td>
                <td>
                  {d.estado === "PENDIENTE" && (
                    <button onClick={() => derivar(d.id)}>
                      Derivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}