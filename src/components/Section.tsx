interface Pelicula {
  id: number
  titulo: string
  plataforma: string
}

interface SectionProps {
  titulo: string
  peliculas: Pelicula[]
}

function Section({ titulo, peliculas }: SectionProps) {


  function scrollIzquierda(e: React.MouseEvent<HTMLButtonElement>) {
    const carousel = e.currentTarget.parentElement?.querySelector('.carousel')
    carousel?.scrollBy({ left: -300, behavior: 'smooth' })
  }

  function scrollDerecha(e: React.MouseEvent<HTMLButtonElement>) {
    const carousel = e.currentTarget.parentElement?.querySelector('.carousel')
    carousel?.scrollBy({ left: 300, behavior: 'smooth' })
  }

  /*
  -------------------------------------
  Explicacion del scroll derecha/izquierda:
  1.
   <div className="relative group">      parentElement (aca hacemos el querySelector)
    ├── botón derecha                    currentTarget (el botón clickeado)
    ├── carousel
    └── botón izquierda
  </div>

  2.
  querySelector('.carousel')
  Es una función que busca adentro del elemento un hijo que tenga esa clase (en este caso carousel1)

  3.
  scrollBy
  Es una función del navegador que mueve el scroll de un elemento
 -------------------------------------
  */

  return (
    <div className="my-6">
      <h2 className="text-white text-xl font-bold mb-3 px-4">{titulo}</h2>

      <div className="flex group">

        {/* Flecha izquierda */}
        <button
          onClick={scrollIzquierda}
          className="self-center left-0 top-1/2 -translate-y-1/2 z-10 btn btn-circle btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ❮
        </button>

        {/* cada película */}
        <div className="carousel carousel-center gap-4 px-4 w-full justify-items-start">  {/*ACÁ ESTÁ EL JUSTIFICADO/CENTRADO*/}
          {peliculas.map((pelicula) => (
              <div key={pelicula.id} className="carousel-item">
              <div className="card bg-base-200 w-109 sm:w-44 md:w-48">  {/*ACÁ ESTÁ EL TAMAÑO DE LAS TARJETAS DE ACUERDO AL RESPONSIVE*/}
                <figure className="bg-base-300 h-24 sm:h-28">
                </figure>
                <div className="card-body p-3">
                  <p className="text-sm font-bold">{pelicula.titulo}</p>
                  <p className="text-xs text-gray-400">{pelicula.plataforma}</p>
                  <button className="btn btn-primary btn-sm mt-1">Ver más</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Flecha derecha */}
        <button
          onClick={scrollDerecha}
          className="self-center right-0 top-1/2 -translate-y-1/2 z-10 btn btn-circle btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ❯
        </button>

      </div>
    </div>
  )
}
export default Section

/*
[NOTA]: Esconder flecha a la izquierda si estás al principio de la pagina. Esconder flecha a la derecha si estás al final de la pagina.
*/