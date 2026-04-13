"use client";

import { useState } from "react";

export default function RegistroDerivacion() {
  const [grupo, setGrupo] = useState("");
  const [persona, setPersona] = useState("");

  const handleGuardar = () => {
    const nueva = {
      id: Date.now(),
      grupoOrigen: grupo,
      persona,
      estado: "PENDIENTE",
    };

    const existentes = JSON.parse(localStorage.getItem("derivaciones") || "[]");
    localStorage.setItem("derivaciones", JSON.stringify([...existentes, nueva]));

    alert("Derivación registrada");
    setGrupo("");
    setPersona("");
  };

  return (
    <div>
      <h1>Registrar Derivación</h1>

      <input
        placeholder="Grupo origen"
        value={grupo}
        onChange={(e) => setGrupo(e.target.value)}
      />

      <input
        placeholder="Persona"
        value={persona}
        onChange={(e) => setPersona(e.target.value)}
      />

      <button onClick={handleGuardar}>Guardar</button>
    </div>
  );
}