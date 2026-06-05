import Link from "next/link";

export default function QuienesSomosPage() {
  return (
    <main className="bg-slate-50">
      <section className="bg-[#071A3D] text-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h1 className="text-3xl font-bold md:text-4xl">Quiénes somos</h1>

          <p className="mt-3 max-w-2xl text-slate-200">
            MiMotor.cl es una plataforma chilena pensada para facilitar la
            búsqueda, publicación y contacto entre compradores y vendedores de
            vehículos.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-slate-900">
            Una forma simple de buscar y vender vehículos
          </h2>

          <p className="mt-4 leading-7 text-slate-700">
            MiMotor nace con el objetivo de entregar una experiencia clara,
            directa y fácil de usar para quienes buscan comprar o vender un auto
            en Chile. La idea es reunir publicaciones de vehículos en una
            plataforma ordenada, visual y accesible, permitiendo que los usuarios
            puedan comparar opciones, guardar favoritos y contactar directamente
            al vendedor.
          </p>

          <p className="mt-4 leading-7 text-slate-700">
            Nuestro enfoque está en la simplicidad: publicar un vehículo,
            buscar por filtros relevantes y facilitar el contacto entre las
            partes, sin procesos innecesariamente complicados.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">Misión</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Facilitar la compra y venta de vehículos mediante una plataforma
                simple, segura y orientada al usuario.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">Visión</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Convertirnos en una alternativa confiable y moderna para buscar
                vehículos en el mercado chileno.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">Compromiso</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Mejorar continuamente la experiencia de publicación, búsqueda y
                contacto dentro de MiMotor.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-blue-50 p-5">
            <h3 className="font-bold text-blue-950">
              Plataforma independiente
            </h3>

            <p className="mt-2 text-sm leading-6 text-blue-900">
              MiMotor.cl actúa como plataforma de publicación y contacto. No es
              propietario de los vehículos publicados ni participa directamente
              en la compraventa entre compradores y vendedores.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/buscar-autos"
              className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Buscar autos
            </Link>

            <Link
              href="/publicar"
              className="rounded-lg border px-5 py-3 font-semibold hover:bg-slate-100"
            >
              Publicar vehículo
            </Link>

            <Link
              href="/contacto"
              className="rounded-lg border px-5 py-3 font-semibold hover:bg-slate-100"
            >
              Contactar
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}