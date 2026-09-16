import { Series } from "../types/index.ts"

export const MOCK_SERIES: Series = {
  id: 1,
  title: "juan",
  category: "action",
  seasons: [
    {
      id: 1,
      number: 1,
      description: "First season of the series",
      episodes: [
        { id: 1, number: 1, title: "Episode 1", description: "Description of episode 1.", path: "/" },
        { id: 2, number: 2, title: "Episode 2", description: "Description of episode 2.", path: "/" },
      ],
    },
    {
      id: 2,
      number: 2,
      description: "Second season of the series",
      episodes: [
        { id: 3, number: 1, title: "Episode 1", description: "Description of episode 1, season 2.", path: "/" },
      ],
    },
  ],
}
