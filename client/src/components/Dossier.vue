<template>
<v-container grid-list-md text-xs-center>
    <v-layout row wrap>
        <v-flex xs6>
            <v-flex style="padding-left:8px;padding-right:16px;" xs12>
                <v-card>
                    <v-toolbar color="blue-grey darken-1" dark>
                        <v-toolbar-title>Target</v-toolbar-title>

                        <v-spacer></v-spacer>

                    </v-toolbar>

                    <v-list two-line>
                        <v-list-tile avatar>
                            <v-list-tile-avatar v-if="target.tmpImg">
                                <img :src="target.tmpImg">
                            </v-list-tile-avatar>
                                <v-list-tile-content>
                                    <v-list-tile-title>{{target.name}}</v-list-tile-title>
                                    <v-list-tile-sub-title>{{target.headline}}</v-list-tile-sub-title>
                                </v-list-tile-content>

                        </v-list-tile>

                    </v-list>
                </v-card>
            </v-flex><br>

            <v-flex xs12>
                <v-container id="scroll-target" style="padding:0;padding-top:4px;padding-left:8px;padding-right:16px;max-height: 600px" class="scroll-y">
                    <v-layout v-scroll:#scroll-target="onScroll" column style="height:60%;">
                        <v-card>
                            <v-toolbar color="blue-grey darken-1" dark>
                                <v-toolbar-title>Contact Info</v-toolbar-title>

                                <v-spacer></v-spacer>

                            </v-toolbar>

                            <v-list two-line>
                                <template>
                                    <v-list-tile v-if="target.phone">
                                        <v-list-tile-action>
                                            <v-icon color="blue darken-2">phone</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{target.phone}}</v-list-tile-title>
                                            <v-list-tile-sub-title>Work Landline</v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-icon>check</v-icon>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider v-if="target.phone" inset></v-divider>
                                    <v-list-tile v-if="target.email">
                                        <v-list-tile-action>
                                            <v-icon color="indigo darken-1">email</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{target.email}}</v-list-tile-title>
                                            <v-list-tile-sub-title>Work Email</v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-icon>check</v-icon>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider v-if="target.email" inset></v-divider>
                                    <v-list-tile v-if="target.twitter">
                                        <v-list-tile-action>
                                            <v-icon style="color:#00aced;">mdi-twitter</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{target.twitter}}</v-list-tile-title>
                                            <v-list-tile-sub-title>Twitter</v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-icon>fingerprint</v-icon>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider v-if="target.twitter" inset></v-divider>
                                    <v-list-tile @click="toLinkedIn(target.linkedInUrl)" v-if="target.linkedInURL">
                                        <v-list-tile-action>

                                            <v-icon style="color:#0077B5;">mdi-linkedin</v-icon>

                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{target.name}}</v-list-tile-title>
                                            <v-list-tile-sub-title>LinkedIn</v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-icon>fingerprint</v-icon>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                </template>
                            </v-list>
                        </v-card>
                        <template v-if="jobs.length>0 || currentJobs.length>0">
                            <br><br>

                            <v-card>
                                <v-toolbar color="blue-grey darken-1" dark>
                                    <v-toolbar-title>Work History</v-toolbar-title>

                                    <v-spacer></v-spacer>

                                </v-toolbar>
                                <v-subheader>
                                    Current
                                </v-subheader>
                                <v-list two-line v-for="job in currentJobs" avatar :key="job['position']">
                                    <template>

                                        <v-list-tile>
                                            <v-list-tile-avatar v-if="job.tempImgUrl">
                                                <img :src="job.tempImgUrl">
                                            </v-list-tile-avatar>
                                                <v-list-tile-content>
                                                    <v-list-tile-title>{{job.position}}</v-list-tile-title>
                                                    <v-list-tile-sub-title>{{job.company}}</v-list-tile-sub-title>
                                                </v-list-tile-content>
                                                <v-list-tile-action>
                                                    <v-list-tile-action-text>{{job.dates}}</v-list-tile-action-text>
                                                </v-list-tile-action>
                                        </v-list-tile>
                                        <v-divider v-if="jobs.length-1 > jobs.indexOf(job)" inset></v-divider>

                                    </template>

                                </v-list>
                                <v-subheader>
                                    Previous
                                </v-subheader>
                                <v-list two-line v-for="job in jobs" avatar :key="job['position']">
                                    <template>

                                        <v-list-tile>
                                            <v-list-tile-avatar v-if="job.tempImgUrl">
                                                <img :src="job.tempImgUrl">
                                            </v-list-tile-avatar>
                                                <v-list-tile-content>
                                                    <v-list-tile-title>{{job.position}}</v-list-tile-title>
                                                    <v-list-tile-sub-title>{{job.company}}</v-list-tile-sub-title>
                                                </v-list-tile-content>
                                                <v-list-tile-action>
                                                    <v-list-tile-action-text>{{job.dates}}</v-list-tile-action-text>
                                                </v-list-tile-action>
                                        </v-list-tile>
                                        <v-divider v-if="jobs.length-1 > jobs.indexOf(job)" inset></v-divider>

                                    </template>

                                </v-list>
                            </v-card>
                        </template>
                        <template v-if="edus.length>0">
                            <br><br>
                            <v-card>
                                <v-toolbar color="blue-grey darken-1" dark>
                                    <v-toolbar-title>Education</v-toolbar-title>

                                    <v-spacer></v-spacer>

                                </v-toolbar>

                                <v-list v-for="edu in edus" :key="edu['.key']" two-line>
                                    <template>

                                        <v-list-tile avatar>
                                            <v-list-tile-avatar v-if="edu.tempImgUrl">
                                                <img :src="edu.tempImgUrl">
                                            </v-list-tile-avatar>
                                                <v-list-tile-content>
                                                    <v-list-tile-title v-if="edu.major === 'unlisted'">{{edu.degree}}</v-list-tile-title>
                                                    <v-list-tile-title v-else>{{edu.degree}} - {{edu.major}}</v-list-tile-title>

                                                    <v-list-tile-sub-title>{{edu.schoolName}}</v-list-tile-sub-title>
                                                </v-list-tile-content>
                                                <v-list-tile-action>
                                                    <v-list-tile-action-text>{{edu.startDate}} - {{edu.endDate}}</v-list-tile-action-text>
                                                </v-list-tile-action>
                                        </v-list-tile>
                                        <v-divider v-if="edus.length-1 > edus.indexOf(edu)" inset></v-divider>
                                    </template>
                                </v-list>
                            </v-card>
                        </template>
                        <template v-if="background.length>0">
                            <br><br>
                            <v-card>
                                <v-toolbar color="blue-grey darken-1" dark>
                                    <v-toolbar-title>Background Info</v-toolbar-title>

                                    <v-spacer></v-spacer>

                                </v-toolbar>

                                <v-list two-line>
                                    <template>
                                        <v-list-tile v-if="target.school != null">
                                            <v-list-tile-action>
                                                <v-icon color="indigo">calendar_today</v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title>{{target.dob}}</v-list-tile-title>
                                                <v-list-tile-sub-title>Date of Birth</v-list-tile-sub-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-icon color="gray lighten-2">fingerprint</v-icon>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-divider inset></v-divider>
                                        <v-list-tile v-if="target.school != null">
                                            <v-list-tile-action>
                                                <v-icon color="blue darken-1">location_on</v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title>1400 West Avenue</v-list-tile-title>
                                                <v-list-tile-sub-title>Palo Alto</v-list-tile-sub-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-icon color="gray lighten-2">fingerprint</v-icon>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-divider inset></v-divider>
                                        <v-list-tile v-if="target.school != null">
                                            <v-list-tile-action>
                                                <v-icon color="pink darken-2">mdi-gender-female</v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title>She, Her</v-list-tile-title>
                                                <v-list-tile-sub-title>Gender Pronouns</v-list-tile-sub-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-icon color="gray lighten-2">fingerprint</v-icon>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                    </template>
                                </v-list>
                            </v-card>
                        </template>
                        <br>
                    </v-layout>
                </v-container>
            </v-flex>
        </v-flex>
        <v-flex xs6>
            <v-flex style="padding-left:6px;padding-right:6px;" xs12>
                <v-card>
                    <v-toolbar color="blue-grey darken-1" dark>
                        <v-toolbar-title>Suggested Attacks</v-toolbar-title>

                        <v-spacer></v-spacer>

                    </v-toolbar>

                    <v-list two-line>
                        <v-progress-linear v-if="(target.mainStatus === 'Starting OSINT') || (target.mainStatus === 'Starting ML Prediction')" color="primary" height="3" indeterminate value="15"></v-progress-linear>

                        <v-list-tile v-if="target.phishGuessName">
                            <v-list-tile-action>
                                <v-icon color="indigo">phone</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{target.phishGuessName}}</v-list-tile-title>
                                <v-list-tile-sub-title>Suggested Phishing Template</v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>

                        <v-divider inset></v-divider>
                        <v-list-tile v-if="target.vishGuessName">
                            <v-list-tile-action>
                                <v-icon color="indigo">mail</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{target.vishGuessName}}</v-list-tile-title>
                                <v-list-tile-sub-title>Suggested Vishing Template</v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>

                    </v-list>
                </v-card>
            </v-flex><br>
            <v-flex xs12>

                <v-card>
                    <v-toolbar color="blue-grey darken-1" dark>
                        <v-toolbar-title>Target History</v-toolbar-title>

                        <v-spacer></v-spacer>

                    </v-toolbar>
                    <v-container id="scroll-target" style="padding:0;padding-top:4px;padding-left:8px;padding-right:16px;max-height: 442px" class="scroll-y">
                        <v-layout v-scroll:#scroll-target="onScroll" column style="height:60%;">
                            <v-list v-for="log in logs" :key="log['.key']" two-line>
                                <template>
                                    <v-list-tile v-if="log.type === 'creds'">
                                        <v-list-tile-action>
                                            <v-icon color="red darken-2">fa-keyboard</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>Creds Entered</v-list-tile-title>
                                            <v-list-tile-sub-title><kbd class="credsColor">{{log.creds.email}}:{{log.creds.pw}}</kbd></v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-list-tile v-if="log.type === 'linkClicked'">
                                        <v-list-tile-action>
                                            <v-icon color="orange darken-2">fa-link</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>Link Clicked</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-list-tile v-if="log.type === 'emailOpened'">
                                        <v-list-tile-action>
                                            <v-icon color="yellow darken-2">fa-envelope-open</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>Email Opened</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-list-tile v-if="log.type === 'emailSent'">
                                        <v-list-tile-action>
                                            <v-icon color="green darken-2">call_made</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>Email Sent</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-list-tile v-if="log.type === 'testTypeChosen'">
                                        <v-list-tile-action>
                                            <v-icon color="purple darken-2">mdi-hook</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title v-if="log.test === 'both'">Targeted for Phishing & Vishing on <b>{{log.clientName}}</b> engagement</v-list-tile-title>
                                            <v-list-tile-title v-if="log.test === 'phishing'">Targeted for Phishing on <b>{{log.clientName}}</b> engagement</v-list-tile-title>
                                            <v-list-tile-title v-if="log.test === 'vishing'">Targeted for Vishing on <b>{{log.clientName}}</b> engagement</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-list-tile v-if="log.type === 'templatesSuggested'">
                                        <v-list-tile-action>
                                            <v-icon color="blue darken-1">mdi-brain</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title v-if="log.test === 'both'"><b>Phishing</b> & <b>Vishing</b> Templates Suggested</v-list-tile-title>
                                            <v-list-tile-title v-if="log.test === 'phishing'"><b>Phishing</b> Template Suggested</v-list-tile-title>
                                            <v-list-tile-title v-if="log.test === 'vishing'"><b>Vishing</b> Template Suggested</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-list-tile v-if="log.type === 'osintComplete'">
                                        <v-list-tile-action>
                                            <v-icon color="orange darken-2">fingerprint</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title><b>OSINT</b> Complete</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-list-tile v-if="log.type === 'osintStarted'">
                                        <v-list-tile-action>
                                            <v-icon color="green darken-2">fingerprint</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title><b>OSINT</b> Started</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-list-tile avatar v-if="log.type === 'addedToCompany'">
                                        <v-list-tile-avatar v-if="log.companyUrl">
                                            <img :src="log.logoUrl">
                                        </v-list-tile-avatar>
                                            <v-list-tile-content>
                                                <v-list-tile-title>Added to <b>{{log.clientName}}</b> Targets</v-list-tile-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                            </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider v-if="logs.length-1 > logs.indexOf(log)" inset></v-divider>
                                </template>
                            </v-list>
                        </v-layout>
                    </v-container>
                </v-card>
                <br>

            </v-flex>

            </v-flex>
    </v-layout>
</v-container>
</template>

<script>
const fb = require('../db/index.js')
const db = fb.db
const storageRef = fb.storage
export default {
    name: 'Dossier',
    firestore() {
        return {
            target: db.collection('targets').doc(this.targetID),
            attacksOnTarget: db
                .collection('attacks')
                .where('targetID', '==', this.$route.params.targetID)
        }
    },
    methods: {
        toLinkedIn(url) {
            //TODO - add modal alert confirming you want to visit their linkedin (could show up on target's view history if you're logged into LI)
            // if yes, open LI in new tab
        },
        getAge(dateString) {
            var today = new Date()
            var birthDate = new Date(dateString)
            var age = today.getFullYear() - birthDate.getFullYear()
            var m = today.getMonth() - birthDate.getMonth()
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--
            }
            return age
        },
        updateTarget() {

        },
        toAttack(attackID) {
            var vm = this
            vm.$router.push({
                name: 'SingleAttack',
                params: {
                    attackID: attackID
                }
            })
        }
    },
    data() {
        return {
            creds: {},
            background: [],
            logs: [],
            targetID: this.$route.params.targetID,
            targetName: '',
            targetJob: '',
            targetCompany: '',
            target: {},
            ageNum: '',
            show: false,
            DNSshow1: false,
            HTTPshow1: false,
            DNSshow: false,
            HTTPshow: false,
            title: '',
            edus: [],
            jobs: [],
            currentJobs: [],
            attacksOnTarget: [],
            posts: []
        }
    },
    beforeCreate() {

        var vm = this
        this.targetID = this.$route.params.targetID
        var storage = storageRef.ref()
        db.collection('logs').where('target', '==', this.targetID).orderBy("dateAdded", "desc").get()
            .then(querySnapshot => {
                querySnapshot.forEach(logDoc => {
                    var log = logDoc.data()
                    log.id = logDoc.id
                    log.date = new Date(log.dateAdded.seconds * 1000).toLocaleDateString()
                    log.time = new Date(log.dateAdded.seconds * 1000).toLocaleTimeString()
                    if (log.companyUrl) {
                        log.logoUrl = `//logo.clearbit.com/${log.companyUrl}`
                    }
                    console.log(log);
                    this.logs.push(log)

                })
            })

    },
    watch: {
        target(val) {
            var vm = this
            var tempObject = val
            console.log(tempObject);
            console.log(vm.target);

            var storage = storageRef.ref()

            console.log(tempObject);

            tempObject.edus.forEach(edu => {
                console.log(edu);

                if (edu.imgUrl) {
                    var imgParts = edu.imgUrl.split("/")
                    var fixedImg = `${imgParts[0]}/${imgParts[1]}/fixed_${imgParts[2]}`
                    var eduRef = storage.child(fixedImg)
                    eduRef.getDownloadURL().then(url => {
                        edu.tempImgUrl = url
                    })
                }

                this.edus.push(edu)

            })

            var sortedJobs = []

            tempObject.jobs.forEach(job => {

                if (job.imgUrl) {
                    var imgParts = job.imgUrl.split("/")
                    var fixedImg = `${imgParts[0]}/${imgParts[1]}/fixed_${imgParts[2]}`
                    var jobRef = storage.child(fixedImg)
                    jobRef.getDownloadURL().then(url => {
                        job.tempImgUrl = url
                        console.log(url);

                    })
                }

                if (job.isPresent) {
                    this.currentJobs.push(job)
                } else {
                    sortedJobs.push(job)
                }

                console.log(job);

            })

            sortedJobs.sort(function (a, b) {

                return b.sortEndDate.seconds - a.sortEndDate.seconds

            })

            this.jobs = sortedJobs

            var imgUrl = tempObject.image

            var imgParts = imgUrl.split("/")
            var fixedImg = `${imgParts[0]}/${imgParts[1]}/fixed_${imgParts[2]}`
            var targetsRef = storage.child(fixedImg)
            targetsRef.getDownloadURL().then(url => {
                tempObject.tmpImg = url
            })

            console.log(tempObject);

        },

        currentJobs(val) {
            console.log(val);

        }
    },
    mounted() {},
    created() {

    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>
/* .v-avatar {
    height: 60px !important;
  width: 60px !important; 
} */

/* h1,
h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

 li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
} */
</style>
