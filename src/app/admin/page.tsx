"use client";

import { useEffect, useMemo, useState } from "react";
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
  status: string;
  created_at: string;
  seller_name: string | null;
  seller_phone: string | null;
  is_featured: boolean | null;
  featured_until: string | null;
  car_images: CarImage[];
};

type TabType = "featured" | "pending" | "approved" | "rejected";
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

  const [activeTab, setActiveTab] = useState<TabType>("pending");
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

  useEffect(() => {
    loadAdmin();
  }, []);

  const featuredCars = cars.filter((car) => isFeaturedActive(car));
  const pendingCars = cars.filter((car) => car.status === "pending");
  const approvedCars = cars.filter((car) => car.status === "approved");
  const rejectedCars = cars.filter((car) => car.status === "rejected");

  const currentTabCars = useMemo(() => {
    let list: Car[] = [];

    if (activeTab === "featured") list = featuredCars;
    if (activeTab === "pending") list = pendingCars;
    if (activeTab === "approved") list = approvedCars;
    if (activeTab === "rejected") list = rejectedCars;

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

    const sorted = [...list].sort((a, b) => {
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
        const dateA = a.featured_until
          ? new Date(a.featured_until).getTime()
          : Infinity;
        const dateB = b.featured_until
          ? new Date(b.featured_until).getTime()
          : Infinity;

        return dateA - dateB;
      }

      return 0;
    });

    return sorted;
  }, [
    activeTab,
    brandFilter,
    sortBy,
    cars,
    featuredCars,
    pendingCars,
    approvedCars,
    rejectedCars,
  ]);

  const tabData = [
    {
      key: "featured" as TabType,
      label: "Destacados activos",
      count: featuredCars.length,
    },
    {
      key: "pending" as TabType,
      label: "Pendientes",
      count: pendingCars.length,
    },
    {
      key: "approved" as TabType,
      label: "Aprobados",
      count: approvedCars.length,
    },
    {
      key: "rejected" as TabType,
      label: "Rechazados",
      count: rejectedCars.length,
    },
  ];

  const activeTabTitle =
    tabData.find((tab) => tab.key === activeTab)?.label || "Publicaciones";

  const activeTabDescription =
    activeTab === "featured"
      ? "Autos destacados activos. Puedes ordenarlos por vencimiento, fecha, marca o precio."
      : activeTab === "pending"
      ? "Publicaciones pendientes de revisión, ordenadas según el filtro seleccionado."
      : activeTab === "approved"
      ? "Publicaciones aprobadas y visibles públicamente."
      : "Publicaciones rechazadas o no visibles públicamente.";

  const renderCarCard = (car: Car) => {
    const mainImage = car.car_images?.[0]?.image_url || null;
    const featured = isFeaturedActive(car);
    const remainingDays = getRemainingDays(car.featured_until);

    return (
      <div
        key={car.id}
        className={`overflow-hidden rounded-2xl bg-white shadow ${
          featured ? "border-2 border-yellow-400" : ""
        }`}
      >
        <div className="grid gap-4 p-4 md:grid-cols-[220px_1fr]">
          <div className="overflow-hidden rounded-xl bg-slate-200">
            {mainImage ? (
              <img
                src={mainImage}
                alt={`${car.brand} ${car.model}`}
                className="h-40 w-full object-cover"
              />
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                Sin foto
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold">
                {car.brand} {car.model} {car.year}
              </h2>

              {featured && (
                <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-950">
                  Destacado
                </span>
              )}

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                {car.status === "pending"
                  ? "Pendiente"
                  : car.status === "approved"
                  ? "Aprobado"
                  : "Rechazado"}
              </span>
            </div>

            <p className="font-semibold text-blue-700">
              ${car.price.toLocaleString("es-CL")}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {car.region || "Región no informada"},{" "}
              {car.commune || "Comuna no informada"} ·{" "}
              {car.mileage
                ? `${car.mileage.toLocaleString("es-CL")} km`
                : "Kilometraje no informado"}
            </p>

            <p className="mt-2 text-sm text-slate-600">
              <strong>Fecha de publicación:</strong> {formatDate(car.created_at)}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              <strong>Vendedor:</strong> {car.seller_name || "No informado"} ·{" "}
              {car.seller_phone || "Sin teléfono"}
            </p>

            {featured && (
              <p className="mt-2 text-sm font-semibold text-yellow-700">
                Destacado hasta: {formatDate(car.featured_until)} · Quedan{" "}
                {remainingDays} día(s)
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`/autos/${car.id}`}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Ver
              </a>

              <button
                type="button"
                onClick={() => updateStatus(car.id, "approved")}
                className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Aprobar
              </button>

              <button
                type="button"
                onClick={() => updateStatus(car.id, "rejected")}
                className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white"
              >
                Rechazar
              </button>

              <button
                type="button"
                onClick={() => updateStatus(car.id, "pending")}
                className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white"
              >
                Dejar pendiente
              </button>

              <button
                type="button"
                onClick={() => featureCar(car.id, 7)}
                className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-yellow-950"
              >
                Destacar 7 días
              </button>

              <button
                type="button"
                onClick={() => featureCar(car.id, 30)}
                className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-yellow-950"
              >
                Destacar 30 días
              </button>

              <button
                type="button"
                onClick={() => removeFeatured(car.id)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Quitar destacado
              </button>

              <button
                type="button"
                onClick={() => deleteCar(car.id)}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        <h1 className="text-2xl font-bold">Acceso restringido</h1>
        <p className="mt-2 text-slate-600">
          No tienes permisos para entrar al panel administrador.
        </p>

        {errorMessage && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">Panel administrador</h1>

      <p className="mb-6 text-sm text-slate-600">
        Administra publicaciones por estado, fecha de publicación, marca,
        precio y destacados comerciales.
      </p>

      {errorMessage && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {tabData.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setSortBy(tab.key === "featured" ? "featured_expiring" : "newest");
            }}
            className={`rounded-2xl p-4 text-left shadow transition ${
              activeTab === tab.key
                ? tab.key === "featured"
                  ? "bg-yellow-100 ring-2 ring-yellow-400"
                  : "bg-blue-50 ring-2 ring-blue-600"
                : tab.key === "featured"
                ? "bg-yellow-50 hover:bg-yellow-100"
                : "bg-white hover:bg-slate-50"
            }`}
          >
            <p
              className={`text-sm ${
                tab.key === "featured" ? "text-yellow-700" : "text-slate-500"
              }`}
            >
              {tab.label}
            </p>

            <p
              className={`text-2xl font-bold ${
                tab.key === "featured" ? "text-yellow-800" : "text-slate-900"
              }`}
            >
              {tab.count}
            </p>
          </button>
        ))}
      </div>

      <section className="mb-8 rounded-2xl bg-white p-4 shadow">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Buscar por marca, modelo o vendedor
            </label>
            <input
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              placeholder="Ej: BMW, Toyota, Automotora..."
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Ordenar publicaciones
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="newest">Más recientes primero</option>
              <option value="oldest">Más antiguas primero</option>
              <option value="brand_az">Marca / modelo A-Z</option>
              <option value="brand_za">Marca / modelo Z-A</option>
              <option value="price_high">Mayor precio primero</option>
              <option value="price_low">Menor precio primero</option>
              <option value="featured_expiring">
                Destacados que vencen primero
              </option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setBrandFilter("");
                setSortBy(activeTab === "featured" ? "featured_expiring" : "newest");
              }}
              className="w-full rounded-lg border px-3 py-2 font-semibold hover:bg-slate-50"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold">{activeTabTitle}</h2>
            <p className="text-sm text-slate-600">{activeTabDescription}</p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">
            {currentTabCars.length} publicación(es)
          </span>
        </div>

        {currentTabCars.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-slate-600">
              No hay publicaciones para mostrar con estos filtros.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {currentTabCars.map((car) => renderCarCard(car))}
          </div>
        )}
      </section>
    </main>
  );
}