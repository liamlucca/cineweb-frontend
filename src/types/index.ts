export interface Pelicula {
  id: number
  titulo: string
  plataforma: string
  archivo: string
}

/**REPORTES*/

/* Array con los types posibles de Motivos en un Reporte */
export const TIPOS_REPORTE = [
  'Violencia',
  'Contenido sexual',
  'Acoso y bullying',
  'Incitacion al odio y abuso',
  'Actividades peligrosas o dañinas',
  'Otro'
] as const

/* Define el type de motivos */
export type MotivoReporte = typeof TIPOS_REPORTE[number]

/**seria necesario guardar el id de usuario para evitar que reporte mas de una vez? */
export interface Reporte {
  contador: number
  motivo: MotivoReporte
  otro_motivo: string

  id_usuarios: number[]
}
 /**DENUNCIAS */

export interface Denuncia {
  id_audiovisual: number

  //motivo con la mayor cant de reportes
  tipo_reportes: MotivoReporte

  id_denunciado: number
  id_administrador: number
  estado: boolean
  id_denuncia: number
}
