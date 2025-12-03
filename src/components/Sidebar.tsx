"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Users,
  ClipboardList,
  FileText,
  Settings,
  Building2,
  BarChart3,
  Search,
} from "lucide-react";
import Link from "next/link";

interface MenuItemProps {
  title: string;
  href?: string;
  icon?: JSX.Element;
  children?: React.ReactNode;
}

const MenuItem = ({ title, href, icon, children }: MenuItemProps) => {
  const [open, setOpen] = useState(false);

  if (children) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between text-gray-700 hover:text-indigo-600 p-2 rounded-lg transition font-medium"
        >
          <span className="flex items-center space-x-2">
            {icon}
            <span>{title}</span>
          </span>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {open && <div className="ml-6 mt-1 space-y-1">{children}</div>}
      </div>
    );
  }

  return (
    <Link
      href={href || "#"}
      className="block text-gray-600 hover:text-indigo-600 px-2 py-1 rounded transition font-medium"
    >
      {title}
    </Link>
  );
};

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
      <h2 className="text-xl font-semibold mb-6 text-indigo-700 tracking-wide">
        Menú Principal
      </h2>

      <nav className="flex-1 overflow-y-auto space-y-2">
        {/* Grupos */}
        <MenuItem title="Grupos" icon={<Users size={18} />}>
          <MenuItem title="Grupos (ABM)" href="/grupos" />
          <MenuItem title="Retiro de raciones" href="/retiros" />
          <MenuItem title="Rendiciones" href="/rendiciones" />
          <MenuItem title="Pliego de bases y condiciones" href="/pliego" />
        </MenuItem>
        <div className="h-2"></div> {/* pequeño espacio visual */}

        {/* Proveedores */}
        <MenuItem title="Proveedores" icon={<Building2 size={18} />}>
          <MenuItem title="Proveedores (ABM)" href="/proveedores" />
          <MenuItem title="Visitas / Supervisión" href="/visitas" />
        </MenuItem>
        <div className="h-2"></div> {/* pequeño espacio visual */}

        {/* Administración */}
        <MenuItem title="Administración" icon={<Settings size={18} />}>
          <MenuItem title="Equipos Visita / Supervisión" href="/equipos" />
          <MenuItem title="Cuentas / Tarjetas" href="/cuentas" />
          <MenuItem title="Suspensiones" href="/suspensiones" />
        </MenuItem>
        <div className="h-2"></div> {/* pequeño espacio visual */}

        {/* Separador visual */}
        <div className="mt-4 border-t border-gray-300 my-2"></div>

        {/* Consultas */}
        <MenuItem title="Consultas" icon={<Search size={18} />} href="/consultas" />
        <div className="h-2"></div> {/* pequeño espacio visual */}

        {/* Tablero */}
        <MenuItem title="Tablero" icon={<BarChart3 size={18} />} href="/tablero" />
      </nav>
    </aside>
  );
}
