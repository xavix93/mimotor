"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  region: string | null;
  commune: string | null;
  seller_name: string | null;
  seller_phone: string | null;
  status: string;
  is_featured: boolean;
  created_at: string;
  car_images: {
    image_url: string;
    sort_order?: number | null;
  }[];
};

export default function AdminPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminAndLoadCars = async () => {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.user) {
      window.location.href = "/login";
      return;
    }

    const user = sessionData.session.user;

    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (adminError || !adminData) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);

    const { data, error } = await supabase
      .from("cars")
      .select("*, car_images(image_url, sort_order)")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const orderedCars = ((data || []) as Car[]).map((car) => ({
      ...car,
      car_images: [...(car.car_images || [])].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      ),
    }));

    setCars(orderedCars);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("cars")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    checkAdminAndLoadCars();
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("cars")
      .update({ is_featured: !currentValue })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    checkAdminAndLoadCars();
  };

  const deleteCar = async (id: string) => {
    const confirmDelete = confirm(
      "¿Seguro que deseas eliminar esta publicación?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase.from("cars").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    checkAdminAndLoadCars();
  };

  useEffect(() => {
    checkAdminAndLoadCars();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p>Cargando panel administrador...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">Acceso restringido</h1>
          <p className="mt-2 text-slate-600">
            Tu cuenta no tiene permisos de administrador.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Panel administrador</h1>
        <p className="text-sm text-slate-600">
          Aprueba, rechaza, destaca o elimina publicaciones de MiMotor.
        </p>
      </div>

      {cars.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow">
          <p>No hay publicaciones registradas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cars.map((car) => (
            <div
              key={car.id}
              className="grid gap-4 rounded-2xl bg-white p-4 shadow md:grid-cols-[180px_1fr]"
            >
              <div className="h-32 overflow-hidden rounded-xl bg-slate-200">
                {car.car_images?.[0]?.image_url ? (
                  <img
                    src={car.car_images[0].image_url}
                    alt={`${car.brand} ${car.model}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Sin foto
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-col justify-between gap-3 md:flex-row">
                  <div>
                    <h2 className="text-lg font-bold">
                      {car.brand} {car.model} {car.year}
                    </h2>

                    <p className="text-sm text-slate-600">
                      {car.region || "Región no informada"},{" "}
                      {car.commune || "Comuna no informada"} ·{" "}
                      {car.mileage
                        ? `${car.mileage.toLocaleString("es-CL")} km`
                        : "Kilometraje no informado"}
                    </p>

                    <p className="mt-1 font-semibold text-blue-700">
                      ${car.price.toLocaleString("es-CL")}
                    </p>

                    <p className="mt-1 text-sm">
                      Vendedor: {car.seller_name || "No informado"} ·{" "}
                      {car.seller_phone || "Sin teléfono"}
                    </p>

                    <p className="mt-1 text-sm">
                      Estado:{" "}
                      <span className="font-bold">
                        {car.status === "pending"
                          ? "Pendiente"
                          : car.status === "approved"
                          ? "Aprobado"
                          : "Rechazado"}
                      </span>
                    </p>

                    {car.is_featured && (
                      <span className="mt-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                        Destacado
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-start gap-2">
                    <a
                      href={`/autos/${car.id}`}
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      Ver
                    </a>

                    <button
                      onClick={() => updateStatus(car.id, "approved")}
                      className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white"
                    >
                      Aprobar
                    </button>

                    <button
                      onClick={() => updateStatus(car.id, "rejected")}
                      className="rounded-lg bg-orange-500 px-3 py-2 text-sm text-white"
                    >
                      Rechazar
                    </button>

                    <button
                      onClick={() => toggleFeatured(car.id, car.is_featured)}
                      className="rounded-lg bg-yellow-500 px-3 py-2 text-sm text-white"
                    >
                      {car.is_featured ? "Quitar destacado" : "Destacar"}
                    </button>

                    <button
                      onClick={() => deleteCar(car.id)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}