"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeSearchBox() {
  const router = useRouter();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [region, setRegion] = useState("");

  const searchCars = () => {
    const params = new URLSearchParams();

    if (brand.trim()) params.set("brand", brand.trim());
    if (model.trim()) params.set("model", model.trim());
    if (region.trim()) params.set("region", region.trim());

    const query = params.toString();

    router.push(query ? `/buscar-autos?${query}` : "/buscar-autos");
  };

  const clearSearch = () => {
    setBrand("");
    setModel("");
    setRegion("");
  };

  return (
    <section className="mx-auto -mt-8 max-w-6xl px-4">
      <div className="rounded-2xl border-2 border-blue-950 bg-white p-5 shadow-2xl shadow-blue-950/25">
        <h2 className="mb-4 font-bold text-slate-900">Buscar autos</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Marca"
            className="rounded-lg border px-3 py-3"
            onKeyDown={(e) => {
              if (e.key === "Enter") searchCars();
            }}
          />

          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Modelo"
            className="rounded-lg border px-3 py-3"
            onKeyDown={(e) => {
              if (e.key === "Enter") searchCars();
            }}
          />

          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Región"
            className="rounded-lg border px-3 py-3"
            onKeyDown={(e) => {
              if (e.key === "Enter") searchCars();
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={searchCars}
            className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Buscar
          </button>

          <button
            type="button"
            onClick={clearSearch}
            className="rounded-lg border px-6 py-3 font-semibold hover:bg-slate-100"
          >
            Limpiar
          </button>
        </div>
      </div>
    </section>
  );
}