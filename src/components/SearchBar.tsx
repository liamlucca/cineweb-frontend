
function SearchBar() {
  return (
    <div className=" lg:text-start mt-5 *:ml-5"> {/*ese asterisco modifica a los hijos*/}

        {/*INPUT DE BUSCAR*/}
        <label className="input max-sm:w-[45%] lg:w-[75%]">
        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
            >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
            </g>
        </svg>
        <input type="search" required placeholder="Escriba un título o filtre por categoría..." />
        </label>

        {/*BOTÓN DE BUSCAR*/}
        <button className="btn btn-square">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
        </button>

        {/*FILTROS*/}
        <details className="dropdown">
        <summary className="btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>
        </summary>
        <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm min-[493px]:max-sm:-translate-x-40"> 
            <li><label className="label"><input type="checkbox" defaultChecked className="checkbox" />CATEGORÍA 1</label></li>
            <li><label className="label"><input type="checkbox" defaultChecked className="checkbox" />CATEGORÍA 2</label></li>
            <li><label className="label"><input type="checkbox" defaultChecked className="checkbox" />CATEGORÍA 3</label></li>
        </ul>
        </details>

        {/*BOTÓN DE REPORTAR*/}
        <button className="btn btn-square"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" /></svg>
        </button>


    </div>
  )
}

export default SearchBar