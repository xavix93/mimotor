"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type AdminTab = "pending" | "approved" | "rejected" | "featured";

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
  seller_name: string | null;
  seller_phone: string | null;
  created_at: string;
  is_featured: boolean | null;
  featured_until: string | null;
};

export default function AdminInAccount() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("pending");
  const [search, setSearch] = useState("");

  const isFeaturedActive = (car: Car) => {
    if (!car.is_featured || !car.featured_until) return false;
    return new Date(car.featured_until) > new Date();
  };

  const loadCars = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
        return;
      }

      setCars((data || []) as Car[]);
    } catch (error) {
      console.error(error);
      alert("Error cargando autos del admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("cars").update({ status }).eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadCars();
  };

  const deleteCar = async (id: string) => {
    const confirmDelete = confirm("¿Seguro que quieres eliminar este auto?");

    if (!confirmDelete) return;

    const { error } = await supabase.from("cars").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadCars();
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

    await loadCars();
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

    await loadCars();
  };

  const filteredCars = useMemo(() => {
    let list = [...cars];

    if (activeTab === "pending") {
      list = list.filter((car) => car.status === "pending");
    }

    if (activeTab === "approved") {
      list = list.filter((car) => car.status === "approved");
    }

    if (activeTab === "rejected") {
      list = list.filter((car) => car.status === "rejected");
    }

    if (activeTab === "featured") {
      list = list.filter((car) => isFeaturedActive(car));
    }

    if (search.trim()) {
      const text = search.toLowerCase().trim();

      list = list.filter((car) =>
        `${car.brand} ${car.model} ${car.seller_name || ""} ${
          car.seller_phone || ""
        }`
          .toLowerCase()
          .includes(text)
      );
    }

    return list;
  }, [cars, activeTab, search]);

  const countByTab = {
    pending: cars.filter((car) => car.status === "pending").length,
    approved: cars.filter((car) => car.status === "approved").length,
    rejected: cars.filter((car) => car.status === "rejected").length,
    featured: cars.filter((car) => isFeaturedActive(car)).length,
  };

  if (loading) {
    return <p className="text-sm text-slate-600">Cargando admin...</p>;
  }

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-xl font-bold">Admin</h2>
        <p className="text-sm text-slate-600">
          Revisa, aprueba, rechaza y destaca publicaciones.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            activeTab === "pending"
              ? "bg-blue-700 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          Pendientes ({countByTab.pending})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("approved")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            activeTab === "approved"
              ? "bg-blue-700 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          Aprobados ({countByTab.approved})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rejected")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            activeTab === "rejected"
              ? "bg-blue-700 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          Rechazados ({countByTab.rejected})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("featured")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            activeTab === "featured"
              ? "bg-yellow-400 text-slate-900"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          Destacados ({countByTab.featured})
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por marca, modelo, vendedor o teléfono"
        className="mb-5 w-full rounded-lg border px-3 py-2"
      />

      {filteredCars.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-5">
          <p className="text-sm text-slate-600">
            No hay publicaciones en esta sección.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCars.map((car) => (
            <div
              key={car.id}
              className={`rounded-2xl border bg-white p-4 shadow-sm ${
                isFeaturedActive(car) ? "border-yellow-400" : ""
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-bold">
                    {car.brand} {car.model} {car.year}
                  </h3>

                  <p className="text-sm text-slate-500">
                    Publicado:{" "}
                    {new Date(car.created_at).toLocaleDateString("es-CL")}
                  </p>

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

                  {isFeaturedActive(car) && (
                    <p className="mt-1 text-sm font-semibold text-yellow-700">
                      Destacado hasta{" "}
                      {new Date(car.featured_until as string).toLocaleDateString(
                        "es-CL"
                      )}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/autos/${car.id}`}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    Ver
                  </Link>

                  <button
                    type="button"
                    onClick={() => updateStatus(car.id, "approved")}
                    className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white"
                  >
                    Aprobar
                  </button>

                  <button
                    type="button"
                    onClick={() => updateStatus(car.id, "rejected")}
                    className="rounded-lg bg-orange-600 px-3 py-2 text-sm text-white"
                  >
                    Rechazar
                  </button>

                  <button
                    type="button"
                    onClick={() => updateStatus(car.id, "pending")}
                    className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white"
                  >
                    Pendiente
                  </button>

                  <button
                    type="button"
                    onClick={() => featureCar(car.id, 7)}
                    className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-slate-900"
                  >
                    Destacar 7 días
                  </button>

                  <button
                    type="button"
                    onClick={() => featureCar(car.id, 30)}
                    className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-slate-900"
                  >
                    Destacar 30 días
                  </button>

                  {isFeaturedActive(car) && (
                    <button
                      type="button"
                      onClick={() => removeFeatured(car.id)}
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      Quitar destacado
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteCar(car.id)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}