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
  status: string;
  created_at: string;
};

export default function DashboardPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyCars = async () => {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        alert(sessionError.message);
        return;
      }

      if (!sessionData.session?.user) {
        window.location.href = "/login";
        return;
      }

      const user = sessionData.session.user;

      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
        return;
      }

      setCars((data || []) as Car[]);
    } catch (error) {
      console.error(error);
      alert("Error cargando tus publicaciones.");
    } finally {
      setLoading(false);
    }
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

    await loadMyCars();
  };

  useEffect(() => {
    loadMyCars();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p>Cargando publicaciones...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mi panel</h1>
          <p className="text-sm text-slate-600">
            Aquí puedes revisar tus autos publicados en MiMotor.
          </p>
        </div>

        <a
          href="/publicar"
          className="rounded-lg bg-blue-700 px-4 py-2 text-white"
        >
          Publicar auto
        </a>
      </div>

      {cars.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-slate-600">Todavía no tienes publicaciones.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cars.map((car) => (
            <div
              key={car.id}
              className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h2 className="font-bold">
                  {car.brand} {car.model} {car.year}
                </h2>

                <p className="text-sm text-slate-500">
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
                  Estado:{" "}
                  <span className="font-semibold">
                    {car.status === "pending"
                      ? "Pendiente"
                      : car.status === "approved"
                      ? "Aprobado"
                      : "Rechazado"}
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={`/autos/${car.id}`}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  Ver
                </a>

                <a
                  href={`/dashboard/editar/${car.id}`}
                  className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white"
                >
                  Editar
                </a>

                <button
                  type="button"
                  onClick={() => deleteCar(car.id)}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}