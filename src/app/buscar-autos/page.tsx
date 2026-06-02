"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
  fuel_type: string | null;
  transmission: string | null;
  color: string | null;
  status: string;
  created_at: string;
  is_featured: boolean | null;
  featured_until: string | null;
  car_images: CarImage[] | null;
};

type Filters = {
  brand: string;
  model: string;
  region: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  maxMileage: string;
  fuelType: string;
  transmission: string;
};

function BuscarAutosContent() {
    const searchParams = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  

  const initialFilters: Filters = {
  brand: searchParams.get("brand") || "",
  model: searchParams.get("model") || "",
  region: searchParams.get("region") || "",
  minPrice: "",
  maxPrice: "",
  minYear: "",
  maxYear: "",
  maxMileage: "",
  fuelType: "",
  transmission: "",
};

const [filters, setFilters] = useState<Filters>(initialFilters);

  const isFeaturedActive = (car: Car) => {
    if (!car.is_featured || !car.featured_until) return false;
    return new Date(car.featured_until) > new Date();
  };

  const sortCars = (list: Car[]) => {
    return [...list].sort((a, b) => {
      const aFeatured = isFeaturedActive(a);
      const bFeatured = isFeaturedActive(b);

      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  };

  const loadCars = async (customFilters = filters) => {
    try {
      setLoading(true);

      let query = supabase
        .from("cars")
        .select(
          `
          *,
          car_images (
            image_url,
            sort_order
          )
        `
        )
        .eq("status", "approved");

      if (customFilters.brand.trim()) {
        query = query.ilike("brand", `%${customFilters.brand.trim()}%`);
      }

      if (customFilters.model.trim()) {
        query = query.ilike("model", `%${customFilters.model.trim()}%`);
      }

      if (customFilters.region.trim()) {
        query = query.ilike("region", `%${customFilters.region.trim()}%`);
      }

      if (customFilters.minPrice.trim()) {
        query = query.gte("price", Number(customFilters.minPrice));
      }

      if (customFilters.maxPrice.trim()) {
        query = query.lte("price", Number(customFilters.maxPrice));
      }

      if (customFilters.minYear.trim()) {
        query = query.gte("year", Number(customFilters.minYear));
      }

      if (customFilters.maxYear.trim()) {
        query = query.lte("year", Number(customFilters.maxYear));
      }

      if (customFilters.maxMileage.trim()) {
        query = query.lte("mileage", Number(customFilters.maxMileage));
      }

      if (customFilters.fuelType.trim()) {
        query = query.eq("fuel_type", customFilters.fuelType);
      }

      if (customFilters.transmission.trim()) {
        query = query.eq("transmission", customFilters.transmission);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const formattedCars = ((data || []) as Car[]).map((car) => ({
        ...car,
        car_images: (car.car_images || []).sort(
          (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
        ),
      }));

      setCars(sortCars(formattedCars));
    } catch (error) {
      console.error(error);
      alert("Error cargando autos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  loadCars(initialFilters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const applyFilters = async () => {
    await loadCars(filters);
  };

  const clearFilters = async () => {
    const emptyFilters: Filters = {
      brand: "",
      model: "",
      region: "",
      minPrice: "",
      maxPrice: "",
      minYear: "",
      maxYear: "",
      maxMileage: "",
      fuelType: "",
      transmission: "",
    };

    setFilters(emptyFilters);
    await loadCars(emptyFilters);
  };

  return (
    <main className="bg-slate-50">
      <section className="bg-[#071A3D] text-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h1 className="text-3xl font-bold md:text-4xl">
            Autos publicados
          </h1>

          <p className="mt-3 max-w-2xl text-slate-200">
            Busca autos nuevos y usados publicados en MiMotor.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border-2 border-blue-950 bg-white p-5 shadow-2xl shadow-blue-950/25">
          <h2 className="mb-4 font-bold">Buscar autos</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              value={filters.brand}
              onChange={(e) =>
                setFilters({ ...filters, brand: e.target.value })
              }
              placeholder="Marca"
              className="rounded-lg border px-3 py-3"
            />

            <input
              value={filters.model}
              onChange={(e) =>
                setFilters({ ...filters, model: e.target.value })
              }
              placeholder="Modelo"
              className="rounded-lg border px-3 py-3"
            />

            <input
              value={filters.region}
              onChange={(e) =>
                setFilters({ ...filters, region: e.target.value })
              }
              placeholder="Región"
              className="rounded-lg border px-3 py-3"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className="rounded-lg border px-5 py-3 font-semibold hover:bg-slate-100"
            >
              {showMoreFilters ? "Ocultar filtros" : "Más filtros"}
            </button>

            {!showMoreFilters && (
              <>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
                >
                  Buscar
                </button>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-lg border px-6 py-3 font-semibold hover:bg-slate-100"
                >
                  Limpiar filtros
                </button>
              </>
            )}
          </div>

          {showMoreFilters && (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <input
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value })
                }
                placeholder="Precio mínimo"
                type="number"
                className="rounded-lg border px-3 py-3"
              />

              <input
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value })
                }
                placeholder="Precio máximo"
                type="number"
                className="rounded-lg border px-3 py-3"
              />

              <input
                value={filters.minYear}
                onChange={(e) =>
                  setFilters({ ...filters, minYear: e.target.value })
                }
                placeholder="Año mínimo"
                type="number"
                className="rounded-lg border px-3 py-3"
              />

              <input
                value={filters.maxYear}
                onChange={(e) =>
                  setFilters({ ...filters, maxYear: e.target.value })
                }
                placeholder="Año máximo"
                type="number"
                className="rounded-lg border px-3 py-3"
              />

              <input
                value={filters.maxMileage}
                onChange={(e) =>
                  setFilters({ ...filters, maxMileage: e.target.value })
                }
                placeholder="Kilometraje máximo"
                type="number"
                className="rounded-lg border px-3 py-3"
              />

              <select
                value={filters.fuelType}
                onChange={(e) =>
                  setFilters({ ...filters, fuelType: e.target.value })
                }
                className="rounded-lg border px-3 py-3"
              >
                <option value="">Combustible</option>
                <option value="Bencina">Bencina</option>
                <option value="Diésel">Diésel</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Eléctrico">Eléctrico</option>
                <option value="Gas">Gas</option>
              </select>

              <select
                value={filters.transmission}
                onChange={(e) =>
                  setFilters({ ...filters, transmission: e.target.value })
                }
                className="rounded-lg border px-3 py-3"
              >
                <option value="">Transmisión</option>
                <option value="Manual">Manual</option>
                <option value="Automática">Automática</option>
              </select>

              <button
                type="button"
                onClick={applyFilters}
                className="rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Buscar
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border px-4 py-3 font-semibold hover:bg-slate-100"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        {loading ? (
          <p>Cargando autos...</p>
        ) : cars.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-slate-600">
              No encontramos autos con esos filtros.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {cars.length} auto{cars.length === 1 ? "" : "s"} encontrado
                {cars.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => {
                const mainImage = car.car_images?.[0]?.image_url;
                const featured = isFeaturedActive(car);

                return (
                  <Link
                    key={car.id}
                    href={`/autos/${car.id}`}
                    className={`overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg ${
                      featured ? "border-2 border-yellow-400" : "border"
                    }`}
                  >
                    <div className="relative aspect-square bg-slate-200">
                      {mainImage ? (
                        <>
                          <img
                            src={mainImage}
                            alt={`${car.brand} ${car.model}`}
                            className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
                          />

                          <div className="absolute inset-0 bg-black/10" />

                          <img
                            src={mainImage}
                            alt={`${car.brand} ${car.model}`}
                            className="relative z-10 h-full w-full object-contain p-2"
                          />
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-500">
                          Sin foto
                        </div>
                      )}

                      {featured && (
                        <span className="absolute left-3 top-3 z-20 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-slate-900">
                          Destacado
                        </span>
                      )}

                      <span className="absolute bottom-3 right-3 z-20 rounded-md bg-white/50 px-2 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                        mimotor.cl
                      </span>
                    </div>

                    <div className="p-4">
                      <h2 className="text-lg font-bold">
                        {car.brand} {car.model}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {car.year} · {car.commune || "Comuna no informada"},{" "}
                        {car.region || "Región no informada"}
                      </p>

                      <p className="mt-3 text-2xl font-bold text-blue-700">
                        ${car.price.toLocaleString("es-CL")}
                      </p>

                      <p className="mt-3 text-sm text-slate-600">
                        {car.mileage
                          ? `${car.mileage.toLocaleString("es-CL")} km`
                          : "Kilometraje no informado"}{" "}
                        · {car.fuel_type || "Combustible no informado"} ·{" "}
                        {car.transmission || "Transmisión no informada"}
                      </p>

                      <div className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white">
                        Ver publicación
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
export default function BuscarAutosPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-10">
          <p>Cargando búsqueda...</p>
        </main>
      }
    >
      <BuscarAutosContent />
    </Suspense>
  );
}