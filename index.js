const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const chalk = require("chalk");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "hotel_db",
});

db.connect((err) => {
  if (err) {
    console.error(chalk.red("Error connecting to MySQL:", err.message));
    return;
  }
  console.log(chalk.green("Connected to MySQL database."));
});

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
        price,
      } = req.body;

      const parsedBookedDate =
        bookedDate && bookedDate.trim() !== "" ? bookedDate : null;

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
        INSERT INTO rooms (name, type, status, description, imageUrl1, imageUrl2, imageUrl3, isBooked, bookedBy, bookedDate, price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        price,
      ];

      db.query(query, values, (err, result) => {
        if (err) {
          console.error("Error creating room:", err.message);
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json({
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

app.get("/api/rooms", (req, res) => {
  const query = "SELECT * FROM rooms";
  db.query(query, (err, results) => {
    if (err) {
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
      console.error(chalk.red("Error fetching room:", err.message));
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (results.length === 0) {
      console.log(chalk.yellow("Room not found:", roomId));
      res.status(404).json({ error: "Room not found" });
      return;
    }
    console.log(chalk.blue("Fetched room:", results[0]));
    res.json(results[0]);
  });
});

app.post("/api/reserve-room", (req, res) => {
  console.log(chalk.blue("API /api/reserve-room called"));

  const { roomId, bookingDate, userId } = req.body;

  console.log(chalk.green("Request Data:"), { roomId, bookingDate, userId });

  if (!roomId || !bookingDate || !userId) {
    console.log(chalk.red("Validation Error: Missing required fields"));
    return res
      .status(400)
      .json({ message: "Room ID, Booking Date, and User ID are required." });
  }

  const selectedDate = new Date(bookingDate);
  if (isNaN(selectedDate.getTime())) {
    console.log(chalk.red("Validation Error: Invalid booking date format"));
    return res.status(400).json({ message: "Invalid booking date format." });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.error(chalk.red("Transaction Error:"), err.message);
      return res.status(500).json({ message: "Internal server error." });
    }

    console.log(chalk.cyan("Transaction started"));

    // Step 1: Check room availability
    const checkRoomQuery = "SELECT * FROM rooms WHERE id = ?";
    console.log(chalk.yellow("Checking room availability..."));

    db.query(checkRoomQuery, [roomId], (err, roomResults) => {
      if (err) {
        console.error(chalk.red("Error fetching room:"), err.message);
        return db.rollback(() => {
          res.status(500).json({ message: "Internal server error." });
        });
      }

      if (roomResults.length === 0) {
        console.log(chalk.red("Room not found for ID:"), roomId);
        return db.rollback(() => {
          res.status(404).json({ message: "Room not found." });
        });
      }

      const room = roomResults[0];
      console.log(chalk.green("Room Details:"), room);

      if (room.status !== "Available") {
        console.log(chalk.red("Room is not available for reservation"));
        return db.rollback(() => {
          res.status(400).json({ message: "Room is not available." });
        });
      }

      // Step 2: Check if the room is already booked on the selected date
      const checkBookingQuery =
        "SELECT * FROM bookings WHERE roomId = ? AND bookingDate = ?";
      console.log(chalk.yellow("Checking if room is already booked..."));

      db.query(
        checkBookingQuery,
        [roomId, bookingDate],
        (err, bookingResults) => {
          if (err) {
            console.error(chalk.red("Error checking bookings:"), err.message);
            return db.rollback(() => {
              res.status(500).json({ message: "Internal server error." });
            });
          }

          if (bookingResults.length > 0) {
            console.log(
              chalk.red("Room is already booked for the selected date")
            );
            return db.rollback(() => {
              res.status(400).json({
                message: "Room is already booked for the selected date.",
              });
            });
          }

          console.log(chalk.green("Room is available for booking"));

          // Step 3: Insert booking into bookings table
          const insertBookingQuery = `
          INSERT INTO bookings (roomId, userId, roomName, roomType, description, bookingDate)
          SELECT ?, ?, name, type, description, ?
          FROM rooms
          WHERE id = ?
        `;
          console.log(chalk.yellow("Inserting booking into database..."));

          db.query(
            insertBookingQuery,
            [roomId, userId, bookingDate, roomId],
            (err, bookingResult) => {
              if (err) {
                console.error(
                  chalk.red("Error inserting booking:"),
                  err.message
                );
                return db.rollback(() => {
                  res
                    .status(500)
                    .json({ message: "Failed to create booking." });
                });
              }

              console.log(chalk.green("Booking inserted successfully"));

              // Step 4: Update room status
              const updateRoomQuery = `
            UPDATE rooms 
            SET isBooked = 1, bookedBy = ?, bookedDate = ?, status = "Unavailable"
            WHERE id = ?
          `;
              console.log(chalk.yellow("Updating room status..."));

              db.query(
                updateRoomQuery,
                [userId, bookingDate, roomId],
                (err) => {
                  if (err) {
                    console.error(
                      chalk.red("Error updating room status:"),
                      err.message
                    );
                    return db.rollback(() => {
                      res
                        .status(500)
                        .json({ message: "Failed to update room status." });
                    });
                  }

                  console.log(chalk.green("Room status updated successfully"));

                  // Commit transaction
                  db.commit((err) => {
                    if (err) {
                      console.error(chalk.red("Commit Error:"), err.message);
                      return db.rollback(() => {
                        res
                          .status(500)
                          .json({ message: "Internal server error." });
                      });
                    }

                    console.log(
                      chalk.green("Transaction committed successfully")
                    );
                    res.status(200).json({
                      message: "You have reserved the room successfully.",
                    });
                  });
                }
              );
            }
          );
        }
      );
    });
  });
});

app.put("/api/rooms/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, isBooked, price } = req.body;

  if (!name || !type || price === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const query =
      "UPDATE rooms SET name = ?, type = ?, isBooked = ?, price = ? WHERE id = ?";
    const values = [name, type, isBooked, price, id];

    await db.query(query, values);
    res.status(200).json({ message: "Room updated successfully" });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/bookings", async (req, res) => {
  const { userId } = req.query; // Fetch `userId` from query parameters

  console.log("🚀 ~ app.get ~ userId:", userId);

  if (!userId) {
    console.error(chalk.red("User ID is required."));
    return res.status(400).json({ error: "User ID is required" });
  }

  // Define SQL query to fetch bookings for the given userId
  const query = "SELECT * FROM bookings WHERE userId = ?";

  // Execute the query with `userId` as a parameter
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(chalk.red("Error fetching bookings:", err.message));
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      console.log(chalk.yellow(`No bookings found for userId: ${userId}`));
      return res.status(404).json({ error: "No bookings found" });
    }

    console.log(chalk.green("Fetched bookings:", results));
    res.status(200).json(results); // Send all bookings as a JSON response
  });
});

app.post("/complaints", async (req, res) => {
  const { userId, userName, roomNumber, comment } = req.body;

  console.log(chalk.blue("Received complaint request with data:"));
  console.log(chalk.cyanBright(`UserId: ${userId}`));
  console.log(chalk.cyanBright(`UserName: ${userName}`));
  console.log(chalk.cyanBright(`RoomNumber: ${roomNumber}`));
  console.log(chalk.cyanBright(`Comment: ${comment}`));

  if (!userId || !userName || !roomNumber || !comment) {
    console.log(chalk.red("Error: Missing required fields"));
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    console.log(chalk.green("Attempting to save complaint to the database..."));

    const query = `
        INSERT INTO complains (userId, userName, roomNumber, comment)
        VALUES (?, ?, ?, ?)
      `;
    const values = [userId, userName, roomNumber, comment];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error creating Complaint:", err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({
        message: "Complaint created successfully",
        roomId: result.insertId,
      });
    });
  } catch (error) {
    console.error(chalk.red("Error saving complaint:"), error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/complaints", async (req, res) => {
  console.log(chalk.blue("Fetching all complaints from the database..."));

  try {
    const query = "SELECT * FROM complains ORDER BY id DESC";

    db.query(query, (err, results) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

      res.status(200).json(results);
    });
  } catch (error) {
    console.error(chalk.red("Error fetching complaints:"), error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/bookings", (req, res) => {
  const query = "SELECT * FROM bookings";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

app.delete("/api/bookings/:id", (req, res) => {
  const bookingId = req.params.id;
  const query = "DELETE FROM bookings WHERE id = ?";
  db.query(query, [bookingId], (err, result) => {
    if (err) {
      console.error("Error deleting booking:", err.message);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  });
});

app.post("/api/users/signup", async (req, res) => {
  const { username, email, password, userType } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (username, email, password, userType)
      VALUES (?, ?, ?, ?)
    `;
    const values = [username, email, hashedPassword, userType];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error(chalk.red("Error signing up user:", err.message));
        return res.status(500).json({ error: "Error signing up user" });
      }
      console.log(
        chalk.green("User signed up successfully:", { userId: result.insertId })
      );
      res
        .status(201)
        .json({ success: true, message: "User signed up successfully" });
    });
  } catch (err) {
    console.error(chalk.red("Error during sign-up:", err.message));
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/users/signin", (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM users WHERE username = ?`;
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error(chalk.red("Error during sign-in:", err.message));
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      console.log(chalk.yellow("Invalid username:", username));
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log(chalk.yellow("Invalid password for user:", username));
      return res.status(401).json({ error: "Invalid username or password" });
    }

    console.log(chalk.green("Sign-in successful:", username));
    res.status(200).json({ message: "Sign-in successful", user });
  });
});

app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error(chalk.red("Error during login:", err.message));
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }

      if (results.length === 0) {
        console.log(
          chalk.yellow(`Login failed: User with email ${email} not found`)
        );
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }

      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        console.log(
          chalk.yellow(`Login failed: Incorrect password for email ${email}`)
        );
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      console.log(chalk.green(`Login successful for user: ${email}`));
      res
        .status(200)
        .json({ success: true, message: "Login successful", user });
    });
  } catch (error) {
    console.error(
      chalk.red("Unexpected server error during login:", error.message)
    );
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(chalk.cyan(`Server is running on http://localhost:${port}`));
});
