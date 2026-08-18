//MOVIES

export interface Pelicula {
  id: number
  title: string
  platform: string
  archivo: string
}

//forma del backend
export interface MovieDTO {
  id: number
  path: string
  tittle: string
  category: string
  views: number
  description: string
  state: boolean
}

//SERIES

export interface Episode {
  id: number
  number: number
  title: string
  description: string
  path: string
}

export interface Season {
  id: number
  numero: number
  descripcion: string
  episodes: Episode[]
}

export interface Serie {
  id: number
  tittle: string
  category: string
  seasons: Season[]
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

/**esto es por ahora, hasta que avance el back - sirve para demostrar el estado visto/no_visto */
export type DenunciaUI = Denuncia & {
  es_nueva: boolean
  nombre_audiovisual: string
}