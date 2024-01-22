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

app.use(express.json());


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
    throw new Error(`Invalid input. places: ${req.body}`);
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
  const prompt = `You are a trip planner. ${location} - These are the places i want to visit in exactly ${duration} days. Give me an itinerary in the following parseable JSON format. Each object represents a day. Each day has a list of activities. Each activity has a place name and start and end time. ADD KEYS place, start and end FOR EACH ACTIVITY. DO NOT ADD days and activities tags. i need the output as a Json parseable string`

  const result = await model.generateContent(prompt);
  const response = await result.response;
  console.log(response)
  console.log('************************************************************')
  //const text = response.text(); 
  const text = '['+extractTextInSquareBrackets(response.text())+']';
  let modifiedString = text.replace(/\},/g, "}");
  //console.log(text)
  console.log("---------------------------------------------------------")
  console.log(text)
  const textRes = JSON.parse(text)
  return (textRes);

}


function extractTextInSquareBrackets(inputString) {
  const fi=  inputString.indexOf('{')
  const li = inputString.lastIndexOf('}')
  return inputString.slice(fi, (li+1))
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});