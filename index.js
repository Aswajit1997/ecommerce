"use strict";
const express = require("express");
const app = express();
const helmet = require("helmet");
const { PORT } = require("./app/config/config");
const connectDB = require("./app/config/mongodb.config");
var cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");
const router = express.Router();
const path = require("path");
const fs = require("fs");

connectDB();

// Refine CORS options
// const corsOptions = {
// 	origin: "*",
// 	optionsSuccessStatus: 200,
// };

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(helmet());
app.use(morgan("common"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", router);

const routesPath = path.join(__dirname, "app/routes");
const routeFiles = fs.readdirSync(routesPath);

routeFiles.forEach((routeFile) => {
	if (routeFile !== "index.js" && routeFile.endsWith(".js")) {
		const routeModule = require(path.join(routesPath, routeFile));
		routeModule(router);
	}
});

app.get("/", (req, res) => {
	res.send("E-commerce Backend is Running");
});
app.get("/health", (req, res) => res.send({ message: "Dummy server is Running!" }));

function handleInvalidURLs(req, res) {
	let resp = {
		status: 0,
		message: "Invalid Url",
		error: {},
	};
	res.status(404).send(resp);
}

app.all("*", handleInvalidURLs);

app.listen(PORT, function () {
	console.log(`Server running on port ${PORT}`);
});
