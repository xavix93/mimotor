"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type CarImage = {
  image_url: string;
  sort_order: number | null;
};

type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  region: string | null;
  commune: string | null;
  status: string;
  created_at: string;
  seller_name: string | null;
  seller_phone: string | null;
  is_featured: boolean | null;
  featured_until: string | null;
  car_images: CarImage[];
};

export default function AdminPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAdmin = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        setErrorMessage(sessionError.message);
        return;
      }

      if (!sessionData.session?.user) {
        window.location.href = "/login";
        return;
      }

      const user = sessionData.session.user;

      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (adminError || !adminData) {
        setIsAdmin(false);
        setErrorMessage("No tienes permisos para acceder al panel administrador.");
        return;
      }

      setIsAdmin(true);

      const { data, error } = await supabase
        .from("cars")
        .select("*, car_images(image_url, sort_order)")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const orderedCars = (data || []).map((car: Car) => ({
        ...car,
        car_images: [...(car.car_images || [])].sort(
          (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
        ),
      }));

      setCars(orderedCars as Car[]);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error cargando el panel administrador.");
    } finally {
      setLoading(false);
    }
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

    await loadAdmin();
  };

  const featureCar = async (id: string, days: number) => {
    const until = new Date();
    until.setDate(until.getDate() + days);

    const { error } = await supabase
      .from("cars")
      .update({
        is_featured: true,
        featured_until: until.toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadAdmin();
  };

  const removeFeatured = async (id: string) => {
    const { error } = await supabase
      .from("cars")
      .update({
        is_featured: false,
        featured_until: null,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadAdmin();
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

    await loadAdmin();
  };

  useEffect(() => {
    loadAdmin();
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
        <h1 className="text-2xl font-bold">Acceso restringido</h1>
        <p className="mt-2 text-slate-600">
          No tienes permisos para entrar al panel administrador.
        </p>

        {errorMessage && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">Panel administrador</h1>

      <p className="mb-6 text-sm text-slate-600">
        Administra publicaciones, aprobación de autos y destacados comerciales.
      </p>

      {errorMessage && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {cars.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-slate-600">No hay publicaciones registradas.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {cars.map((car) => {
            const mainImage = car.car_images?.[0]?.image_url || null;

            const isFeaturedActive =
              car.is_featured &&
              car.featured_until &&
              new Date(car.featured_until) > new Date();

            return (
              <div
                key={car.id}
                className={`overflow-hidden rounded-2xl bg-white shadow ${
                  isFeaturedActive ? "border-2 border-yellow-400" : ""
                }`}
              >
                <div className="grid gap-4 p-4 md:grid-cols-[220px_1fr]">
                  <div className="overflow-hidden rounded-xl bg-slate-200">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={`${car.brand} ${car.model}`}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                        Sin foto
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold">
                        {car.brand} {car.model} {car.year}
                      </h2>

                      {isFeaturedActive && (
                        <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-950">
                          Destacado
                        </span>
                      )}

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                        {car.status === "pending"
                          ? "Pendiente"
                          : car.status === "approved"
                          ? "Aprobado"
                          : "Rechazado"}
                      </span>
                    </div>

                    <p className="font-semibold text-blue-700">
                      ${car.price.toLocaleString("es-CL")}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {car.region || "Región no informada"},{" "}
                      {car.commune || "Comuna no informada"} ·{" "}
                      {car.mileage
                        ? `${car.mileage.toLocaleString("es-CL")} km`
                        : "Kilometraje no informado"}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Vendedor: {car.seller_name || "No informado"} ·{" "}
                      {car.seller_phone || "Sin teléfono"}
                    </p>

                    {isFeaturedActive && (
                      <p className="mt-2 text-sm font-semibold text-yellow-700">
                        Destacado hasta:{" "}
                        {new Date(car.featured_until as string).toLocaleDateString(
                          "es-CL"
                        )}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`/autos/${car.id}`}
                        className="rounded-lg border px-3 py-2 text-sm"
                      >
                        Ver
                      </a>

                      <button
                        type="button"
                        onClick={() => updateStatus(car.id, "approved")}
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Aprobar
                      </button>

                      <button
                        type="button"
                        onClick={() => updateStatus(car.id, "rejected")}
                        className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Rechazar
                      </button>

                      <button
                        type="button"
                        onClick={() => featureCar(car.id, 7)}
                        className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-yellow-950"
                      >
                        Destacar 7 días
                      </button>

                      <button
                        type="button"
                        onClick={() => featureCar(car.id, 30)}
                        className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-yellow-950"
                      >
                        Destacar 30 días
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFeatured(car.id)}
                        className="rounded-lg border px-3 py-2 text-sm"
                      >
                        Quitar destacado
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteCar(car.id)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}