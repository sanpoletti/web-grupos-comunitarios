
"use client";

import { useState, useEffect } from "react";
import { Pencil, FileDown, X } from "lucide-react";

export default function SupervisionesActualizacion() {

  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<any>(null);

  const abrirModal = (grupo:any) => {
    setGrupoSeleccionado(grupo);
    setModalAbierto(true);
  };

  const cargarTodos = async () => {
    const res = await fetch("http://localhost:3000/api/supervisiones/grupos");
    const data = await res.json();
    setResultados(data);
  };

  const buscar = async () => {

    if (!busqueda) {
      cargarTodos();
      return;
    }

    let url = "";

    if (!isNaN(Number(busqueda))) {
      url = `http://localhost:3000/api/supervisiones/grupos?nroregistro=${busqueda}`;
    } else {
      url = `http://localhost:3000/api/supervisiones/grupos?nombre=${busqueda}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    setResultados(data);
  };

  useEffect(() => {
    cargarTodos();
  }, []);

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          Actualización Raciones / Estado
        </h1>

        <button className="bg-gray-700 text-white px-4 py-2 rounded">
          Exportar
        </button>

      </div>

      {/* BUSQUEDA */}

      <div className="flex gap-4 mb-6">

        <input
          type="text"
          placeholder="Nro Registro o Nombre del grupo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") buscar();
          }}
          className="border p-2 rounded w-80"
        />

        <button
          onClick={buscar}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Buscar
        </button>

      </div>

      {/* RESULTADOS */}

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
            <tr key={g.nroRegistro} className="border-t">

              <td className="p-2">{g.nroRegistro}</td>
              <td className="p-2">{g.grupo}</td>
              <td className="p-2">{g.estadoGrupo}</td>
              <td className="p-2">{g.desayuno}</td>
              <td className="p-2">{g.almuerzo}</td>
              <td className="p-2">{g.merienda}</td>
              <td className="p-2">{g.cena}</td>

              <td className="p-2 flex gap-3 justify-center">

                <button
                  onClick={() => abrirModal(g)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil size={18} />
                </button>

                <button className="text-gray-700 hover:text-black">
                  <FileDown size={18} />
                </button>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

      {/* MODAL */}

      {modalAbierto && grupoSeleccionado && (

        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

          <div className="bg-white rounded shadow-lg w-[420px] p-6">

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-xl font-bold">
                Actualizar Grupo
              </h2>

              <button onClick={() => setModalAbierto(false)}>
                <X size={20}/>
              </button>

            </div>

            <div className="mb-4 text-sm">

              <p><b>Registro:</b> {grupoSeleccionado.nroRegistro}</p>
              <p><b>Grupo:</b> {grupoSeleccionado.grupo}</p>

            </div>

            <div className="space-y-3">

              <div>
                <label className="text-sm">Estado</label>
                <input
                  className="border p-2 w-full rounded"
                  defaultValue={grupoSeleccionado.estadoGrupo}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="text-sm">Desayuno</label>
                  <input
                    type="number"
                    className="border p-2 w-full rounded"
                    defaultValue={grupoSeleccionado.desayuno}
                  />
                </div>

                <div>
                  <label className="text-sm">Almuerzo</label>
                  <input
                    type="number"
                    className="border p-2 w-full rounded"
                    defaultValue={grupoSeleccionado.almuerzo}
                  />
                </div>

                <div>
                  <label className="text-sm">Merienda</label>
                  <input
                    type="number"
                    className="border p-2 w-full rounded"
                    defaultValue={grupoSeleccionado.merienda}
                  />
                </div>

                <div>
                  <label className="text-sm">Cena</label>
                  <input
                    type="number"
                    className="border p-2 w-full rounded"
                    defaultValue={grupoSeleccionado.cena}
                  />
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
