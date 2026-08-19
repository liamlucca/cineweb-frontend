import { Serie } from "../types/index.ts"

export const MOCK_SERIE: Serie = {
  id: 1,
  tittle: "juan",
  category: "accio  ",
  seasons: [
    {
      id: 1,
      numero: 1,
      descripcion: "Primera temporada de la serie",
      episodes: [
        { id: 1, number: 1, title: "Episodio 1", description: "Descripción del episodio 1.", path: "/" },
        { id: 2, number: 2, title: "Episodio 2", description: "Descripción del episodio 2.", path: "/" },
      ],
    },
    {
      id: 2,
      numero: 2,
      descripcion: "Segunda temporada de la serie",
      episodes: [
        { id: 3, number: 1, title: "Episodio 1", description: "Descripción del episodio 1, temporada 2.", path: "/" },
      ],
    },
  ],
}