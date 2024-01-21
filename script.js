const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyDMB3rPWTxiRjWuuBH8AQtdavo1zEmA0gE");
const dotenv = require('dotenv')
dotenv.config()
const bodyParser = require('body-parser')
const express = require('express');
const cors = require('cors')




const app = express();
app.use(cors())
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res)=>{
  res.json({
    message: "hi"
  })
})


app.post('/generate-itinerary', async (req, res)=>{
try {
  const places = req.body.places; 
  const duration = req.body.duration; 

  console.log(places); 
  if (!places) {
    throw new Error('Invalid input. "places" should be an array.');
}

const itinerary = await generateItinerary(places, duration);



res.json({
    success: true,
    itinerary,
});
} catch (error) {
  res.status(400).json({
    success: false,
    error: error.message,
});
}
});

async function generateItinerary(location, duration) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  console.log("hi"); 
  const prompt = `You are a trip planner. ${location} - These are the places i want to visit in ${duration}. Give me an itinerary in JSON format each object represents a day with time slots(starting time and ending time). `

  const result = await model.generateContent(prompt);
  const response = await result.response;
  console.log(response)
  const text = extractTextInSquareBrackets(response.text());
  console.log(text); 
  return (text);

}


function extractTextInSquareBrackets(inputString) {
  const fi=  inputString.indexOf('[')
  const li = inputString.lastIndexOf(']')
  return inputString.slice(fi, (li+1))
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});