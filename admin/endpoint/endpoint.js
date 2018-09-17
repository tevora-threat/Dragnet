const express = require('express');
const cors = require("cors");
const morgan = require("morgan");
const http = require('http');
const https = require('https');
const fs = require("fs");
const app = express();
const basicAuth = require('express-basic-auth')
const spawn = require("child_process").spawn;
const bodyParser = require('body-parser');

//domain (for https)
const domain = '' //TODO << replace

//basic auth
const authPass = '' //TODO << replace
const authUser = '' //TODO << replace

//certificate
const privateKey = fs.readFileSync(`/etc/letsencrypt/live/${domain}/privkey.pem`, 'utf8');
const certificate = fs.readFileSync(`/etc/letsencrypt/live/${domain}/cert.pem`, 'utf8');
const ca = fs.readFileSync(`/etc/letsencrypt/live/${domain}/chain.pem`, 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

//firebase
const admin = require("firebase-admin");
const storageBucketUrl = 'REPLACEME.appspot.com' //TODO << replace with your own default bucket


// TODO move to ENV
const serviceAccount = require("/root/endpoint/ak/ServiceAccountKey.json"); //TODO
var logUrl = fs.readFileSync('/root/endpoint/ak/logUrl.txt').toString(); //TODO

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: storageBucketUrl
});
const settings = {
    timestampsInSnapshots: true
};

var db = admin.firestore();
db.settings(settings);
const bucket = admin.storage().bucket();

const authObject = {}
authObject[authUser] = authPass

app.use(basicAuth({
    users: authObject
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(morgan("common"));
app.use(cors({
    origin: ["*"],
    methods: ["POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

const httpsServer = https.createServer(credentials, app);


if (authPass != '') {
    httpsServer.listen(443, () => {
        console.log('HTTPS Server running on port 443');
    });
} else {
    console.log('server not started because you haven\'t set your basic-auth password.');
}


//osint
app.post('/detect', liDetect);
app.post('/osint', liScrape);
// app.get('/osint', liScrape);

//vishing
app.post('/call', placeCall);
app.post('/upCall', uploadCall);

//ml
app.post('/import', originalImport);
app.post('/setup', setup);
app.post('/retrain', retrain);
app.post('/predict', predict);


function liDetect(req, res) {
    res.sendStatus(404);
    console.log(req.body.targetID);
    var process = spawn('xvfb-run', ["node", "./osint/liCheck.js", req.body.targetID]); //TODO
    process.stdout.on('data', function (data) {
        console.log(data.toString());
    })
}

function liScrape(req, res) {
    res.sendStatus(404);
    console.log(req.body.targetID);

    var targetRef = db.collection('targets').doc(req.body.targetID)
    const liURL = targetRef.get()
        .then((snapshot) => {
            var target = snapshot.data()
            // console.log(target);

            linkedInURL = target.linkedInURL
            return linkedInURL

        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });

    const liCookie = db.doc('integrations/linkedIn').get().then(doc => {
        const cookie = doc.data().cookie
        return cookie
    })

    Promise.all([liURL, liCookie]).then(result => {


        var process = spawn('xvfb-run', ["node", "./osint/liScrape.js", result[0], result[1], req.body.targetID]); //TODO
        process.stdout.on('data', function (data) {
            console.log(data.toString());
        })

    })


}

function placeCall(req, res) {
    res.sendStatus(404);
    console.log(logUrl);
    console.log(req.body.attackID);


    var attackID = req.body.attackID
    var attackRef = db.collection('attacks').doc(attackID)
    attackRef.get()
        .then((snapshot) => {
            var attack = snapshot.data()
            console.log(attack);
            var context
            if (attack.canRecord) {
                context = 'dragnet'
            } else {
                context = 'dragnet-nr'
            }
            var commandArray = [
                '/root/asterisk/placeCall.py', //TODO
                attack.attackerNum,
                attack.target.phone,
                attack.callerIdName,
                attack.callerIdNum,
                attackID,
                logUrl.trim(),
                context
            ]
            console.log(commandArray);

            var process = spawn('python', commandArray);
            process.stdout.on('data', function (data) {
                console.log(data.toString());
            })

        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
}

function uploadCall(req, res) {
    res.sendStatus(404);

    var logID = req.body.logID
    var logRef = db.collection('logs').doc(logID)
    logRef.get()
        .then((snapshot) => {
            var log = snapshot.data()
            // console.log(attack);
            var attackID = log.attackID
            var ts = log.ts

            setTimeout(function () {
                bucket.upload(`/etc/asterisk/recs/${attackID}-${ts}.wav`, {
                    destination: `callRecs/${attackID}-${ts}.wav`,
                    //predefinedAcl: 'publicRead'
                }).then(data => {
                    console.log('upload success');
                    console.log(data);
                    const setRecordingLocation = db.collection('attacks').doc(attackID).set({
                        recordingLocation: data[1].name
                    }, {
                        merge: true
                    })

                    return setRecordingLocation

                }).catch(err => {
                    console.log('error uploading to storage', err);
                });
            }, 3000);




        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });









}

function originalImport(req, res) {
    res.sendStatus(404);
    var process = spawn('./tensorflow/venv/bin/python', ["./tensorflow/import.py"]); //TODO
    process.stdout.on('data', function (data) {
        console.log(data.toString());
    })
}

function setup(req, res) {
    res.sendStatus(404);


    var templateID = req.body.templateID



    db.collection('conversions').doc(templateID).get()
        .then((snapshot) => {
            var template = snapshot.data()
            console.log(template);
            var lastCSV = template.lastUpdatedCSV
            var conversionType = template.type

            const dir = `./tensorflow/${conversionType}/${templateID}`
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
                fs.createReadStream('./tensorflow/predict.py').pipe(fs.createWriteStream(`${dir}/predict.py`));
                fs.createReadStream('./tensorflow/vuln_data.py').pipe(fs.createWriteStream(`${dir}/vuln_data.py`));
            }


        })
}

function retrain(req, res) {
    res.sendStatus(404);

    var templateID = req.body.templateID

    db.collection('conversions').doc(templateID).get()
        .then((snapshot) => {
            var template = snapshot.data()
            console.log(template);
            var lastCSV = template.lastUpdatedCSV
            var conversionType = template.type

            // bucket.

            const options = {
                destination: `./tensorflow/${conversionType}/${templateID}/train.csv`
            }

            const dlTraining = bucket.file(lastCSV).download(options).then(() => {
                console.log('downloaded. should create testing data now');
            }).catch(err => {
                console.error('ERROR:', err);
            });

            return dlTraining

        })

}

function predict(req, res) {
    res.sendStatus(404);
    //verify user is admin TODO

    var attackObject = {}
    var targetID = req.body.targetID
    attackObject.targetID = targetID
    var targetRef = db.collection('targets').doc(targetID)
    targetRef.get()
        .then((snapshot) => {
            var targetBlob = snapshot.data()
            attackObject.target = targetBlob
            attackObject.status = 'ready'
            attackObject.targetName = targetBlob.name
            attackObject.engagement = targetBlob.addedOnEngagementID
            attackObject.company = targetBlob.company

            let vishAttack = Object.assign({}, attackObject)
            vishAttack.type = 'vishing'
            var phishAttack = Object.assign({}, attackObject)
            phishAttack.type = 'phishing'
            var attacks = [vishAttack, phishAttack]
            var predictorData = []

            if (targetBlob.jobs.length > 0) {
                var currentJobs = []
                targetBlob.jobs.forEach(job => {
                    if (job.endDate === 'Present') {
                        currentJobs.push(job)
                    }
                });

                if (currentJobs.length > 0) {
                    predictorData.push('--company')
                    predictorData.push(currentJobs[0].company)
                    predictorData.push('--position')
                    predictorData.push(currentJobs[0].position)
                } else {
                    predictorData.push('--company')
                    predictorData.push(targetBlob.jobs[0].company)
                    predictorData.push('--position')
                    predictorData.push(targetBlob.jobs[0].position)
                }

            }

            //major
            //college
            if (targetBlob.edus.length > 0) {
                predictorData.push('--major')
                predictorData.push(targetBlob.edus[0].major)
                predictorData.push('--college')
                predictorData.push(targetBlob.edus[0].schoolName)
            }

            //firstname
            //lastname
            if (targetBlob.name) {
                predictorData.push('--firstname')
                predictorData.push(targetBlob.name.split(" ")[0])
                predictorData.push('--lastname')
                predictorData.push(targetBlob.name.split(" ")[1])
            } else {
                if (targetBlob.fullName) {
                    predictorData.push('--firstname')
                    predictorData.push(targetBlob.fullName.split(" ")[0])
                    predictorData.push('--lastname')
                    predictorData.push(targetBlob.fullName.split(" ")[1])
                }
            }


            //location
            if (targetBlob.location) {
                predictorData.push('--location')
                predictorData.push(targetBlob.location)
            }
            console.log(attacks);


            attacks.forEach(attack => {
                if (attack.type === 'vishing') {

                    function run(template, callback) {
                        let finalArgs = []
                        finalArgs.push(`./tensorflow/vishing/${template}/predict.py`)

                        predictorData.forEach(eachArg => {
                            finalArgs.push(eachArg)
                        });
                        let spawn = require('child_process').spawn;
                        let command = spawn('./tensorflow/venv/bin/python', finalArgs);
                        let result = '';
                        command.stdout.on('data', function (data) {
                            result += data.toString().trim();
                        });
                        command.on('close', function (code) {
                            return callback(result);
                        });
                    }

                    let files = fs.readdirSync('./tensorflow/vishing', (err, files) => {
                        if (err) throw err;
                        return files
                    });

                    let numTemps = 0
                    let trackingNum = 0
                    let predictions = []

                    Promise.all([files]).then(values => {
                        templatePredictions = []
                        let templates = values[0]
                        numTemps = templates.length


                        templates.forEach(template => {

                            templatePredictions.push(run(template, function (result) {

                                predictions.push({
                                    templateID: template,
                                    probability: result
                                })

                                trackingNum++
                                if (trackingNum == numTemps) {
                                    predictions.sort(function (a, b) {
                                        return b.probability - a.probability
                                    })


                                    console.log(predictions[0].templateID);
                                    console.log(predictions[0].probability);
                                    console.log(`Next was ${predictions[1].templateID}|${predictions[1].probability}`);

                                    //update FB
                                    attack.templateID = predictions[0].templateID

                                    db.collection('vishingScripts').doc(predictions[0].templateID).get().then((snapshot) => {
                                        let template = snapshot.data()
                                        attack.template = template
                                        console.log(attack);
                                        db.collection('attacks').add(attack).then((attackRef) => {
                                            db.collection('logs').add({
                                                test: 'vishing',
                                                dateAdded: new Date(),
                                                type: 'templatesSuggested',
                                                target: targetID,
                                                engagement: attack.engagement,
                                                attackID: attackRef.id
                                            }).then(() => {
                                                db.collection('targets').doc(targetID).set({
                                                    mainStatus: 'Attack Ready',
                                                    vishGuessName: attack.template.title,
                                                    vishGuessID: attackRef.id,
                                                }, {
                                                    merge: true
                                                })
                                            })
                                        })

                                    })

                                }
                            }))
                        });

                        Promise.all(templatePredictions).then(result => {
                        })

                    })


                } else if (attack.type === 'phishing') {

                    function run(template, callback) {
                        let finalArgs = []
                        finalArgs.push(`./tensorflow/phishing/${template}/predict.py`)

                        predictorData.forEach(eachArg => {
                            finalArgs.push(eachArg)
                        });
                        let spawn = require('child_process').spawn;
                        let command = spawn('./tensorflow/venv/bin/python', finalArgs);
                        let result = '';
                        command.stdout.on('data', function (data) {
                            result += data.toString().trim();
                        });
                        command.on('close', function (code) {
                            return callback(result);
                        });
                    }

                    let files = fs.readdirSync('./tensorflow/phishing', (err, files) => {
                        if (err) throw err;
                        return files
                    });

                    let numTemps = 0
                    let trackingNum = 0
                    let predictions = []

                    Promise.all([files]).then(values => {
                        templatePredictions = []
                        let templates = values[0]
                        numTemps = templates.length


                        templates.forEach(template => {

                            templatePredictions.push(run(template, function (result) {

                                predictions.push({
                                    templateID: template,
                                    probability: result
                                })

                                trackingNum++
                                if (trackingNum == numTemps) {
                                    predictions.sort(function (a, b) {
                                        return b.probability - a.probability
                                    })


                                    console.log(predictions[0].templateID);
                                    console.log(predictions[0].probability);
                                    console.log(`Next was ${predictions[1].templateID}|${predictions[1].probability}`);

                                    //update FB
                                    attack.templateID = predictions[0].templateID

                                    db.collection('emailTemplates').doc(predictions[0].templateID).get().then((snapshot) => {
                                        let template = snapshot.data()
                                        attack.template = template
                                        console.log(attack);
                                        db.collection('attacks').add(attack).then((attackRef) => {
                                            db.collection('logs').add({
                                                test: 'phishing',
                                                dateAdded: new Date(),
                                                target: targetID,
                                                type: 'templatesSuggested',
                                                engagement: attack.engagement,
                                                attackID: attackRef.id
                                            }).then(() => {
                                                db.collection('targets').doc(targetID).set({
                                                    mainStatus: 'Attack Ready',
                                                    phishGuessName: attack.template.title,
                                                    phishGuessID: attackRef.id,
                                                }, {
                                                    merge: true
                                                })
                                            })
                                        })

                                    })

                                }
                            }))
                        });

                        Promise.all(templatePredictions).then(result => {
                        })

                    })
                }
            })



            console.log('Running predictions...');
            //console.log(attacks);




        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });



}