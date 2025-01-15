const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Add your MySQL password here
  database: "hotel_db", // Replace with your database name
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// API: Create Room
app.post(
  "/api/rooms",
  upload.fields([
    { name: "imageUrl1", maxCount: 1 },
    { name: "imageUrl2", maxCount: 1 },
    { name: "imageUrl3", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const {
        name,
        type,
        status,
        description,
        isBooked,
        bookedBy,
        bookedDate,
      } = req.body;

      const parsedBookedDate =
        bookedDate && bookedDate.trim() !== "" ? bookedDate : null; // Convert empty string to null

      const imageUrl1 = req.files.imageUrl1
        ? `/uploads/${req.files.imageUrl1[0].filename}`
        : null;
      const imageUrl2 = req.files.imageUrl2
        ? `/uploads/${req.files.imageUrl2[0].filename}`
        : null;
      const imageUrl3 = req.files.imageUrl3
        ? `/uploads/${req.files.imageUrl3[0].filename}`
        : null;

      const query = `
        INSERT INTO rooms (name, type, status, description, imageUrl1, imageUrl2, imageUrl3, isBooked, bookedBy, bookedDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        name,
        type,
        status,
        description,
        imageUrl1,
        imageUrl2,
        imageUrl3,
        isBooked,
        bookedBy || null,
        parsedBookedDate,
      ];

      db.query(query, values, (err, result) => {
        if (err) {
          console.error("Error creating room:", err.message);
          res.status(500).json({ error: err.message });
          return;
        }
        res
          .status(201)
          .json({
            message: "Room created successfully",
            roomId: result.insertId,
          });
      });
    } catch (err) {
      console.error("Unexpected error:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

// API: Get All Rooms
app.get("/api/rooms", (req, res) => {
  const query = "SELECT * FROM rooms";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching rooms:", err.message);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});


app.get("/api/rooms/:id", (req, res) => {
  const roomId = req.params.id;
  const query = "SELECT * FROM rooms WHERE id = ?";
  db.query(query, [roomId], (err, results) => {
    if (err) {
      console.error("Error fetching room:", err.message);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    res.json(results[0]);
  });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
