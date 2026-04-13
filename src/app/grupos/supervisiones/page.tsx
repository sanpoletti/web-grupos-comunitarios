"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

interface Grupo {
  IDHOGAR: number;
  nroRegistro: number;
  grupo: string;
  Desayuno: number;
  Almuerzo: number;
  Merienda: number;
  Cena: number;
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

  const [ingestas, setIngestas] = useState<Ingesta[]>([]);

  const [verificaciones, setVerificaciones] = useState<any[]>([]);
  const [tiposVerificacion, setTiposVerificacion] = useState<any[]>([]);
  const [respuestas, setRespuestas] = useState<any[]>([]);

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [modo, setModo] = useState<"nueva" | "editar">("nueva");
  const [supervisionExistente, setSupervisionExistente] = useState<any | null>(null);

  const transformarDatos = (data: any[]): Grupo[] =>
    data.map((g) => ({
      IDHOGAR: g.IDHOGAR,
      nroRegistro: g.nroregistro,
      grupo: g.grupo,
      Desayuno: Number(g.Desayuno),
      Almuerzo: Number(g.Almuerzo),
      Merienda: Number(g.Merienda),
      Cena: Number(g.Cena),
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

  const cargarVerificaciones = async () => {
    const res = await fetch(`/api/verificaciones`);
    const data = await res.json();

    setVerificaciones(data.verificaciones);
    setTiposVerificacion(data.tipos);

    const inicial = data.verificaciones.map((v: any) => ({
      idverificacion: v.idverificacion,
      idtverificacion: 1,
    }));

    setRespuestas(inicial);
  };

  const abrirModal = async (grupo: Grupo, modoAbrir: "nueva" | "editar") => {
  try {
    setGrupoSeleccionado(grupo);
    setModo(modoAbrir);

    // ==============================
    // 1. Asegurar verificaciones
    // ==============================
    let veri = verificaciones;
    let tipos = tiposVerificacion;

    if (!veri.length) {
      const resVeri = await fetch(`/api/verificaciones`);
      const dataVeri = await resVeri.json();

      veri = dataVeri.verificaciones;
      tipos = dataVeri.tipos;

      setVerificaciones(veri);
      setTiposVerificacion(tipos);
    }

    // ==============================
    // 2. Ingestas base
    // ==============================
    let nuevasIngestas: Ingesta[] = [];

    if (grupo.Desayuno !== -1) nuevasIngestas.push({ idingesta: 1, nombre: "Desayuno", cantidad: 0 });
    if (grupo.Almuerzo !== -1) nuevasIngestas.push({ idingesta: 2, nombre: "Almuerzo", cantidad: 0 });
    if (grupo.Merienda !== -1) nuevasIngestas.push({ idingesta: 3, nombre: "Merienda", cantidad: 0 });
    if (grupo.Cena !== -1) nuevasIngestas.push({ idingesta: 4, nombre: "Cena", cantidad: 0 });

    // ==============================
    // 3. Reset estado
    // ==============================
    setObservaciones("");
    setConclusion("");
    setAccion("");
    setFechaDesde("");
    setFechaHasta("");
    setSupervisionExistente(null);

    // ==============================
    // 4. MODO EDITAR
    // ==============================
    if (modoAbrir === "editar") {
      console.log("Cargando supervisión para IDHOGAR:", grupo.IDHOGAR);

      const res = await fetch(`/api/supervisiones?idHogar=${grupo.IDHOGAR}`);
      if (!res.ok) throw new Error(`Error al cargar supervisión: ${res.status}`);

      const data = await res.json();

      setFechaDesde(data.fechas?.fechaInicio?.split("T")[0] || "");
      setFechaHasta(data.fechas?.fechaFin?.split("T")[0] || "");

      // 🔹 CORRECTO: backend devuelve objeto
      const sup = data.supervision;
      //console.log("SUP COMPLETA:", sup);
      //console.log("ID SUPERVISION:", sup?.idSupervision);
      console.log("FECHAS:", sup?.fechaDesde, sup?.fechaHasta);

      if (sup) {
        sup.ingestas = data.ingestas || [];
        sup.verificaciones = data.verificaciones || [];
      }

      setSupervisionExistente(sup);

      // ==============================
      // 5. Cargar datos básicos
      // ==============================
      setObservaciones(sup?.observaciones || "");
      setConclusion(sup?.conclusion || "");
      setAccion(sup?.idaccion ? Number(sup.idaccion) : "");
      

      // ==============================
      // 6. Ingestas con valores
      // ==============================
      const ingestasFiltradas = data.ingestas.filter(
          (i: any) => i.idSupervision === sup.idSupervision
        );

      const ingConCant = nuevasIngestas.map((i) => {
        const match = ingestasFiltradas.find(
          (ing: any) => Number(ing.idIngesta) === i.idingesta
        );

        return match
          ? { ...i, cantidad: Number(match.cantidad) }
          : i;
        });

      setIngestas(ingConCant);

      // ==============================
      // 7. Checklist (CLAVE)
      // ==============================
      const veriFiltradas = data.verificaciones.filter(
  (v: any) => v.idSupervision === sup.idSupervision
);

  const resp = veri.map((v: any) => {
    const match = veriFiltradas.find(
      (r: any) => Number(r.idverificacion) === v.idverificacion
    );

    return {
      idverificacion: v.idverificacion,
      idtverificacion: match
        ? Number(match.idtVerificacion)
        : 1,
    };
  });

      console.log("VERI:", veri);
      console.log("SUP:", sup);
      console.log("RESP:", resp);

      setRespuestas(resp);
    }

    // ==============================
    // 8. MODO NUEVA
    // ==============================
    else {
      const resp = veri.map((v: any) => ({
        idverificacion: v.idverificacion,
        idtverificacion: 1,
      }));

      setIngestas(nuevasIngestas);
      setRespuestas(resp);
    }

    // ==============================
    // 9. Abrir modal (al final)
    // ==============================
    setModalAbierto(true);

  } catch (err) {
    console.error("Error en abrirModal:", err);
    alert("Error al abrir supervisión");
  }
};

  const cambiarCantidad = (id: number, valor: number) => {
    setIngestas((prev) =>
      prev.map((i) => (i.idingesta === id ? { ...i, cantidad: valor } : i))
    );
  };

  const guardar = async () => {
    if (!grupoSeleccionado) return;

    if (!observaciones.trim()) {
      alert("Debe ingresar observaciones");
      return;
    }

    if (!conclusion.trim()) {
      alert("Debe ingresar una conclusión");
      return;
    }

    if (accion === "") {
      alert("Debe seleccionar una acción");
      return;
    }


    if (accion === 1) {
      if (!fechaDesde) {
        alert("Debe ingresar la fecha desde");
        return;
      }

      if (fechaHasta && fechaHasta < fechaDesde) {
        alert("La fecha hasta no puede ser menor que la fecha desde");
        return;
      }
    }

    try {
      const res = await fetch(`/api/supervisiones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idSupervision: supervisionExistente?.idSupervision || 0,
          idHogar: grupoSeleccionado.IDHOGAR,
          observaciones,
          conclusion,
          idAccion: typeof accion === "number" ? accion : null,
          descripcionAccion: "",
          fechaDesde: fechaDesde || null,
          fechaHasta: fechaHasta || null,
          ingestas: ingestas.map((i) => ({ idingesta: i.idingesta, cantidad: i.cantidad })),
          verificaciones: respuestas,
        }),
      });

      if (!res.ok) throw new Error("Error guardando");

      alert("Supervisión guardada ✔");
      setModalAbierto(false);
      cargarTodos();
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    }
  };

  useEffect(() => {
    cargarTodos();
    cargarVerificaciones();
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
        <button onClick={buscar} className="bg-blue-600 text-white px-4 py-2 rounded">
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
                  onClick={() => abrirModal(g, "nueva")}
                  className="text-green-600 hover:text-green-800 mr-2"
                >
                  <Plus size={18} />
                </button>
                <button
                  onClick={() => abrirModal(g, "editar")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✏️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {modalAbierto && grupoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg w-[550px] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modo === "nueva" ? "Nueva Supervisión" : "Editar Supervisión"}
              </h2>
              <button
                onClick={() => {
                  setModalAbierto(false);
                  setFechaDesde("");
                  setFechaHasta("");
                }}
              >
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
            {/* Mensaje cuando no hay supervisión previa */}
            {modo === "editar" && !supervisionExistente && (
              <p className="text-sm text-gray-500 mb-2">
                No hay supervisión previa, se creará una nueva.
              </p>
            )}    
            <div className="space-y-4">
              {/* INGESTAS */}
              <div>
                <label className="text-sm font-semibold">Raciones relevadas</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {ingestas.map((i) => (
                    <div key={i.idingesta}>
                      <label className="text-sm">{i.nombre}</label>
                      <input
                        type="number"
                        className="border p-2 w-full rounded"
                        value={i.cantidad ?? 0}
                        onChange={(e) => cambiarCantidad(i.idingesta, Number(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* CHECKLIST */}
              <div>
                <label className="text-sm font-semibold">Verificación</label>
                <table className="w-full mt-2 border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2 text-left">Ítem</th>
                      <th className="p-2">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verificaciones.map((v) => (
                      <tr key={v.idverificacion} className="border-t">
                        <td className="p-2 text-sm">{v.descripcion}</td>
                        <td className="p-2">
                          <select
                            className="border p-1 rounded w-full"
                            value={
                              respuestas.find((r) => r.idverificacion === v.idverificacion)?.idtverificacion ?? 1
                            }
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              setRespuestas((prev) =>
                                prev.map((r) =>
                                  r.idverificacion === v.idverificacion
                                    ? { ...r, idtverificacion: value }
                                    : r
                                )
                              );
                            }}
                          >
                            {tiposVerificacion.map((t) => (
                              <option key={t.idtverificacion} value={t.idtverificacion}>
                                {t.descripcion}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  value={accion === "" ? "" : accion}
                  onChange={(e) =>
                    setAccion(e.target.value === "" ? "" : Number(e.target.value))
                  }
                >
                  <option value="" disabled hidden>
                    Seleccione
                  </option>
                  <option value={1}>Suspender</option>
                  <option value={2}>Volver a supervisar</option>
                </select>
              </div>

              {accion === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm">Fecha desde</label>
                    <input
                      type="date"
                      className="border p-2 w-full rounded"
                      value={fechaDesde || ""}
                      required
                      onChange={(e) =>
                        setFechaDesde(e.target.value === "" ? "" : e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm">Fecha hasta</label>
                    <input
                      type="date"
                      className="border p-2 w-full rounded"
                      value={fechaHasta || ""}
                      onChange={(e) =>
                        setFechaHasta(e.target.value === "" ? "" : e.target.value)
                      }
                    />
                  </div>
                </div>
              )}


            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancelar
              </button>
              <button onClick={guardar} className="bg-green-600 text-white px-3 py-1 rounded">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}