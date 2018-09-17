const Nightmare = require('nightmare')
const fs = require('fs')
var vo = require('vo')
const cheerio = require('cheerio')
const admin = require("firebase-admin");
const serviceAccount = require("./ak/ServiceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "CHANGEME.appspot.com"
});
const bucket = admin.storage().bucket();

const settings = {timestampsInSnapshots: true};

var db = admin.firestore();
db.settings(settings);

console.log(process.argv);
var tUID = process.argv[2]
var targetRef = db.collection('targets').doc(tUID)

var proxyUrl = ""


const ua =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
const ua2 = 'Googlebot-Image/1.0'


function parseAndLoad(content) {
    const $ = cheerio.load(content)

    $('a.li-hover-under').each(function (i, element) {


        if (proxyUrl === "") {
            proxyUrl = element.attribs.href
        }

    })

}

vo(run)(function (err, result) {

})

function* run() {
    var nightmare = Nightmare({
        show: false,
        height: 400,
        width: 360
    })

    var linkedInURL = ''
    yield targetRef.get()
        .then((snapshot) => {

            var email = snapshot.data().email

            linkedInURL = 'https://www.linkedin.com/sales/gmail/profile/viewByEmail/' + email
            //  console.log(linkedInURL);

            //

        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });

    yield nightmare
        .useragent(ua)

        .cookies.set({
            url: "https://www.linkedin.com",
            name: "li_at",
            value: "CHANGEME"
        })
        .goto(linkedInURL)

        .wait(1923)
        .evaluate(function () {
            return document.querySelector('body').innerHTML
        })
        // .end()
        .then(function (result) {
            parseAndLoad(result)

        })
        .catch(function (e) {
            console.log(e)
        })


    yield nightmare
        .end()
        .then(() => {
            if (proxyUrl != "") {
                console.log(proxyUrl);
                targetRef.set({
                    linkedInURL: proxyUrl,
                    liStatus:'notChecked'
                }, {
                    merge: true
                })

            } else {
                console.log("Doesn't Have LinkedIn");
                targetRef.set({
                    liStatus: "noLinkedIn"
                }, {
                    merge: true
                })
            }

        })
        .catch(function (error) {
            console.error('Fail:', error)
        })
}

console.log('done')