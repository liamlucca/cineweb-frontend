/// <reference types="vite/client" />

  // .env variables
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // "true" uses the fake auth service until the backend has /auth endpoints
  readonly VITE_USE_MOCK_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
