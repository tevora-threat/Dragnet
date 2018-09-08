const express = require('express');
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const basicAuth = require('express-basic-auth')
const spawn = require("child_process").spawn;
const bodyParser = require('body-parser');

//firebase
const admin = require("firebase-admin");

// TODO move to ENV
const serviceAccount = require("./ak/ServiceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const settings = { timestampsInSnapshots: true };

var db = admin.firestore();
db.settings(settings);

const authPass = ''
const authUser = 'dragnet'
const authObject = {}
authObject[authUser] = authPass

app.use(basicAuth({
    users: authObject
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan("common"));
app.use(cors({
    origin: ["*"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

if (authPass != ''){
    app.listen(3000, function () {
        console.log('server running on port 3000');
    })
} else {
    console.log('server not started because you haven\'t set your basic-auth password.');
}


//osint
app.post('/detect', liDetect);
app.post('/osint', liScrape);
app.get('/osint', liScrape);

//vishing
app.post('/call', placeCall);

//ml
app.post('/import', originalImport);
app.post('/retrain', retrain);
app.post('/predict', predict);


function liDetect(req, res) {
    res.sendStatus(404);
    console.log(req.body.targetUID);
    var process = spawn('xvfb-run', ["node", "./osint/liCheck.js", req.body.targetUID]);
    process.stdout.on('data', function (data) {
        console.log(data.toString());
    })
}

function liScrape(req, res) {
    res.sendStatus(404);
    console.log(req.body.targetUID);
    var process = spawn('xvfb-run', ["node", "./osint/liScrape.js", req.body.targetUID]);
    process.stdout.on('data', function (data) {
        console.log(data.toString());
    })
}

function placeCall(req, res) {
    res.sendStatus(404);
    var attackUID = req.body.attackUID
    var attackRef = db.collection('attacks').doc(attackUID)
    attackRef.get()
        .then((snapshot) => {
            var attack = snapshot.data()
            var commandArray = [
                '/etc/asterisk/scripts/placeCall.py',
                attack.attackerNum,
                attack.targetNum,
                attack.callerIdName,
                attack.callerIdNum,
                attackUID
            ]
            var process = spawn('python', commandArray);
            process.stdout.on('data', function (data) {
                console.log(data.toString());
            })

        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
}

function originalImport(req, res) {
    res.sendStatus(404);
    //verify user is admin TODO
    var process = spawn('./tensorflow/venv/bin/python', ["./tensorflow/import.py"]);
    process.stdout.on('data', function (data) {
        console.log(data.toString());
    })
}

function retrain(req, res) {
    res.sendStatus(404);
    //verify user is admin TODO
    var process = spawn('./tensorflow/venv/bin/python', ["./tensorflow/retrain.py"]);
    process.stdout.on('data', function (data) {
        console.log(data.toString());
    })
}

function predict(req, res) {
    res.sendStatus(404);
    //verify user is admin TODO
    var process = spawn('./tensorflow/venv/bin/python', ["./tensorflow/predict.py", req.body.targetUID]);
    process.stdout.on('data', function (data) {
        console.log(data.toString());
    })
}