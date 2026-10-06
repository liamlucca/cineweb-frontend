import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// each test starts with an empty page and no saved session
afterEach(() => {
  cleanup();
  localStorage.clear();
});
