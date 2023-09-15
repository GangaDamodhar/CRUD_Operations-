const express = require("express");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("moviesData.db");

const app = express();
app.use(express.json());

// API 1: Get all movie names
app.get("/movies", (req, res) => {
  db.all("SELECT movie_name AS movieName FROM movie", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API 2: Create a new movie
app.post("/movies", (req, res) => {
  const { directorId, movieName, leadActor } = req.body;

  if (!directorId || !movieName || !leadActor) {
    res
      .status(400)
      .json({ message: "directorId, movieName, and leadActor are required" });
    return;
  }

  db.run(
    "INSERT INTO movie (director_id, movie_name, lead_actor) VALUES (?, ?, ?)",
    [directorId, movieName, leadActor],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ message: "Movie Successfully Added" });
    }
  );
});

// API 3: Get a movie by movieId
app.get("/movies/:movieId", (req, res) => {
  const movieId = req.params.movieId;
  db.get(
    "SELECT movie_id AS movieId, director_id AS directorId, movie_name AS movieName, lead_actor AS leadActor FROM movie WHERE movie_id = ?",
    [movieId],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ message: "Movie not found" });
        return;
      }
      res.json(row);
    }
  );
});

// API 4: Update a movie by movieId
app.put("/movies/:movieId", (req, res) => {
  const movieId = req.params.movieId;
  const { directorId, movieName, leadActor } = req.body;

  if (!directorId || !movieName || !leadActor) {
    res
      .status(400)
      .json({ message: "directorId, movieName, and leadActor are required" });
    return;
  }

  db.run(
    "UPDATE movie SET director_id = ?, movie_name = ?, lead_actor = ? WHERE movie_id = ?",
    [directorId, movieName, leadActor, movieId],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ message: "Movie not found" });
        return;
      }
      res.json({ message: "Movie Details Updated" });
    }
  );
});

// API 5: Delete a movie by movieId
app.delete("/movies/:movieId", (req, res) => {
  const movieId = req.params.movieId;
  db.run("DELETE FROM movie WHERE movie_id = ?", [movieId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Movie not found" });
      return;
    }
    res.json({ message: "Movie Removed" });
  });
});

// API 6: Get all directors
app.get("/directors", (req, res) => {
  db.all(
    "SELECT director_id AS directorId, director_name AS directorName FROM director",
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// API 7: Get all movies directed by a specific director
app.get("/directors/:directorId/movies", (req, res) => {
  const directorId = req.params.directorId;
  db.all(
    "SELECT movie.movie_name AS movieName FROM movie WHERE movie.director_id = ?",
    [directorId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
