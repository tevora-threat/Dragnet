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
                                    <v-list-tile>
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
                                    <v-divider inset></v-divider>
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
                                    <v-list-tile v-if="target.linkedInURL">
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

                        <br><br>

                        <v-card>
                            <v-toolbar color="blue-grey darken-1" dark>
                                <v-toolbar-title>Work History</v-toolbar-title>

                                <v-spacer></v-spacer>

                            </v-toolbar>

                            <v-list two-line>
                                <template>
                                    <v-subheader>
                                        Current
                                    </v-subheader>
                                    <v-list-tile v-for="job in jobs" avatar :key="job['.key']">
                                        <v-list-tile-avatar>
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
                                    <v-divider v-for="job in jobs" avatar :key="job['.key']"></v-divider>

                                </template>
                                

                            </v-list>
                        </v-card>

                        <br><br>
                        <v-card>
                            <v-toolbar color="blue-grey darken-1" dark>
                                <v-toolbar-title>Education</v-toolbar-title>

                                <v-spacer></v-spacer>

                            </v-toolbar>

                            <v-list two-line>
                                <template>

                                    <v-list-tile avatar v-for="edu in edus" :key="edu['.key']">
                                        <v-list-tile-avatar>
                                            <img :src="edu.tempImgUrl">
                                        </v-list-tile-avatar>
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{edu.degree}} - {{edu.major}}</v-list-tile-title>
                                            <v-list-tile-sub-title>{{edu.schoolName}}</v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{edu.startDate}} - {{edu.endDate}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider v-for="edu in edus" :key="edu['.key']" inset></v-divider>
                                </template>
                            </v-list>
                        </v-card>

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
                        </v-card><br>
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
                            <v-list two-line>
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
                                    <v-divider inset></v-divider>
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
                                    <v-divider inset></v-divider>
                                    <v-list-tile>
                                        <v-list-tile-action v-if="log.type === 'emailOpened'">
                                            <v-icon color="yellow darken-2">fa-envelope-open</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content v-if="log.type === 'emailOpened'">
                                            <v-list-tile-title>Email Opened</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider inset></v-divider>
                                    <v-list-tile>
                                        <v-list-tile-action v-if="log.type === 'emailSent'">
                                            <v-icon color="green darken-2">call_made</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>Email Sent</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider inset></v-divider>
                                    <v-list-tile>
                                        <v-list-tile-action v-if="log.type === 'testTypeChosen'">
                                            <v-icon color="purple darken-2">mdi-hook</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>Targeted for Phishing on <b>{{log.clientName}}</b> engagement</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider inset></v-divider>
                                    <v-list-tile>
                                        <v-list-tile-action v-if="log.type === 'templatedSuggested'">
                                            <v-icon color="blue darken-1">mdi-brain</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title><b>Phishing</b> & <b>Vishing</b> Templates Suggested</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider inset></v-divider>
                                    <v-list-tile>
                                        <v-list-tile-action v-if="log.type === 'osintComplete'">
                                            <v-icon color="orange darken-2">fingerprint</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title><b>OSINT</b> Complete</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider inset></v-divider>
                                    <v-list-tile>
                                        <v-list-tile-action v-if="log.type === 'osintStarted'">
                                            <v-icon color="green darken-2">fingerprint</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title><b>OSINT</b> Started</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider inset></v-divider>
                                    <v-list-tile avatar>
                                        <v-list-tile-avatar>
                                            <img :src="logLogoUrl">
                                        </v-list-tile-avatar>
                                        <v-list-tile-content>
                                            <v-list-tile-title>Added to <b>{{log.clientName}}</b> Targets</v-list-tile-title>
                                            <!-- <v-list-tile-sub-title>Work Landline</v-list-tile-sub-title> -->
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
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
            targetID: this.$route.params.targetID,
            targetName: 'testName',
            targetJob: 'testJob',
            targetCompany: 'testCompany',
            target: {},
            ageNum: '',
            show: false,
            DNSshow1: false,
            HTTPshow1: false,
            DNSshow: false,
            HTTPshow: false,
            title: 'Your Logo',
            edus: [],
            jobs: [],
            attacksOnTarget: [],
            posts: []
        }
    },
    beforeCreate() {

        var vm = this
        this.targetID = this.$route.params.targetID
        var storage = storageRef.ref()
        db
            .collection('targets')
            .doc(this.targetID)
            .get()
            .then(doc1 => {

                var tempObject = Object(doc1.data())
                tempObject.edus.forEach(edu => {
                    var eduRef = storage.child(edu.imgUrl)
                    eduRef.getDownloadURL().then(url => {
                        edu.tempImgUrl = url
                    })


                    this.edus.push(edu)
                })

                tempObject.jobs.forEach(job => {
                    var jobRef = storage.child(job.imgUrl)
                    jobRef.getDownloadURL().then(url => {
                        job.tempImgUrl = url
                    })

                    this.jobs.push(job)

                })

                var imgUrl = tempObject.image


                var targetsRef = storage.child(imgUrl)
                targetsRef.getDownloadURL().then(url => {
                    vm.target.tmpImg = url
                })


            })

       
    },
    mounted() {
    },
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
