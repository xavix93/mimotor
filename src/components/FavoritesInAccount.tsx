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
  fuel_type: string | null;
  transmission: string | null;
  status: string;
  created_at: string;
};

type Favorite = {
  id: string;
  car_id: string;
  created_at: string;
};

export default function FavoritesInAccount() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadFavorites = async () => {
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

      const { data: favoriteData, error: favoriteError } = await supabase
        .from("favorites")
        .select("id, car_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (favoriteError) {
        setErrorMessage(favoriteError.message);
        return;
      }

      const favoriteList = (favoriteData || []) as Favorite[];
      setFavorites(favoriteList);

      if (favoriteList.length === 0) {
        setCars([]);
        return;
      }

      const carIds = favoriteList.map((favorite) => favorite.car_id);

      const { data: carData, error: carError } = await supabase
        .from("cars")
        .select(
          `
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
        `
        )
        .in("id", carIds);

      if (carError) {
        setErrorMessage(carError.message);
        return;
      }

      const carsList = (carData || []) as Car[];

      const orderedCars = carIds
        .map((id) => carsList.find((car) => car.id === id))
        .filter(Boolean) as Car[];

      setCars(orderedCars);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error cargando favoritos.");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (carId: string) => {
    const confirmDelete = confirm(
      "¿Quieres quitar este auto de tus favoritos?"
    );

    if (!confirmDelete) return;

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.user) {
      window.location.href = "/login";
      return;
    }

    const user = sessionData.session.user;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("car_id", carId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadFavorites();
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-600">Cargando favoritos...</p>;
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
        Error cargando favoritos: {errorMessage}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="rounded-xl bg-slate-50 p-5">
        <p className="text-sm text-slate-600">
          Todavía no tienes autos guardados como favoritos.
        </p>

        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Ver autos publicados
        </Link>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="rounded-xl bg-yellow-50 p-5 text-sm text-yellow-800">
        Tienes {favorites.length} favorito guardado, pero no se pudieron cargar
        los datos del auto. Revisa que el auto esté aprobado o que las políticas
        RLS de la tabla cars permitan verlo.
      </div>
    );
  }

  return (
    <div>
      <p className="mb-5 text-sm text-slate-600">
        Aquí aparecen los autos que guardaste para revisar más tarde.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {cars.map((car) => (
          <div
            key={car.id}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">
                  {car.brand} {car.model}
                </h2>

                <p className="text-sm text-slate-500">
                  {car.year} · {car.commune || "Comuna no informada"}
                </p>

                {car.status !== "approved" && (
                  <p className="mt-1 text-xs font-semibold text-yellow-700">
                    Este auto todavía no está aprobado públicamente.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeFavorite(car.id)}
                className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold text-red-600"
              >
                Quitar
              </button>
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
        ))}
      </div>
    </div>
  );
}