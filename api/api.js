const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());
const genAI = new GoogleGenerativeAI('AIzaSyDuhXB0K7srxC3Fvtkad7aLxGOiiOre2a0');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

app.post('/', async (req, res) => {
  // res.send({ message: 'Hello World' });
  // return;
  try {
    // const prompt = 'Explain how AI works';
    console.log(req.body);
    const prompt = req.body.prompt.instruction;
    const result = await model.generateContent(prompt);
    // res.send(result.response.text());
    console.log(result.response.text());
     res.json({ response: result.response.text() });
    //  res.send({ response: result.response.text() });
    //  return;
  } catch (error) {
    // res.status(500).send(error.message);
      res.status(500).json({ error: error.message });
    // return;
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});