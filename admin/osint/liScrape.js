//v0.1 DRAGNET OSINT
const Nightmare = require('nightmare')
const fs = require('fs')
const path = require('path');
var vo = require('vo')
const cheerio = require('cheerio')
const admin = require("firebase-admin");
const serviceAccount = require("/root/osint/ak/ServiceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "CHANGEME.appspot.com" //TODO << replace with your storagebucketURL
});
const bucket = admin.storage().bucket();
var db = admin.firestore();
db.settings({
    timestampsInSnapshots: true
});



const imgDirectory = '/root/osint/images';
const archiveDirectory = '/root/osint/archives';
const nightmareProxy = 'IPADDRESS:PORT'; //TODO << replace with your proxy

const linkedInURL = process.argv[2]
const liCookie = process.argv[3]
const targetID = process.argv[4]
const targetRef = db.collection('targets').doc(targetID)

//Nightmare with proxy
const nightmareP = Nightmare({
    switches: {
        'proxy-server': `${nightmareProxy}`
    },
    show: false
})

var toDL = []

function randomNumber(low, high) {
    var low = low * 1000
    var high = high * 1000
    var nNum = Math.floor(Math.random() * high) + low
    return nNum
}

var rNum = randomNumber(2, 6)
var lNum = randomNumber(4, 8)
var sNum = randomNumber(.8, 1.3)

const ua =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
const ua2 = 'Googlebot-Image/1.0'

var uniqImgToDL = []
var finalObject = {}

function parseAndLoad(content) {
    console.log("Got html, now archiving and beginning parsing.")
    fs.writeFileSync(`/root/osint/archives/${targetID}.html`, content, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("HTML saved to archives.");

    });



    const aSeconds = Date.now()
    bucket.upload(`/root/osint/archives/${targetID}.html`, {
        destination: `scrapeArchives/${targetID}/${aSeconds}.html`,
    }).then(data => {
        console.log('Successfully archived scrape HTML.');
        //do more with this (diffing etc) later
    }).catch(err => {
        console.log('error uploading to storage', err);
    });

    const $ = cheerio.load(content)

    var exportOut = []

    var imgToDL = []

    $('.pv-top-card-section__photo').each(function (i, element) {
        //user image url
        var avatarUrl = element.attribs.style.split('"')[1]

        //full name
        finalObject.fullName = element.attribs['aria-label']
        finalObject.liStatus = 'checked'
        imgToDL.push({
            name: finalObject.fullName,
            url: avatarUrl,
            urlID: 'avatar',
            imgUrl: avatarUrl,
            type: 'avatar'
        })
    })

    var headlineTag = '.pv-top-card-section__headline'
    $(headlineTag).each(function (i, element) {
        //headline
        finalObject.headline = element.children[0].data.trim()
    })

    var locationTag = '.pv-top-card-section__location'
    $(locationTag).each(function (i, element) {
        //general location
        finalObject.location = element.children[0].data.trim()
    })

    var connectionsTag = '.pv-top-card-v2-section__connections'
    $(connectionsTag).each(function (i, element) {
        //do they have 500+ connections or less?
        finalObject.numConnections = element.children[0].data.trim()
    })

    finalObject.jobs = []

    //grouped companies
    var groupedCompanyNames = []
    var groupedCompanyUrls = []

    //getting company names for grouped companies
    $('#experience-section li.pv-profile-section__card-item-v2').each(function (
        i,
        element
    ) {
        if (element.children[3].name === 'ul') {
            companyName =
                element.children[1].children[1].children[1].children[1].attribs.alt
            companyUrl = element.children[1].attribs.href

            //new grouped companies/exp fix
            var numPositions = 0
            element.children[3].children.forEach(child => {
                if (child.name === 'li') {
                    numPositions++
                    groupedCompanyNames.push(companyName)
                    groupedCompanyUrls.push(companyUrl)
                }
            })
        }
    })

    var jobs = []

    //non-grouped companies
    $('#experience-section div.pv-entity__summary-info').each(function (
        i,
        element
    ) {
        var location = "unlisted"

        var jDates = ['not listed', 'not listed']

        try {
            if (element.childNodes[5].children[1].children[3].children[0].data.split(' – ') != undefined) {
                jDates = element.childNodes[5].children[1].children[3].children[0].data.split(' – ')

            }
        } catch (error) {
            console.log(error);

        }

        try {
            location = element.children[7].children[3].children[0].data
        } catch (error) {
            console.log("doesn't exist");
        }


        var jobObject = {
            position: element.children[1].children[0].data,
            company: element.children[3].children[3].children[0].data,
            companyUrl: element.parent.attribs.href,
            dates: element.children[5].children[1].children[3].children[0].data,
            startDate: jDates[0],
            endDate: jDates[1],
            location: location
        }

        if (jDates[1] === 'Present') {
            jobObject.isPresent = true
        } else {

            var month = jDates[1].split(" ")[0]
            var year = jDates[1].split(" ")[1]
            var monthNum = null
            switch (month) {
                case 'Jan':
                    monthNum = 0
                    break;
                case 'Feb':
                    monthNum = 1
                    break;
                case 'Mar':
                    monthNum = 2
                    break;
                case 'Apr':
                    monthNum = 3
                    break;
                case 'May':
                    monthNum = 4
                    break;
                case 'Jun':
                    monthNum = 5
                    break;
                case 'Jul':
                    monthNum = 6
                    break;
                case 'Aug':
                    monthNum = 7
                    break;
                case 'Sep':
                    monthNum = 8
                    break;
                case 'Oct':
                    monthNum = 9
                    break;
                case 'Nov':
                    monthNum = 10
                    break;
                case 'Dec':
                    monthNum = 11
                    break;

                default:
                    break;
            }
            const sortEndDate = new Date(year, monthNum)
            jobObject.sortEndDate = sortEndDate
        }

        jobs.push(jobObject)
        finalObject.jobs.push(jobObject)
    })

    //grouped companies
    $('#experience-section div.pv-entity__summary-info-v2').each(function (
        i,
        element
    ) {

        var jDates = element.children[3].children[1].children[3].children[0].data.split(' – ') //remember, this needs to be a long dash.


        var location = "unlisted"

        try {
            location = element.children[5].children[3].children[0].data // Updated 9/14/18
        } catch (error) {
        }







        var jobObject = {
            position: element.children[1].children[3].children[0].data,
            company: groupedCompanyNames[0],
            companyUrl: groupedCompanyUrls[0],
            dates: element.children[3].children[1].children[3].children[0].data,
            startDate: jDates[0],
            endDate: jDates[1],
            location: location
        }

        if (jDates[1] === 'Present') {
            jobObject.isPresent = true
        } else {
            var month = jDates[1].split(" ")[0]
            var year = jDates[1].split(" ")[1]
            var monthNum = null
            switch (month) {
                case 'Jan':
                    monthNum = 0
                    break;
                case 'Feb':
                    monthNum = 1
                    break;
                case 'Mar':
                    monthNum = 2
                    break;
                case 'Apr':
                    monthNum = 3
                    break;
                case 'May':
                    monthNum = 4
                    break;
                case 'Jun':
                    monthNum = 5
                    break;
                case 'Jul':
                    monthNum = 6
                    break;
                case 'Aug':
                    monthNum = 7
                    break;
                case 'Sep':
                    monthNum = 8
                    break;
                case 'Oct':
                    monthNum = 9
                    break;
                case 'Nov':
                    monthNum = 10
                    break;
                case 'Dec':
                    monthNum = 11
                    break;

                default:
                    break;
            }
            const sortEndDate = new Date(year, monthNum)
            jobObject.sortEndDate = sortEndDate
        }

        jobs.push(jobObject)
        finalObject.jobs.push(jobObject)
        groupedCompanyNames.shift()
        groupedCompanyUrls.shift()
    })

    finalObject.edus = []
    var edus = []
    //EDUCATION
    $('#education-section div.pv-entity__summary-info').each(function (
        i,
        element
    ) {
        var major = 'unlisted'
        var schoolInfo = element.children[1].children
        var numDetails = 0
        schoolInfo.forEach(edus => {
            if (edus.name === 'p') {
                numDetails++
            }
        })
        if (numDetails > 1) {
            major = element.children[1].children[5].children[3].children[0].data
        }

        var eduObject = {
            schoolName: element.children[1].children[1].children[0].data,
            degree: element.children[1].children[3].children[3].children[0].data,
            major: major,
            schoolUrl: element.parent.attribs.href,
            startDate: element.children[3].children[3].children[1].children[0].data,
            endDate: element.children[3].children[3].children[3].children[0].data
        }

        edus.push(eduObject)
        finalObject.edus.push(eduObject)
    })


    edus.forEach(edu => {
        var urlID
        if (edu.schoolUrl.split("/")[1] != "search") {
            urlID = edu.schoolUrl.split("/")[2]
        }
        qObj = {
            name: edu.schoolName,
            url: edu.schoolUrl,
            type: 'edu',
            urlID: urlID
        }
        imgToDL.push(qObj)
    })

    jobs.forEach(job => {
        var urlID
        if (job.companyUrl.split("/")[1] != "search") {
            urlID = job.companyUrl.split("/")[2]
        }
        qObj = {
            name: job.company,
            url: job.companyUrl,
            type: 'work',
            urlID: urlID
        }
        imgToDL.push(qObj)
    })

    function uniq(a, param) {
        return a.filter(function (item, pos, array) {
            return (
                array
                .map(function (mapItem) {
                    return mapItem[param]
                })
                .indexOf(item[param]) === pos
            )
        })
    }

    uniqImgToDL = uniq(imgToDL, 'url')


    uniqImgToDL.forEach(imgBlob => {
        var imgID = imgBlob.urlID;
        $('code').each(function (i, element) {

            if (element.name === 'code') {
                var blob = element.children[0].data.trim()
            }
            if (blob[0] === "{") {

                json = JSON.parse(blob)['included']
                if (json != null) {
                    var urlParts = []
                    json.forEach(node => {
                        if (node['$id'] != null) {
                            if (node['$id'].includes(imgID)) {
                                var imgUrl = ''

                                if (node['rootUrl'] != null) {
                                    urlParts[0] = node['rootUrl']
                                }

                                if (node['width'] == 400) {
                                    if (node['fileIdentifyingUrlPathSegment'] != null) {
                                        urlParts[1] = node['fileIdentifyingUrlPathSegment']
                                    }
                                }
                            }
                        }
                    });
                    if (urlParts.length == 2) {
                        finalImgUrl = `${urlParts[0]}${urlParts[1]}`
                        imgBlob.imgUrl = finalImgUrl
                    }


                }
            }
        })


    });
}

vo(run)(function (err, result) {})

function* run() {
    var nightmare = Nightmare({
        switches: {
            'proxy-server': `${nightmareProxy}`
        },
        show: true,
        height: 1080,
        width: 1440


    })



    yield nightmare
        .useragent(ua)
        .goto('https://www.linkedin.com')
        .cookies.set(
            'li_at',
            liCookie
        )
        .wait(rNum)
        .goto(linkedInURL)

        //TODO: Build the manual login in so that we can get the cookie that way
        .wait(rNum)
        .scrollTo(sNum, 0)
        .wait(lNum)
        .evaluate(function () {
            return document.querySelector('body').innerHTML
        })
        .then(function (result) {
            parseAndLoad(result)
        })
        .catch(function (e) {
            console.log(e)
        })



    var finalImgUrls = []
    uniqImgToDL.forEach(imgBlob => {
        if (imgBlob.url.split('/')[1] != 'search') {
            finalImgUrls.push(imgBlob)
        }

    })


    for (var i = 0; i < finalImgUrls.length; i++) {

        var imgUrl = finalImgUrls[i]['imgUrl']


        yield nightmare
            .useragent(ua)
            .goto('https://media.licdn.com')
            .cookies.set(
                'li_at',
                liCookie
            )
            .wait(rNum)
            .goto(
                `javascript:document.write(\"<a href='${imgUrl}' id='click-me'>Click</a>\");`
            )
            .click('#click-me')
            .wait(rNum)
            .screenshot(`/root/osint/images/${finalImgUrls[i]['urlID']}.png`) 
            .wait(1000)
            .then(function (result) {
                const iSeconds = Date.now()

                bucket.upload(`/root/osint/images/${finalImgUrls[i]['urlID']}.png`, { 
                    destination: `parseUploads/${finalImgUrls[i]['urlID']}/${iSeconds}.png`,
                }).then(data => {
                    console.log(`Uploaded ${i}/${finalImgUrls.length} images.`);
                    if (i == finalImgUrls.length) {
                        console.log('v0.1 OSINT Complete.');
                    }
                    var idForMatching = data[1].name.split("/")[1]
                    finalObject.edus.forEach(edu => {
                        if (edu.schoolUrl.split("/")[2] === idForMatching) {
                            edu.imgUrl = data[1].name
                        }
                    });

                    finalObject.jobs.forEach(job => {
                        if (job.companyUrl.split("/")[2] === idForMatching) {
                            job.imgUrl = data[1].name
                        }
                    });

                    if (idForMatching === 'avatar') {
                        finalObject.image = data[1].name
                    }


                }).catch(err => {
                    console.log('error uploading to storage', err);
                });
            })
    }

    yield nightmare
        .end()
        .then(() => {
            console.log('Parsing complete.')
            console.log(finalObject);
            finalObject.mainStatus = 'OSINT Complete'
            targetRef.update(finalObject).then(() => {
                db.collection('logs').add({
                    dateAdded: new Date(),
                    type: 'osintComplete',
                    target: targetID,
                    targetID: targetID
                })
            })
            fs.readdir(imgDirectory, (err, files) => {
                console.log('Cleaning up images directory...');

                if (err) throw err;

                for (const file of files) {
                    fs.unlink(path.join(imgDirectory, file), err => {
                        if (err) throw err;
                    });
                }
                console.log('Image directory cleanup complete.');

            });
            fs.readdir(archiveDirectory, (err, files) => {
                console.log('Cleaning up archives directory...');

                if (err) throw err;

                for (const file of files) {
                    fs.unlink(path.join(archiveDirectory, file), err => {
                        if (err) throw err;
                    });
                }
                console.log('Archive directory cleanup complete.');
            });
        })
        .catch(function (error) {
            console.error('Fail:', error)
        })
}

console.log('Starting scrape.')