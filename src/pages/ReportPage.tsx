import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { TIPOS_REPORTE, MotivoReporte } from "../types"
import "../styles/ReportPage.css";

export default function ReportPage() {
  const navigate = useNavigate()

  //guarda la opcion seleccionada
  const [motivoSeleccionado, setmotivoSeleccionado] = useState<MotivoReporte | "">("")
  
  //el usuario selecciona otro - guarda la descripcion
  const [descripOtroMotivo, setdescripOtroMotivo] = useState("")

  const [mostrarGuardarEstado, setMostrarGuardarEstado] = useState(false);

  //abre recuadro de confirmacion
  const guardarReporte = () => {
    setMostrarGuardarEstado(true);
  }
  //confirma guardar - aca iria el backend
  const confirmarGuardarReporte = () => {
    console.log({
      motivoSeleccionado,
      descripOtroMotivo
    });

    setMostrarGuardarEstado(false);
  }

  return (
    <div className="reporte-seccion">
      
      <h1 className="titulo_reporte">
        Reportar:
      </h1>

      {/*opciones */}
      <div>
        {TIPOS_REPORTE.map((m) => (
          <label className="opciones-reporte" key={m}>
            {m}

            <input
              type="radio" //permite elegir solo uno
              name="motivo"
              value={m}
              checked={motivoSeleccionado === m}
              onChange={() => setmotivoSeleccionado(m)} //al hacer click guarda el valor
            />
          </label>
        ))}
      </div>

      {/*si selecciona "Otro" */}
      {motivoSeleccionado === "Otro" && (
        <div className="motivo-otro">
          <textarea 
            className="motivo-otro-reporte"
            placeholder="Escribí el motivo..."
            value={descripOtroMotivo}
            onChange={(e) => setdescripOtroMotivo(e.target.value)}
          />
        </div>
      )}

      {/*botones principales*/}
      <div className="b-principal">
        
        <button
          className="boton-cerrar-reporte"
          onClick={() => navigate("/")}
        >
          Cerrar
        </button>

        <button
          className="boton-guardar-reporte"
          onClick={guardarReporte}
        >
          Guardar
        </button>

      </div>

      {/*recuadro de confirmación */}
      {mostrarGuardarEstado && (
        <div className="b-fondo">
          <div className="recuadro">

            <p className="desea-guardar">¿Desea guardar el reporte?</p>

            <div className="botones-confirmar">

              <button 
                className="boton-cancelar-guardar" 
                onClick={() => {setMostrarGuardarEstado(false);
                navigate("/");
              }}
            >
                Cancelar
              </button>

              <button 
                className="boton-confirmar-guardar" 
                onClick={() => {
                  confirmarGuardarReporte();
                  navigate("/");
                }}
              >
                Guardar
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}