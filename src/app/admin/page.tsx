"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminBanners from "@/components/AdminBanners";

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
  status: string;
  created_at: string;
  seller_name: string | null;
  seller_phone: string | null;
  is_featured: boolean | null;
  featured_until: string | null;
  car_images: CarImage[];
};

type CarTabType = "pending" | "approved" | "rejected" | "featured";
type AdminSection = "cars" | "banners";

type SortType =
  | "newest"
  | "oldest"
  | "brand_az"
  | "brand_za"
  | "price_high"
  | "price_low"
  | "featured_expiring";

export default function AdminPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [adminSection, setAdminSection] = useState<AdminSection>("cars");
  const [activeTab, setActiveTab] = useState<CarTabType>("pending");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [brandFilter, setBrandFilter] = useState("");

  const formatDate = (date: string | null) => {
    if (!date) return "Sin fecha";

    return new Date(date).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRemainingDays = (date: string | null) => {
    if (!date) return 0;

    const today = new Date();
    const endDate = new Date(date);
    const diff = endDate.getTime() - today.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isFeaturedActive = (car: Car) => {
    return Boolean(
      car.is_featured &&
        car.featured_until &&
        new Date(car.featured_until) > new Date()
    );
  };

  const loadAdmin = async () => {
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

      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (adminError || !adminData) {
        setIsAdmin(false);
        setErrorMessage("No tienes permisos para acceder al panel administrador.");
        return;
      }

      setIsAdmin(true);

      const { data, error } = await supabase
        .from("cars")
        .select("*, car_images(image_url, sort_order)")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const orderedCars = ((data || []) as Car[]).map((car) => ({
        ...car,
        car_images: [...(car.car_images || [])].sort(
          (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
        ),
      }));

      setCars(orderedCars);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error cargando el panel administrador.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("cars")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadAdmin();
  };

  const featureCar = async (id: string, days: number) => {
    const until = new Date();
    until.setDate(until.getDate() + days);

    const { error } = await supabase
      .from("cars")
      .update({
        is_featured: true,
        featured_until: until.toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadAdmin();
  };

  const removeFeatured = async (id: string) => {
    const { error } = await supabase
      .from("cars")
      .update({
        is_featured: false,
        featured_until: null,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadAdmin();
  };

  const deleteCar = async (id: string) => {
    const confirmDelete = confirm(
      "¿Seguro que deseas eliminar esta publicación?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase.from("cars").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadAdmin();
  };

  const currentTabCars = useMemo(() => {
    let list = [...cars];

    if (activeTab === "pending") {
      list = list.filter((car) => car.status === "pending");
    }

    if (activeTab === "approved") {
      list = list.filter((car) => car.status === "approved");
    }

    if (activeTab === "rejected") {
      list = list.filter((car) => car.status === "rejected");
    }

    if (activeTab === "featured") {
      list = list.filter((car) => isFeaturedActive(car));
    }

    if (brandFilter.trim()) {
      const filter = brandFilter.toLowerCase().trim();

      list = list.filter((car) => {
        const brand = car.brand?.toLowerCase() || "";
        const model = car.model?.toLowerCase() || "";
        const seller = car.seller_name?.toLowerCase() || "";

        return (
          brand.includes(filter) ||
          model.includes(filter) ||
          seller.includes(filter)
        );
      });
    }

    return [...list].sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }

      if (sortBy === "brand_az") {
        return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
      }

      if (sortBy === "brand_za") {
        return `${b.brand} ${b.model}`.localeCompare(`${a.brand} ${a.model}`);
      }

      if (sortBy === "price_high") {
        return b.price - a.price;
      }

      if (sortBy === "price_low") {
        return a.price - b.price;
      }

      if (sortBy === "featured_expiring") {
        return (
          new Date(a.featured_until || "9999-12-31").getTime() -
          new Date(b.featured_until || "9999-12-31").getTime()
        );
      }

      return 0;
    });
  }, [cars, activeTab, brandFilter, sortBy]);

  const featuredCount = cars.filter((car) => isFeaturedActive(car)).length;
  const pendingCount = cars.filter((car) => car.status === "pending").length;
  const approvedCount = cars.filter((car) => car.status === "approved").length;
  const rejectedCount = cars.filter((car) => car.status === "rejected").length;

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p>Cargando panel administrador...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-xl bg-red-50 p-4 text-red-700">
          {errorMessage ||
            "No tienes permisos para acceder al panel administrador."}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">Panel de administración</h1>

      <p className="mb-6 text-sm text-slate-600">
        Administra publicaciones, autos destacados y banners dinámicos de
        portada.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setAdminSection("cars")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            adminSection === "cars"
              ? "bg-blue-700 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          Publicaciones
        </button>

        <button
          type="button"
          onClick={() => setAdminSection("banners")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            adminSection === "banners"
              ? "bg-blue-700 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          Banners de portada
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {adminSection === "cars" && (
        <section className="rounded-2xl border-2 border-blue-950 bg-white p-6 shadow-2xl shadow-blue-950/20">
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`rounded-2xl p-5 text-left shadow transition hover:-translate-y-1 hover:shadow-lg ${
                activeTab === "pending"
                  ? "bg-orange-500 text-white"
                  : "bg-orange-50 text-orange-800"
              }`}
            >
              <p className="text-sm font-semibold">Publicaciones</p>
              <h2 className="mt-2 text-2xl font-bold">Pendientes</h2>
              <p className="mt-2 text-3xl font-bold">{pendingCount}</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("approved")}
              className={`rounded-2xl p-5 text-left shadow transition hover:-translate-y-1 hover:shadow-lg ${
                activeTab === "approved"
                  ? "bg-green-600 text-white"
                  : "bg-green-50 text-green-800"
              }`}
            >
              <p className="text-sm font-semibold">Publicaciones</p>
              <h2 className="mt-2 text-2xl font-bold">Aprobadas</h2>
              <p className="mt-2 text-3xl font-bold">{approvedCount}</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rejected")}
              className={`rounded-2xl p-5 text-left shadow transition hover:-translate-y-1 hover:shadow-lg ${
                activeTab === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <p className="text-sm font-semibold">Publicaciones</p>
              <h2 className="mt-2 text-2xl font-bold">Rechazadas</h2>
              <p className="mt-2 text-3xl font-bold">{rejectedCount}</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("featured")}
              className={`rounded-2xl p-5 text-left shadow transition hover:-translate-y-1 hover:shadow-lg ${
                activeTab === "featured"
                  ? "bg-yellow-400 text-slate-900"
                  : "bg-yellow-50 text-yellow-800"
              }`}
            >
              <p className="text-sm font-semibold">Publicaciones</p>
              <h2 className="mt-2 text-2xl font-bold">Destacadas</h2>
              <p className="mt-2 text-3xl font-bold">{featuredCount}</p>
            </button>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-3">
            <input
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              placeholder="Buscar por marca, modelo o vendedor"
              className="rounded-lg border px-3 py-2 md:col-span-2"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="rounded-lg border px-3 py-2"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="brand_az">Marca A-Z</option>
              <option value="brand_za">Marca Z-A</option>
              <option value="price_high">Mayor precio</option>
              <option value="price_low">Menor precio</option>
              <option value="featured_expiring">Destacados por vencer</option>
            </select>
          </div>

          {currentTabCars.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
              No hay publicaciones en esta sección.
            </div>
          ) : (
            <div className="space-y-4">
              {currentTabCars.map((car) => {
                const mainImage = car.car_images?.[0]?.image_url;
                const featured = isFeaturedActive(car);

                return (
                  <div
                    key={car.id}
                    className={`rounded-2xl border bg-white p-4 shadow-sm ${
                      featured ? "border-yellow-400" : ""
                    }`}
                  >
                    <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                      <div className="overflow-hidden rounded-xl bg-slate-200">
                        {mainImage ? (
                          <img
                            src={mainImage}
                            alt={`${car.brand} ${car.model}`}
                            className="h-36 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-36 items-center justify-center text-sm text-slate-500">
                            Sin foto
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h2 className="font-bold">
                              {car.brand} {car.model} {car.year}
                            </h2>

                            <p className="text-sm text-slate-500">
                              Publicado: {formatDate(car.created_at)}
                            </p>

                            <p className="text-sm text-slate-500">
                              {car.region || "Región no informada"},{" "}
                              {car.commune || "Comuna no informada"} ·{" "}
                              {car.mileage
                                ? `${car.mileage.toLocaleString("es-CL")} km`
                                : "Kilometraje no informado"}
                            </p>

                            <p className="mt-1 font-semibold text-blue-700">
                              ${car.price.toLocaleString("es-CL")}
                            </p>

                            <p className="mt-1 text-sm">
                              Estado:{" "}
                              <span className="font-semibold">
                                {car.status === "pending"
                                  ? "Pendiente"
                                  : car.status === "approved"
                                  ? "Aprobado"
                                  : "Rechazado"}
                              </span>
                            </p>

                            <p className="text-sm text-slate-500">
                              Vendedor: {car.seller_name || "No informado"} ·{" "}
                              {car.seller_phone || "Sin teléfono"}
                            </p>

                            {featured && (
                              <p className="mt-1 text-sm font-semibold text-yellow-700">
                                Destacado hasta {formatDate(car.featured_until)}{" "}
                                ({getRemainingDays(car.featured_until)} días)
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/autos/${car.id}`}
                              className="rounded-lg border px-3 py-2 text-sm"
                            >
                              Ver
                            </Link>

                            <button
                              type="button"
                              onClick={() => updateStatus(car.id, "approved")}
                              className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white"
                            >
                              Aprobar
                            </button>

                            <button
                              type="button"
                              onClick={() => updateStatus(car.id, "rejected")}
                              className="rounded-lg bg-orange-600 px-3 py-2 text-sm text-white"
                            >
                              Rechazar
                            </button>

                            <button
                              type="button"
                              onClick={() => updateStatus(car.id, "pending")}
                              className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white"
                            >
                              Pendiente
                            </button>

                            <button
                              type="button"
                              onClick={() => featureCar(car.id, 7)}
                              className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-slate-900"
                            >
                              Destacar 7 días
                            </button>

                            <button
                              type="button"
                              onClick={() => featureCar(car.id, 30)}
                              className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-slate-900"
                            >
                              Destacar 30 días
                            </button>

                            {featured && (
                              <button
                                type="button"
                                onClick={() => removeFeatured(car.id)}
                                className="rounded-lg border px-3 py-2 text-sm"
                              >
                                Quitar destacado
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => deleteCar(car.id)}
                              className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {adminSection === "banners" && <AdminBanners />}
    </main>
  );
}