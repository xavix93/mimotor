"use client";

import { useEffect, useRef, useState } from "react";
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
  created_at: string;
  is_featured: boolean | null;
  featured_until: string | null;
  car_images: CarImage[] | null;
};

export default function FeaturedCarsSlider() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const isFeaturedActive = (car: Car) => {
    if (!car.is_featured || !car.featured_until) return false;
    return new Date(car.featured_until) > new Date();
  };

  const loadFeaturedCars = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
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
        .eq("status", "approved")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error.message);
        return;
      }

      const formattedCars = ((data || []) as Car[])
        .filter((car) => isFeaturedActive(car))
        .map((car) => ({
          ...car,
          car_images: (car.car_images || []).sort(
            (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
          ),
        }));

      setCars(formattedCars);
    } catch (error) {
      console.error("Error cargando destacados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeaturedCars();
  }, []);

  useEffect(() => {
    if (cars.length <= 1) return;

    const interval = setInterval(() => {
      if (!sliderRef.current) return;

      const container = sliderRef.current;
      const cardWidth = 320;

      if (
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth - 20
      ) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [cars.length]);

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -340, behavior: "smooth" });
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 340, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10">
        <p>Cargando destacados...</p>
      </section>
    );
  }

  if (cars.length === 0) {
    return null;
  }

  return (
    <section className="bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Autos destacados
            </h2>
            <p className="text-sm text-slate-600">
              Publicaciones con mayor visibilidad en MiMotor.
            </p>
          </div>

          <Link
            href="/autos"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Ver todos
          </Link>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white px-3 py-2 shadow md:block"
          >
            ‹
          </button>

          <div
            ref={sliderRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-4"
          >
            {cars.map((car) => {
              const mainImage = car.car_images?.[0]?.image_url;

              return (
                <Link
                  key={car.id}
                  href={`/autos/${car.id}`}
                  className="min-w-[280px] max-w-[280px] overflow-hidden rounded-2xl border-2 border-yellow-400 bg-white shadow transition hover:-translate-y-1 hover:shadow-xl md:min-w-[320px] md:max-w-[320px]"
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

                    <span className="absolute left-3 top-3 z-20 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-slate-900">
                      Destacado
                    </span>

                    <div className="absolute bottom-3 right-3 z-20">
  <img
    src="/watermark-logo.png"
    alt="MiMotor"
    className="h-14 w-auto opacity-80 "
  />
</div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold">
                      {car.brand} {car.model}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {car.year} · {car.commune || "Comuna no informada"},{" "}
                      {car.region || "Región no informada"}
                    </p>

                    <p className="mt-3 text-2xl font-bold text-blue-700">
                      ${car.price.toLocaleString("es-CL")}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {car.mileage
                        ? `${car.mileage.toLocaleString("es-CL")} km`
                        : "Kilometraje no informado"}{" "}
                      · {car.fuel_type || "Combustible no informado"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white px-3 py-2 shadow md:block"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}