const express = require('express');
const path = require('path');
const app = express();
// use the fs module to read the JSON data from the file 
const fs = require('fs');
const csv = require('csvtojson');



// //Need to install package 'hbs'
app.set('view engine', 'hbs');
const publicDir = path.join(__dirname, './public');
app.use(express.static(publicDir));


// set port, listen for requests
// app.listen(3000, () => console.log('Listening at port 3000'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    var currentTime = new Date(Date.now()).toString();
    console.log('Server time: ', currentTime);
});

// Parse URL-encoded bodies as sent by HTML forms
app.use(express.urlencoded({ extended: false }));
// Parse JSON bodies as sent by API clients
app.use(express.json({ limit: '1mb' }));

app.get("/", (req, res) => {
    res.render("instructions");
});



app.post("/gridworld", (req, res) => {
    res.render("gridworld", { data: req.body });

});

app.post("/gridworld/:session", (req, res) => {
    var session = req.params.session;
    console.log("Session", session);
    req.body.session = session;
    res.render("gridworld", { data: req.body});

});


app.get("/state/:level/:number", (req,res) =>{
    // var level = req.params.level;
    // var selected = req.params.number;
    
    filename = 'example.json'
    const json = fs.readFileSync('./data/'+filename);
    var obj = JSON.parse(json);
    var data = JSON.parse(obj.toString());
    data.game_name = filename;
    res.json(data);
});

app.get("/episode/:session", (req, res) => {
    var session = req.params.session;
    // console.log(session);
    res.json(Number(session));
});


app.post("/", (req, res) => {
    res.render("instructions");
});

