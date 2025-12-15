import express from "express";
import connect from "./config.js";
import path from "path"
import cors from "cors"

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connect();

app.use('/uploads', express.static(path.join(path.resolve(), "uploads")));

app.get("/", (req, res) => {
    res.send("Welcome to LMS API");
});

app.listen(5001, ()=>{
    console.log("http://localhost:5001");
})