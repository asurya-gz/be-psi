const express = require("express");
const cors = require("cors");
const db = require("./db/db");
const userRoutes = require("./routes/users");
const affirmationRoutes = require("./routes/affirmationRoutes");
const webPush = require("web-push");
const userAffirmationRoutes = require("./routes/userAffirmationRoutes");
const cron = require("node-cron");
const util = require("util");
const app = express();
const PORT = 4000;
const admin = require("firebase-admin");

// Middleware untuk mengurai JSON
app.use(express.json());

const corsOptions = {
  origin: "https://katakitamah.up.railway.app", // URL yang diizinkan
  optionsSuccessStatus: 200, // Beberapa browser membutuhkan status ini
};

app.use(cors(corsOptions));

// Menggunakan routes
app.use("/users", userRoutes);
app.use("/api", affirmationRoutes);
app.use("/api/user-affirmations", userAffirmationRoutes);

// Mengubah db.query menjadi promise-based
const query = util.promisify(db.query).bind(db);

// Route untuk menyimpan token ke dalam database
app.post("/api/save-token", async (req, res) => {
  const { user_id, token } = req.body;

  try {
    await query(
      "INSERT INTO tokens (user_id, token, created_at, updated_at) VALUES (?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE token = ?, updated_at = NOW()",
      [user_id, token, token]
    );
    res.status(200).json({ message: "Token saved successfully" });
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).json({ error: "Failed to save token" });
  }
});

const sendNotification = async (token, title, body) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

app.post("/api/send-notification", async (req, res) => {
  const { token, title, body } = req.body;
  await sendNotification(token, title, body);
  res.status(200).json({ message: "Notification sent" });
});

// Endpoint untuk mengirim notifikasi uji
app.post("/api/send-test-notification", async (req, res) => {
  const { token } = req.body; // Token yang ingin diuji
  const title = "KataKitaMah!";
  const body = "Test dulu ya";

  try {
    await sendNotification(token, title, body);
    res.status(200).json({ message: "Test notification sent" });
  } catch (error) {
    console.error("Failed to send notification:", error);
    res.status(500).json({ error: "Failed to send test notification" });
  }
});

const lastNotificationTime = {};

// Cron job untuk mengirim notifikasi
cron.schedule("* * * * *", async () => {
  try {
    const users = await query(
      "SELECT * FROM user_affirmations WHERE notification_interval IS NOT NULL"
    );

    const currentTime = new Date();

    for (const user of users) {
      const interval = user.notification_interval * 60 * 1000; // konversi ke milidetik
      const userId = user.user_id;
      const lastNotificationSentAt = user.last_notification_sent_at
        ? new Date(user.last_notification_sent_at)
        : null;

      // Cek jika waktu terakhir notifikasi tidak ada atau sudah mencapai interval
      if (
        !lastNotificationSentAt ||
        currentTime - lastNotificationSentAt >= interval
      ) {
        // Kirim notifikasi dan simpan waktu sekarang sebagai waktu terakhir notifikasi
        await sendNotificationToUser(user, currentTime);
      }
    }
  } catch (error) {
    console.error("Error executing cron job:", error);
  }
});

// Fungsi untuk mengirim notifikasi ke user
async function sendNotificationToUser(user, currentTime) {
  try {
    const tokens = await query("SELECT token FROM tokens WHERE user_id = ?", [
      user.user_id,
    ]);

    const affirmations = await query(
      "SELECT quotes FROM affirmations WHERE id = ?",
      [user.affirmation_id]
    );

    if (tokens.length > 0 && affirmations.length > 0) {
      let quotesArray;
      if (typeof affirmations[0].quotes === "string") {
        quotesArray = affirmations[0].quotes.split(",");
      } else if (Array.isArray(affirmations[0].quotes)) {
        quotesArray = affirmations[0].quotes;
      } else {
        console.error("Unexpected quotes format:", affirmations[0].quotes);
        return; // Skip jika format tidak sesuai
      }

      if (quotesArray.length === 0) {
        console.error("No quotes found for user:", user.user_id);
        return; // Skip jika tidak ada kutipan
      }

      const randomQuote =
        quotesArray[Math.floor(Math.random() * quotesArray.length)];

      for (const tokenData of tokens) {
        await sendNotification(
          tokenData.token,
          "Afirmasi Harian - KataKitaMah!",
          randomQuote
        );
      }

      // Update waktu terakhir notifikasi
      await query(
        "UPDATE user_affirmations SET last_notification_sent_at = ? WHERE id = ?",
        [currentTime, user.id]
      );
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "psss-59f8c",
    clientEmail: "firebase-adminsdk-bqi1l@psss-59f8c.iam.gserviceaccount.com",
    privateKey:
      "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCyVjC2YNEN0t9/\niKw5Qei45VATmVUDUaVFWcGEN5rDgn1Fu0aTAgVv8Zjepah2qbZ4I3UNzRqGSPL6\nZpQlKIV558Mtw+a5StZqX09HkDxlkD49G+0nHcPxsnnX2Akp/q89LaUulGnglufj\neXpAvXX45tpwuaJFJckfDUnnLBgCvJtC3SXHzgIxActY0yKT8yxtxcJBqAywtZoW\nZfZxGhU8qKh0YfuVTf2RHGB2pax1e/kZrrfrSCeJWHzqw39iQqpySJDttn9uZ71X\nUHVNsRJ5xWqDc14K1JjNeHNfI34L76My+8BU42WZMXRPyseGQC7g+rUsJvfCUZ6X\nglFjjyOJAgMBAAECggEABZEasqq5g960AtFjnOLxjon78qyr4m9jQxOu7n9k2ZsC\naZGTvaWHwWuPe828gT3BeCUVM5HWNOBkk0vt7m4CIqDJLy3JDzomkMn6Wc/HDt2O\nj85GHB05/1q0onf4K0MrubNpz1crKetUAD4LwqcXXmZoZbHpvpJUIZ/C0ZBHDJjE\nu5VYtcGPmmebwXyiGh2Yzayiaeu+q88epFwbqscQR2TeuPoyAYrbEpVd7vXkglgh\naCZrGKJrzVhMuCKHKb69k1bGojeCtNCl8z8/NjeR+VzsKskJMm/GdSy1aM40OmGi\nrYokkY+hEI+iCWJuIKQbDAwXg1lhF9ruYSBC+ZjunQKBgQDjMY9fTAkRrm7knTWV\niHJ2xkTRNL2wkKLFfHY2AmCH6ORTwFmBxsu7lWxFL8n+PlNI0chW/hk7bAyrwiUD\n05u6CkC0YhBkeugYekDQzzxnRTJCVpYKLxC2kyT8uO+ldcZ0gFhs+37dnS31GehV\nU1Es0RNXecwcRr43LNIc3C/DjQKBgQDI8sqoN/kztpLBjhxN2cRbRWdXB9Pa2f3Q\nQV7W0K24MS3WpXcBbQtE1m+QlV9UNkP36xHdRnd6jNfugvf7Mc/pq5ed2j+YlGmO\nKgb7YAsXZSQf++kPuXshJaBRk1LoP9VFM11ELporC8mbzV4cmJQifCFcE8m0gRwu\nYNDqfxAC7QKBgEMuHXoNbsUWsl3Ris27ujUa7bB7CvhR3H/PDNltnIOzvwhw4Ua5\ntPaz+X7/4ZfXcCMhPT9UBbwHeDu1veJCyVKaw4VTVguQOF88jzvve6oB0RnCpr0+\nK5ABNLeyK9LeX5+FcCBRwbLgTn2ieov4hhFdhX2hW1SlKowAKeU0yr7lAoGBAJ5W\ncUlLkZkl602IZNUTGp2welUhXdW8nzpRyCEMHVZdqfjQOI1vFsoPDamniY4ZlETt\nfQ4WUF7IS/0sRaow/drp0nYXWrUnfGUAyK+aZiLxFx38qRAy3sqnk0O0CkfmxG3a\no0ruTZxNlXamw9lUgKULml2rWexZL5N7xiKALGWhAoGBALOSdytAucbemuhhPonT\nKRg4beRKx47+9P0HG40qn//ntJ5xqOHDuBsawqLnycJUgeT2A0llTJzFBVTu8Z1k\nw11OTUTOkEMvtBV25x+lx1u06S0Row8+12C4TKOmGgKGElW4+YTiyqQw7k6oOaQj\n949DkBQU4v4R0woZBy3w0R4c\n-----END PRIVATE KEY-----",
  }),
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
