"use client";

import { useState, useEffect } from "react";
import { Pencil, FileDown, X } from "lucide-react";


interface Grupo {
  IDHOGAR: number;
  nroRegistro: number;
  grupo: string;
  estado_grupo: number;
  Desayuno: number;
  Almuerzo: number;
  Merienda: number;
  Cena: number;
}

interface Estado {
  IDESTADOGRUPO: number;
  estado: string;
}

export default function RacionesEstados() {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<Grupo[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<Grupo | null>(null);
  const [estados, setEstados] = useState<Estado[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  // Transformar los campos que vienen del SP a camelCase
  const transformarDatos = (data: any[]): Grupo[] =>
  data.map((g) => ({
    IDHOGAR: g.IDHOGAR,
    nroRegistro: g.nroregistro,
    grupo: g.grupo,
    estado_grupo: g.id_estado_grupo,
    Desayuno: g.Desayuno,
    Almuerzo: g.Almuerzo,
    Merienda: g.Merienda,
    Cena: g.Cena,
  }));

  const abrirModal = (grupo: Grupo) => {
    setGrupoSeleccionado(grupo);
    setModalAbierto(true);
  };

  const cargarTodos = async () => {
    try {
      const res = await fetch(`/api/grupos/raciones-estados`);
      if (!res.ok) throw new Error("Error cargando datos");
      const data = await res.json();
      setResultados(transformarDatos(data));
    } catch (err) {
      console.error("Error cargando grupos:", err);
    }
  };

  const buscar = async () => {
    try {
      if (!busqueda) return cargarTodos();

      const url =
        !isNaN(Number(busqueda))
          ? `/api/grupos/raciones-estados?nroregistro=${busqueda}`
          : `/api/grupos/raciones-estados?grupo=${encodeURIComponent(busqueda)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error buscando grupos");
      const data = await res.json();
      setResultados(transformarDatos(data));
    } catch (err) {
      console.error("Error buscando grupos:", err);
    }
  };

  const cargarEstados = async () => {
  try {
    const res = await fetch(`/api/estados`);

    if (!res.ok) {
      throw new Error("Error en endpoint estados");
    }

    const data = await res.json();
    console.log("ESTADOS:", data);

    setEstados(data);
  } catch (error) {
    console.error("Error cargando estados:", error);
    }
  };

  const guardarCambios = async () => {
  if (!grupoSeleccionado) return;

  try {
    const res = await fetch(`/api/grupos/raciones-estados`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idHogar: grupoSeleccionado.IDHOGAR,
        idEstado: grupoSeleccionado.estado_grupo,// por ahora fijo hasta mapear estados
        desayuno: grupoSeleccionado.Desayuno ?? -1,
        almuerzo: grupoSeleccionado.Almuerzo ?? -1,
        merienda: grupoSeleccionado.Merienda ?? -1,
        cena: grupoSeleccionado.Cena ?? -1,
      }),
    });

    if (!res.ok) throw new Error("Error guardando");

    setModalAbierto(false);

    // refrescar la tabla
    await cargarTodos();

  } catch (err) {
    console.error("Error guardando:", err);
    alert("Error al guardar");
  }
};

  const obtenerNombreEstado = (id: number) => {
  const estado = estados.find((e) => e.IDESTADOGRUPO === id);
  return estado ? estado.estado : id;
};

  const exportarCSV = () => {
    if (!resultados.length) return;
    const encabezados = Object.keys(resultados[0]).join(";");

  const normalizar = (v: number) => (v === -1 ? "-" : v);

const filas = resultados
  .map((g) =>
    Object.values({
      ...g,
      estado_grupo: obtenerNombreEstado(g.estado_grupo),
      Desayuno: normalizar(g.Desayuno),
      Almuerzo: normalizar(g.Almuerzo),
      Merienda: normalizar(g.Merienda),
      Cena: normalizar(g.Cena),
    })
      .map((v) => `"${v}"`)
      .join(";")
  )
  .join("\n");

      
    const blob = new Blob([`${encabezados}\n${filas}`], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "raciones_estados.csv";
    link.click();
  };

  useEffect(() => {
    cargarTodos();
    cargarEstados();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Actualización Raciones / Estado</h1>
        <button
          onClick={exportarCSV}
          className="bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FileDown size={18} /> Exportar
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Nro Registro o Nombre del grupo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
          className="border p-2 rounded w-80"
        />
        <button
          onClick={buscar}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Registro</th>
            <th className="p-2">Grupo</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Desayuno</th>
            <th className="p-2">Almuerzo</th>
            <th className="p-2">Merienda</th>
            <th className="p-2">Cena</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {resultados.map((g) => (
            <tr key={`${g.IDHOGAR}-${g.nroRegistro}`} className="border-t">
              <td className="p-2">{g.nroRegistro}</td>
              <td className="p-2">{g.grupo}</td>
              <td className="p-2">{obtenerNombreEstado(g.estado_grupo)}</td>
              <td className="p-2">{g.Desayuno === -1 ? "-" : g.Desayuno}</td>
              <td className="p-2">{g.Almuerzo === -1 ? "-" : g.Almuerzo}</td>
              <td className="p-2">{g.Merienda === -1 ? "-" : g.Merienda}</td>
              <td className="p-2">{g.Cena === -1 ? "-" : g.Cena}</td>
              <td className="p-2 flex gap-3 justify-center">
                <button
                  onClick={() => abrirModal(g)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalAbierto && grupoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg w-[420px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Actualizar Grupo</h2>
              <button onClick={() => setModalAbierto(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 text-sm">
              <p>
                <b>Registro:</b> {grupoSeleccionado.nroRegistro}
              </p>
              <p>
                <b>Grupo:</b> {grupoSeleccionado.grupo}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm">Estado</label>

                <select
                  className="border p-2 w-full rounded"
                  value={grupoSeleccionado.estado_grupo}
                  onChange={(e) =>
                    setGrupoSeleccionado({
                      ...grupoSeleccionado,
                      estado_grupo: Number(e.target.value),
                    })
                  }
                >
                  {estados.map((estado) => (
                    <option key={estado.IDESTADOGRUPO} value={estado.IDESTADOGRUPO}>
                      {estado.estado}
                    </option>
                  ))}
                </select>

              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Desayuno", "Almuerzo", "Merienda", "Cena"].map((campo) => (
                  <div key={campo}>
                    <label className="text-sm">{campo}</label>
                    <input
                      type="number"
                      className="border p-2 w-full rounded"
                      value={(grupoSeleccionado as any)[campo]}
                      onChange={(e) =>
                        setGrupoSeleccionado({
                          ...grupoSeleccionado,
                          [campo]: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCambios}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}