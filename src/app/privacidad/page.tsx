export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">Política de privacidad</h1>

        <div className="mt-6 space-y-5 text-slate-700">
          <p>
            En MiMotor.cl nos importa el cuidado de los datos personales de los
            usuarios que utilizan la plataforma.
          </p>

          <div>
            <h2 className="font-bold text-slate-900">
              Información que podemos recopilar
            </h2>
            <p className="mt-1">
              Podemos recopilar datos como nombre, correo electrónico, teléfono,
              información de publicaciones, fotografías de vehículos y datos de
              contacto ingresados por el usuario.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Uso de la información</h2>
            <p className="mt-1">
              La información se utiliza para permitir el funcionamiento de la
              plataforma, gestionar publicaciones, contactar usuarios y mejorar
              la experiencia del sitio.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Publicidad y analítica</h2>
            <p className="mt-1">
              MiMotor puede utilizar herramientas de analítica o publicidad para
              medir visitas, mejorar el sitio y mostrar contenido relevante.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Contacto</h2>
            <p className="mt-1">
              Para solicitudes relacionadas con privacidad, puedes escribir a
              contacto@mimotor.cl.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}