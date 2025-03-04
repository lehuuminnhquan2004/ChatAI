const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
const path = require('path'); 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); 


const genAI = new GoogleGenerativeAI("AIzaSyDX4m7R-0PW0Ibm2-vdfHBnh29PIqyHQHo");

app.post('/chat', async (req, res) => {
  const prompt = req.body.message;
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const result = await model.generateContent(prompt);
    res.json({ response: result.response.text() });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});