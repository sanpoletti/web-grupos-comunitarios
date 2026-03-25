"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

interface Grupo {
  IDHOGAR: number;
  nroRegistro: number;
  grupo: string;
}

interface Ingesta {
  idingesta: number;
  nombre: string;
  cantidad: number;
}

export default function SupervisionesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<Grupo[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<Grupo | null>(null);

  const [observaciones, setObservaciones] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [accion, setAccion] = useState<number | "">("");

  // 👉 ingestas básicas (puede venir después de BD)
  const [ingestas, setIngestas] = useState<Ingesta[]>([
    { idingesta: 1, nombre: "Desayuno", cantidad: 0 },
    { idingesta: 2, nombre: "Almuerzo", cantidad: 0 },
    { idingesta: 3, nombre: "Merienda", cantidad: 0 },
    { idingesta: 4, nombre: "Cena", cantidad: 0 },
  ]);

  const transformarDatos = (data: any[]): Grupo[] =>
    data.map((g) => ({
      IDHOGAR: g.IDHOGAR,
      nroRegistro: g.nroregistro,
      grupo: g.grupo,
    }));

  const cargarTodos = async () => {
    const res = await fetch(`/api/grupos/raciones-estados`);
    const data = await res.json();
    setResultados(transformarDatos(data));
  };

  const buscar = async () => {
    if (!busqueda) return cargarTodos();

    const url =
      !isNaN(Number(busqueda))
        ? `/api/grupos/raciones-estados?nroregistro=${busqueda}`
        : `/api/grupos/raciones-estados?grupo=${encodeURIComponent(busqueda)}`;

    const res = await fetch(url);
    const data = await res.json();
    setResultados(transformarDatos(data));
  };

  const abrirModal = (grupo: Grupo) => {
    setGrupoSeleccionado(grupo);
    setObservaciones("");
    setConclusion("");
    setAccion("");
    setIngestas((prev) =>
      prev.map((i) => ({ ...i, cantidad: 0 }))
    );
    setModalAbierto(true);
  };

  const cambiarCantidad = (id: number, valor: number) => {
    setIngestas((prev) =>
      prev.map((i) =>
        i.idingesta === id ? { ...i, cantidad: valor } : i
      )
    );
  };

  const guardar = async () => {
    if (!grupoSeleccionado) return;

    try {
      const res = await fetch(`/api/supervisiones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idSupervision: 0,
          idHogar: grupoSeleccionado.IDHOGAR,
          observaciones,
          conclusion,
          idAccion: accion || 0,
          descripcionAccion: "",
          ingestas: ingestas.map((i) => ({
            idingesta: i.idingesta,
            cantidad: i.cantidad,
          })),
        }),
      });

      if (!res.ok) throw new Error("Error guardando");

      alert("Supervisión guardada ✔");
      setModalAbierto(false);

    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    }
  };

  useEffect(() => {
    cargarTodos();
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">Supervisiones</h1>

      {/* Buscador */}
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

      {/* Tabla */}
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Registro</th>
            <th className="p-2">Grupo</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {resultados.map((g) => (
            <tr key={g.IDHOGAR} className="border-t">
              <td className="p-2">{g.nroRegistro}</td>
              <td className="p-2">{g.grupo}</td>
              <td className="p-2 text-center">
                <button
                  onClick={() => abrirModal(g)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Plus size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {modalAbierto && grupoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg w-[550px] p-6">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nueva Supervisión</h2>
              <button onClick={() => setModalAbierto(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 text-sm">
              <p><b>Registro:</b> {grupoSeleccionado.nroRegistro}</p>
              <p><b>Grupo:</b> {grupoSeleccionado.grupo}</p>
            </div>

            <div className="space-y-4">

              <div>
                <label className="text-sm">Observaciones</label>
                <textarea
                  className="border p-2 w-full rounded"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm">Conclusión</label>
                <textarea
                  className="border p-2 w-full rounded"
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm">Acción</label>
                <select
                  className="border p-2 w-full rounded"
                  value={accion}
                  onChange={(e) => setAccion(Number(e.target.value))}
                >
                  <option value="">Seleccione</option>
                  <option value={1}>Suspender</option>
                  <option value={2}>Volver a supervisar</option>
                </select>
              </div>

              {/* INGESTAS */}
              <div>
                <label className="text-sm font-semibold">Ingestas relevadas</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {ingestas.map((i) => (
                    <div key={i.idingesta}>
                      <label className="text-sm">{i.nombre}</label>
                      <input
                        type="number"
                        className="border p-2 w-full rounded"
                        value={i.cantidad}
                        onChange={(e) =>
                          cambiarCantidad(i.idingesta, Number(e.target.value))
                        }
                      />
                    </div>
                  ))}
                </div>
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
                onClick={guardar}
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