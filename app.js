const express = require("express");
const cors = require("cors");
const db = require("./db/db");
const userRoutes = require("./routes/users");
const affirmationRoutes = require("./routes/affirmationRoutes");
const webPush = require("web-push");
const userAffirmationRoutes = require("./routes/userAffirmationRoutes");

const app = express();
const PORT = 4000;

// Middleware untuk mengurai JSON
app.use(express.json());

app.use(
  cors({
    origin: "https://katakitamah.up.railway.app/", // Ganti dengan domain frontend Anda
    credentials: true, // Jika perlu
  })
);

// Menggunakan routes
app.use("/users", userRoutes);
app.use("/api", affirmationRoutes);
app.use("/api/user-affirmations", userAffirmationRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
