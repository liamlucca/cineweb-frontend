import { useState } from "react"
import { useNavigate } from "react-router-dom"

import "../styles/ComplaintPage.css";

import type { DenunciaUI } from "../types/index.ts"

export default function ComplaintPage() {
  const navigate = useNavigate()
  const [mostrar, setMostrar] = useState(true) 
  
  //es para tener algo en el front por el momento
  const denuncias: DenunciaUI[] = [
    {
      id_denuncia: 1,
      id_audiovisual: 10,
      tipo_reportes: "Acoso y bullying",
      id_denunciado: 2,
      id_administrador: 1,
      estado: true,
      es_nueva: true,
      nombre_audiovisual: "Shrek 2",
    },
    {
      id_denuncia: 2,
      id_audiovisual: 11,
      tipo_reportes: "Contenido sexual",
      id_denunciado: 3,
      id_administrador: 1,
      estado: true,
      es_nueva: false,
      nombre_audiovisual: "Euphoria",
    },
  ]

  if (!mostrar) return null
  
  return (
    <div className="fondo-recuadro">
        <div className="recuadro">
          <button className="cerrar-recuadro" onClick={() => setMostrar(false)}>
            x
          </button>
          <h2>Denuncias Recibidas</h2>

          {denuncias.map((d) =>(
            <div key={d.id_denuncia} className="denuncia-c">

              <div className="denuncia-titulo">
                <div className="denuncia-texto">
                  <span>
                     Recibió una denuncia.<br></br>
                  </span>

                  <span>
                    Audiovisual: {d.nombre_audiovisual}
                  </span>
                </div>

                <span className={d.es_nueva ? "ojo azul":"ojo gris"} title={d.es_nueva ? "nueva" : "vista"}>
                  👁
                </span>
              </div>

              <p className="denuncia-motivo">
                Motivo: <b>{d.tipo_reportes}</b>
              </p>

              <button className="apelar-boton" onClick={() => navigate("/apelar")}>
                Apelar
              </button>
            </div>
          ))}
        </div>
    </div>
  )
}