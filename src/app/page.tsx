"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

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
  is_featured: boolean;
  car_images: {
    image_url: string;
    sort_order: number;
  }[];
};

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [region, setRegion] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [maxMileage, setMaxMileage] = useState("");

  const loadCars = async () => {
    let query = supabase
      .from("cars")
      .select("*, car_images(image_url, sort_order)")
      .eq("status", "approved")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (brand) query = query.ilike("brand", `%${brand}%`);
    if (model) query = query.ilike("model", `%${model}%`);
    if (region) query = query.ilike("region", `%${region}%`);
    if (fuelType) query = query.eq("fuel_type", fuelType);
    if (transmission) query = query.eq("transmission", transmission);

    if (minPrice) query = query.gte("price", Number(minPrice));
    if (maxPrice) query = query.lte("price", Number(maxPrice));
    if (minYear) query = query.gte("year", Number(minYear));
    if (maxYear) query = query.lte("year", Number(maxYear));
    if (maxMileage) query = query.lte("mileage", Number(maxMileage));

    const { data, error } = await query;

    if (error) {
      console.error(error.message);
      return;
    }

    const orderedCars = ((data || []) as Car[]).map((car) => ({
      ...car,
      car_images: [...(car.car_images || [])].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      ),
    }));

    setCars(orderedCars);
  };

  const clearFilters = () => {
    setBrand("");
    setModel("");
    setRegion("");
    setFuelType("");
    setTransmission("");
    setMinPrice("");
    setMaxPrice("");
    setMinYear("");
    setMaxYear("");
    setMaxMileage("");

    setTimeout(() => {
      loadCars();
    }, 100);
  };

  useEffect(() => {
    loadCars();
  }, []);

  return (
    <main>
      <section className="bg-slate-900 px-4 py-14 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">
            Compra y vende autos en Chile
          </h1>

          <p className="mt-3 max-w-xl text-slate-300">
            MiMotor es un portal para publicar, buscar y contactar vendedores de autos nuevos y usados.
          </p>

          
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-4 font-bold">Buscar autos</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              placeholder="Marca"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="rounded-lg border px-3 py-2"
            />

            <input
              placeholder="Modelo"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-lg border px-3 py-2"
            />

            <input
              placeholder="Región"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg border px-3 py-2"
            />

            <input
              placeholder="Precio mínimo"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="rounded-lg border px-3 py-2"
            />

            <input
              placeholder="Precio máximo"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="rounded-lg border px-3 py-2"
            />

            <input
              placeholder="Año mínimo"
              type="number"
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
              className="rounded-lg border px-3 py-2"
            />

            <input
              placeholder="Año máximo"
              type="number"
              value={maxYear}
              onChange={(e) => setMaxYear(e.target.value)}
              className="rounded-lg border px-3 py-2"
            />

            <input
              placeholder="Kilometraje máximo"
              type="number"
              value={maxMileage}
              onChange={(e) => setMaxMileage(e.target.value)}
              className="rounded-lg border px-3 py-2"
            />

            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="rounded-lg border px-3 py-2"
            >
              <option value="">Combustible</option>
              <option value="Bencina">Bencina</option>
              <option value="Diésel">Diésel</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Eléctrico">Eléctrico</option>
            </select>

            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="rounded-lg border px-3 py-2"
            >
              <option value="">Transmisión</option>
              <option value="Manual">Manual</option>
              <option value="Automática">Automática</option>
            </select>

            <button
              onClick={loadCars}
              className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white"
            >
              Buscar
            </button>

            <button
              onClick={clearFilters}
              className="rounded-lg border px-4 py-2 font-semibold"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {cars.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <h2 className="text-xl font-bold">
              Todavía no hay autos aprobados
            </h2>
            <p className="mt-2 text-slate-600">
              Publica un vehículo y apruébalo desde el panel administrador para verlo aquí.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {cars.map((car) => (
              <Link
  key={car.id}
  href={`/autos/${car.id}`}
  className={`overflow-hidden rounded-2xl shadow transition hover:-translate-y-1 hover:shadow-lg ${
    car.is_featured
      ? "border-2 border-yellow-400 bg-yellow-50"
      : "bg-white"
  }`}
>
                <div className="h-48 bg-slate-200">
                  {car.car_images?.[0]?.image_url ? (
                    <img
                      src={car.car_images[0].image_url}
                      alt={`${car.brand} ${car.model}`}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-slate-500">
                      Sin foto
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {car.is_featured && (
                   <span className="mb-2 inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-950">
  Destacado
</span>
                  )}

                  <h2 className="text-lg font-bold">
                    {car.brand} {car.model}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {car.year} ·{" "}
                    {car.mileage
                      ? `${car.mileage.toLocaleString("es-CL")} km`
                      : "Km no informado"}
                  </p>

                  <p className="mt-3 text-xl font-bold text-blue-700">
                    ${car.price.toLocaleString("es-CL")}
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    {car.region || "Región no informada"},{" "}
                    {car.commune || "Comuna no informada"}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {car.fuel_type || "Combustible no informado"} ·{" "}
                    {car.transmission || "Transmisión no informada"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}