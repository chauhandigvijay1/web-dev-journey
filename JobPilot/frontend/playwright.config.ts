import { defineConfig } from "@playwright/test";
import path from "node:path";

const frontendDir = __dirname;
const backendDir = path.resolve(__dirname, "../backend");

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command:
        "powershell -Command \"$env:NODE_ENV='test'; $env:PORT='5051'; $env:REMINDER_SWEEP_SECRET='e2e-secret'; npm.cmd run dev\"",
      cwd: backendDir,
      url: "http://localhost:5051/api/health",
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command: "node tests/e2e/fixture-server.mjs",
      cwd: frontendDir,
      url: "http://127.0.0.1:4010/job-posting",
      timeout: 60_000,
      reuseExistingServer: false,
    },
    {
      command:
        "powershell -Command \"$env:NEXT_PUBLIC_API_URL='http://localhost:5051'; npm.cmd run dev\"",
      cwd: frontendDir,
      url: "http://localhost:3000",
      timeout: 120_000,
      reuseExistingServer: false,
    },
  ],
});
