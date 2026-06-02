"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function MyPanelInAccount() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadMyCars = async () => {
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

      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setCars((data || []) as Car[]);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error cargando tus publicaciones.");
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
    return <p className="text-sm text-slate-600">Cargando publicaciones...</p>;
  }

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Mi panel</h2>
          <p className="text-sm text-slate-600">
            Revisa y administra tus autos publicados.
          </p>
        </div>

        <Link
          href="/publicar"
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Publicar auto
        </Link>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Error: {errorMessage}
        </div>
      )}

      {cars.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-5">
          <p className="text-sm text-slate-600">
            Todavía no tienes publicaciones.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cars.map((car) => (
            <div
              key={car.id}
              className="flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="font-bold">
                  {car.brand} {car.model} {car.year}
                </h3>

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

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/autos/${car.id}`}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  Ver
                </Link>

                <Link
                  href={`/dashboard/editar/${car.id}`}
                  className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white"
                >
                  Editar
                </Link>

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
    </section>
  );
}