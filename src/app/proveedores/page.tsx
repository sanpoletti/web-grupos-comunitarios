'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from "@/components/ui/button";

export default function ProveedoresPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    cuit: '',
    telefono: '',
    email: '',
    domicilio: '',
    localidad: '',
    provincia: '1', // Default: CABA
    barrio: '',
    observaciones: '',
  });

  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [barrios, setBarrios] = useState([]);

  useEffect(() => {
    const fetchProvincias = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/provincias');
        const data = await res.json();
        setProvincias(data);
      } catch (error) {
        console.error("Error cargando provincias:", error);
      }
    };
    fetchProvincias();
  }, []);

  useEffect(() => {
    if (!formData.provincia) {
      setLocalidades([]);
      setBarrios([]);
      return;
    }

    if (formData.provincia === '1') {
      const fetchBarrios = async () => {
        try {
          const res = await fetch('http://localhost:3000/api/barrios');
          const data = await res.json();
          const mapped = data.map((b: any) => ({
            idbarrio: b.IDBARRIO,
            descripcion: b.DESCRIPCION
          }));
          setBarrios(mapped);
          setLocalidades([]);
        } catch (error) {
          console.error("Error cargando barrios:", error);
        }
      };
      fetchBarrios();
    } else {
      const fetchLocalidades = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/localidades?provincia=${formData.provincia}`);
          const data = await res.json();
          setLocalidades(data);
          setBarrios([]);
        } catch (error) {
          console.error("Error cargando localidades:", error);
        }
      };
      fetchLocalidades();
    }
  }, [formData.provincia]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      idProveedor: 0,
      razonSocial: formData.nombre,
      abreviatura: formData.nombre.substring(0, 10),
      cuit: formData.cuit,
      direccion: formData.domicilio,
      email: formData.email,
      telefono: formData.telefono,
      provincia: Number(formData.provincia),
      localidad: formData.provincia === '1' ? null : (formData.localidad ? Number(formData.localidad) : null),
      barrio: formData.provincia === '1' ? (formData.barrio ? Number(formData.barrio) : null) : null,
      codigoPostal: null,
    };

    try {
      const response = await fetch('http://localhost:3000/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        alert("Error al grabar proveedor");
        return;
      }

      alert(`Proveedor guardado correctamente. ID generado: ${data.proveedor.idproveedor}`);
    } catch (error) {
      console.error("Error al conectar con backend:", error);
      alert("No se pudo conectar con el backend");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Gestión de Proveedores</h1>

      <Card className="max-w-2xl shadow-lg border border-gray-200">
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <Label htmlFor="nombre">Nombre / Razón Social</Label>
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="cuit">CUIT</Label>
              <Input id="cuit" name="cuit" value={formData.cuit} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div>
              <Label htmlFor="domicilio">Domicilio</Label>
              <Input id="domicilio" name="domicilio" value={formData.domicilio} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provincia">Provincia</Label>
                <select
                  id="provincia"
                  name="provincia"
                  className="w-full border rounded-md p-2"
                  value={formData.provincia}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {provincias.map((p: any) => (
                    <option key={p.idProvincia} value={p.idProvincia}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor={formData.provincia === '1' ? 'barrio' : 'localidad'}>
                  {formData.provincia === '1' ? 'Barrio' : 'Localidad'}
                </Label>
                <select
                  id={formData.provincia === '1' ? 'barrio' : 'localidad'}
                  name={formData.provincia === '1' ? 'barrio' : 'localidad'}
                  className="w-full border rounded-md p-2"
                  value={formData.provincia === '1' ? formData.barrio : formData.localidad}
                  onChange={handleChange}
                  disabled={!formData.provincia}
                >
                  <option value="">Seleccione...</option>
                  {formData.provincia === '1'
                    ? barrios.map((b: any) => (
                        <option key={b.idbarrio} value={b.idbarrio}>{b.descripcion}</option>
                      ))
                    : localidades.map((l: any) => (
                        <option key={l.idLocalidad} value={l.idLocalidad}>{l.localidad}</option>
                      ))
                  }
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea id="observaciones" name="observaciones" value={formData.observaciones} onChange={handleChange} />
            </div>

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                className="px-8 py-3 text-lg font-semibold rounded-xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
              >
                Guardar proveedor
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
