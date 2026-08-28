import { defineConfig } from 'vitest/config';

// Config runner Vitest partagée (Windows + sessions Cowork montées en Linux).
// `pool: 'threads'` est requis pour que les tests démarrent depuis le montage
// réseau ; il est sans effet négatif en local. Remplace le fichier temporaire
// .vitest-pool.tmp.mts (supprimé, vérifié absent le 2026-08-28).
// Branché via `angular.json` → architect.test.options.runnerConfig.
// by project-worker 2026-08-28
export default defineConfig({
  test: {
    pool: 'threads',
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
