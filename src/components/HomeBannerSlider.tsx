"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Banner = {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number | null;
};

export default function HomeBannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const loadBanners = async () => {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando banners:", error.message);
      return;
    }

    setBanners((data || []) as Banner[]);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((current) =>
        current + 1 >= banners.length ? 0 : current + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const activeBanner = banners[activeIndex];

  const bannerContent = (
    <div className="relative mx-auto h-[190px] max-w-6xl overflow-hidden rounded-2xl bg-slate-200 shadow-xl md:h-[320px]">
      <img
        src={activeBanner.image_url}
        alt={activeBanner.title || "Banner MiMotor"}
        className="h-full w-full object-cover"
      />

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full ${
                index === activeIndex ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Ver banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (activeBanner.link_url) {
    return (
      <section className="bg-slate-100 px-4 py-6">
        <a href={activeBanner.link_url} target="_blank">
          {bannerContent}
        </a>
      </section>
    );
  }

  return <section className="bg-slate-100 px-4 py-6">{bannerContent}</section>;
}