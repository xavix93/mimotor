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
  const [step, setStep] = useState("Iniciando panel...");
  const [errorMessage, setErrorMessage] = useState("");

  const loadMyCars = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setStep("Buscando sesión del usuario...");

      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Timeout buscando sesión del usuario.")),
            8000
          )
        ),
      ]);

      const { data: sessionData, error: sessionError } = sessionResult as Awaited<
        ReturnType<typeof supabase.auth.getSession>
      >;

      if (sessionError) {
        setErrorMessage(sessionError.message);
        return;
      }

      if (!sessionData.session?.user) {
        setStep("No hay sesión. Redirigiendo al login...");
        window.location.href = "/login";
        return;
      }

      const user = sessionData.session.user;

      setStep(`Sesión encontrada: ${user.email}`);

      setStep("Consultando publicaciones del usuario...");

      const carsResult = await Promise.race([
        supabase
          .from("cars")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Timeout consultando publicaciones.")),
            8000
          )
        ),
      ]);

      const { data, error } = carsResult as {
        data: Car[] | null;
        error: { message: string } | null;
      };

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setCars(data || []);
      setStep("Panel cargado correctamente.");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Error desconocido."
      );
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

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mi panel</h1>
          <p className="text-sm text-slate-600">
            Aquí puedes revisar tus autos publicados en MiMotor.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Diagnóstico: {step}
          </p>
        </div>

        <a
          href="/publicar"
          className="rounded-lg bg-blue-700 px-4 py-2 text-white"
        >
          Publicar auto
        </a>
      </div>

      {loading && (
        <div className="mb-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
          Cargando publicaciones...
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Error: {errorMessage}
        </div>
      )}

      {!loading && cars.length === 0 ? (
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