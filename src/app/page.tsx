"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import HomeBannerSlider from "@/components/HomeBannerSlider";

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

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [filters, setFilters] = useState<Filters>({
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
  });

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

  const loadCars = async () => {
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

      if (filters.brand.trim()) {
        query = query.ilike("brand", `%${filters.brand.trim()}%`);
      }

      if (filters.model.trim()) {
        query = query.ilike("model", `%${filters.model.trim()}%`);
      }

      if (filters.region.trim()) {
        query = query.ilike("region", `%${filters.region.trim()}%`);
      }

      if (filters.minPrice.trim()) {
        query = query.gte("price", Number(filters.minPrice));
      }

      if (filters.maxPrice.trim()) {
        query = query.lte("price", Number(filters.maxPrice));
      }

      if (filters.minYear.trim()) {
        query = query.gte("year", Number(filters.minYear));
      }

      if (filters.maxYear.trim()) {
        query = query.lte("year", Number(filters.maxYear));
      }

      if (filters.maxMileage.trim()) {
        query = query.lte("mileage", Number(filters.maxMileage));
      }

      if (filters.fuelType.trim()) {
        query = query.eq("fuel_type", filters.fuelType);
      }

      if (filters.transmission.trim()) {
        query = query.eq("transmission", filters.transmission);
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
    loadCars();
  }, []);

  const applyFilters = async () => {
    await loadCars();
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

    setTimeout(() => {
      loadCars();
    }, 100);
  };

  return (
    
    <main className="bg-slate-50">
      <section className="bg-blue-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h1 className="text-3xl font-bold md:text-5xl">
            Encuentra tu próximo auto en MiMotor
          </h1>

          <p className="mt-4 max-w-2xl text-slate-200">
            MiMotor es un portal para publicar, buscar y contactar vendedores de
            autos nuevos y usados.
          </p>
        </div>
      </section>

  <HomeBannerSlider />

      <section className="mx-auto -mt-2 max-w-6xl px-4 py-8">
        <div className="rounded-2xl bg-white p-10 p-5 shadow-2xl shadow-blue-950/25">
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
                  <div className="relative h-56 bg-slate-200">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={`${car.brand} ${car.model}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500">
                        Sin foto
                      </div>
                    )}

                    {featured && (
                      <span className="absolute left-3 top-3 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-slate-900">
                        Destacado
                      </span>
                    )}
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
        )}
      </section>
    </main>
  );
}