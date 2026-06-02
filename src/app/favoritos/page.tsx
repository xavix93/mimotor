"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import FavoriteButton from "@/components/FavoriteButton";

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
  status: string;
  created_at: string;
};

type Favorite = {
  id: string;
  car_id: string;
  created_at: string;
  cars: Car[] | null;
};

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
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
        .from("favorites")
        .select(
          `
          id,
          car_id,
          created_at,
          cars (
            id,
            brand,
            model,
            year,
            price,
            mileage,
            region,
            commune,
            fuel_type,
            transmission,
            status,
            created_at
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
        return;
      }

      setFavorites((data || []) as unknown as Favorite[]);
    } catch (error) {
      console.error(error);
      alert("Error cargando favoritos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p>Cargando favoritos...</p>
      </main>
    );
  }

  const activeFavorites = favorites.filter((favorite) => {
    const car = favorite.cars?.[0];
    return car && car.status === "approved";
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mis favoritos</h1>
        <p className="mt-2 text-slate-600">
          Autos que guardaste para revisar más tarde.
        </p>
      </div>

      {activeFavorites.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-slate-600">
            Todavía no tienes autos favoritos guardados.
          </p>

          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white"
          >
            Ver autos publicados
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {activeFavorites.map((favorite) => {
            const car = favorite.cars?.[0];

            if (!car) return null;

            return (
              <div
                key={favorite.id}
                className="rounded-2xl bg-white p-4 shadow transition hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">
                      {car.brand} {car.model}
                    </h2>

                    <p className="text-sm text-slate-500">
                      {car.year} · {car.commune || "Comuna no informada"}
                    </p>
                  </div>

                  <FavoriteButton carId={car.id} />
                </div>

                <p className="mb-2 text-xl font-bold text-blue-700">
                  ${car.price.toLocaleString("es-CL")}
                </p>

                <p className="mb-4 text-sm text-slate-600">
                  {car.mileage
                    ? `${car.mileage.toLocaleString("es-CL")} km`
                    : "Kilometraje no informado"}{" "}
                  · {car.fuel_type || "Combustible no informado"} ·{" "}
                  {car.transmission || "Transmisión no informada"}
                </p>

                <Link
                  href={`/autos/${car.id}`}
                  className="block rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  Ver publicación
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}