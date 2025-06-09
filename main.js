import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const apiKey = "api key";
const loc_URL = "https://api.openweathermap.org/geo/1.0/direct";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

const app = express();
const port = 6000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.post("/submit", async (req, res) => {
    const city = req.body.city;
     try {
        const location_res = await axios.get(loc_URL, {
            params: {
                q: city,
                appid: apiKey,
                limit: 1,
            }
        });
        // add hours of temperature 
        const loc = location_res.data[0];
        const lat = loc.lat;
        const long = loc.lon;

        const response = await axios.get(API_URL, {
            params: {
                lat: lat,
                lon: long,
                appid: apiKey,
                units: "metric",
            }
        });  
       
        const weather = response.data;
        //console.log(weather);

        function get_sunrise_sunset(sun) {
            const date = new Date(sun * 1000);
            const time = date.toLocaleTimeString([], {
                hour12: true, hour: "2-digit", minute: "2-digit"
            });

            return time.toLocaleUpperCase();
        }

        const sunrise = get_sunrise_sunset(weather.sys.sunrise);
        const sunset = get_sunrise_sunset(weather.sys.sunset);

       // console.log(sunrise);

        res.render("index.ejs", {
            forecast: weather,
            sunrise: sunrise,
            sunset: sunset,
            city: city
        });

    } catch(error) {
        console.log(error.message);
        res.render("index.ejs", {err: `${city} does not exist`});
    }
});

app.listen(port, () => {
    console.log("Server on...");
});