"use client";

import Link from "next/link";
import HomeBannerSlider from "@/components/HomeBannerSlider";
import FeaturedCarsSlider from "@/components/FeaturedCarsSlider";
import HomeSearchBox from "@/components/HomeSearchBox";

export default function HomePage() {
  return (
    <main className="bg-slate-25">
      <section className="bg-[#071A3D] text-white">
        <div className="mx-auto max-w-6xl px-6 py-2">
          <h1 className="text-3xl font-bold md:text-5xl">
            Encuentra tu próximo auto en MiMotor
          </h1>

          <p className="mt-4 max-w-2xl text-slate-200">
            Publica, busca y contacta vendedores de autos nuevos y usados en
            Chile.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
           
          </div>
        </div>
      </section>
      <HomeSearchBox />

      <HomeBannerSlider />

      <FeaturedCarsSlider />

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-2xl font-bold">Compra y vende fácil en MiMotor</h2>

          <p className="mt-3 text-slate-600">
            Explora publicaciones destacadas, guarda tus favoritos y contacta
            directamente por WhatsApp al vendedor.
          </p>

          <div className="mt-5">
            <Link
              href="/autos"
              className="inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white"
            >
              Ver todos los autos
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}