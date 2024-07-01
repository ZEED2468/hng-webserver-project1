import 'dotenv/config';
import express, { urlencoded, json } from 'express';
import axios from 'axios';

const app = express();

app.use(urlencoded({ extended: false }));
app.use(json());
app.set('trust proxy', true);

const apiKey = process.env.WEATHER_API_KEY;

app.get('/', (req, res) => {
  res.send("<h1>Welcome to .... <a href='/api/hello?visitor_name=Adam'>Test</a></h1>");
});

app.get('/api/hello', async (req, res) => {
  try {
    const { visitor_name } = req.query;
    let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    userIp = userIp.split(',')[0].trim();

    const geoRes = await axios.get(`http://ip-api.com/json/${userIp}`);
    console.log(geoRes);
    const { city: location, lat, lon } = geoRes.data;

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const weatherResponse = await axios.get(weatherUrl);
    const temperature = weatherResponse.data.main.temp;

    const responseObj = {
      client_ip: userIp,
      location,
      greeting: `Hello, ${visitor_name ? visitor_name : 'Unknown🙄'}! The temperature is ${temperature} degrees Celsius in ${location}.`,
    };

    res.status(200).json(responseObj);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Error: Something went wrong');
  }
});

app.listen(5002, () => {
  console.log('Server is running on port 5002 ✔✔😁');
});
