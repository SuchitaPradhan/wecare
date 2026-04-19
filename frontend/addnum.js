import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Needed to use __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Serve HTML form
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Handle POST request
app.post("/add", (req, res) => {
  const num1 = parseInt(req.body.number1);
  const num2 = parseInt(req.body.number2);

  const sum = num1 + num2;

  res.send(`<h1>The sum of ${num1} and ${num2} is ${sum}</h1>`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
