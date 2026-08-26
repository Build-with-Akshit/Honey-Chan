import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

// Root
app.get("/", (_req, res) => {
  res.json({
    name: "Honey Chain API Service",
    version: "1.0.0",
    docs: "/api/status",
    theme: "Ministry of MSME - KVIC Honey Mission SIH26021",
  });
});

app.listen(PORT, () => {
  console.log(`🍯 Honey Chain Backend API listening on http://localhost:${PORT}`);
});
