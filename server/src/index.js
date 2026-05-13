import dotenv from "dotenv";
import dns from "node:dns";
import path from "node:path";
import { fileURLToPath } from "node:url";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { ensureRegistrationIndexes } from "./models/registration.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });
dotenv.config({ path: path.resolve(__dirname, ".env.local"), override: true, quiet: true });

if (process.env.DNS_SERVERS) {
  dns.setServers(
    process.env.DNS_SERVERS.split(",")
      .map((server) => server.trim())
      .filter(Boolean)
  );
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await ensureRegistrationIndexes();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
