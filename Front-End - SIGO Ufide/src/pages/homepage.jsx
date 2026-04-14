import React from "react";

export default function HomePage() {
  return (
    <main className="h-[calc(100vh-2rem)] w-full">
      <section className="relative h-full overflow-hidden rounded-[28px] bg-white shadow-xl">
        <div className="grid h-full grid-cols-1 lg:grid-cols-12">

          <div className="relative z-10 flex items-center bg-white px-8 py-10 sm:px-12 lg:col-span-4 lg:px-14">
            <div className="max-w-md">
              <img
                src="/img/Logo-Ufide-1.png"
                alt="Universidad Fidélitas"
                className="h-20 w-auto object-contain sm:h-24"
              />

              <div className="mt-8 h-1 w-20 rounded-full bg-[#FFDA00]" />

              <h1 className="mt-6 text-3xl font-extrabold leading-tight text-[#2B338C] sm:text-4xl lg:text-5xl">
                Gestión de Ofertas Académicas
              </h1>

              <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
                Plataforma institucional para la administración y seguimiento de ofertas académicas.
              </p>
            </div>
          </div>

          <div className="relative lg:col-span-8">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/img/Campus-4.jpg')",
              }}
            />

            <div className="absolute inset-0 bg-[#2B338C]/10" />

            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/35 to-transparent" />
          </div>
        </div>
      </section>
    </main>
  );
}