import express from "express"
import pool from "../config/db"

const router = express.Router()

router.get('/students/:id/calendar', async (req, res) => {
    const { id } = req.params;
    const month = parseInt(req.query.month, 10);
    const year = parseInt(req.query.year, 10);

    try {
        const events = await pool.query(
            `SELECT id, title, date, time, location
             FROM events
             WHERE user_type='student' AND user_id=$1
               AND EXTRACT(MONTH FROM date)=$2
               AND EXTRACT(YEAR FROM date)=$3
             ORDER BY date, time`,
            [id, month, year]
        );
        res.json(events.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/instructors/:id/calendar', async (req, res) => {
    const { id } = req.params;
    const { month, year } = req.query;

    try {
        const events = await pool.query(
            `SELECT id, title, date, time, location
             FROM events
             WHERE user_type='instructor' AND user_id=$1 AND EXTRACT(MONTH FROM date)=$2 AND EXTRACT(YEAR FROM date)=$3 ORDER BY date, time`,
            [id, month, year]
        );
        res.json(events.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /students/:id/calendar
router.post('/students/:id/calendar', async (req, res) => {
    const { id } = req.params;
    const { title, date, time, location } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO events (user_id, user_type, title, date, time, location)
             VALUES ($1,'student',$2,$3,$4,$5) RETURNING *`,
            [id, title, date, time, location]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /instructors/:id/calendar
router.post('/instructors/:id/calendar', async (req, res) => {
    const { id } = req.params;
    const { title, date, time, location } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO events (user_id, user_type, title, date, time, location)
             VALUES ($1,'instructor',$2,$3,$4,$5) RETURNING *`,
            [id, title, date, time, location]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router
