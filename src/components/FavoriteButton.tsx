"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type FavoriteButtonProps = {
  carId: string;
};

export default function FavoriteButton({ carId }: FavoriteButtonProps) {
  const [userId, setUserId] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadFavorite = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        setUserId("");
        setIsFavorite(false);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("car_id", carId)
        .maybeSingle();

      if (error) {
        console.error(error);
        setIsFavorite(false);
      } else {
        setIsFavorite(!!data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorite();
  }, [carId]);

  const toggleFavorite = async () => {
    if (!userId) {
      alert("Debes iniciar sesión para guardar favoritos.");
      window.location.href = "/login";
      return;
    }

    setSaving(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("car_id", carId);

        if (error) {
          alert(error.message);
          return;
        }

        setIsFavorite(false);
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: userId,
          car_id: carId,
        });

        if (error) {
          alert(error.message);
          return;
        }

        setIsFavorite(true);
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar favorito.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="rounded-full border bg-white px-3 py-2 text-sm text-slate-400"
      >
        ♡
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={saving}
      className={`rounded-full border px-3 py-2 text-sm font-semibold shadow-sm ${
        isFavorite
          ? "border-red-200 bg-red-50 text-red-600"
          : "bg-white text-slate-700 hover:bg-slate-100"
      }`}
    >
      {isFavorite ? "♥ Guardado" : "♡ Guardar"}
    </button>
  );
}