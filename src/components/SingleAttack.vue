<template>
<v-container fill-height fluid grid-list-md>
    <v-layout row wrap>
        <v-flex d-flex xs12 sm6 md8>
            <v-layout column wrap>
                <v-flex v-if="attack.type === 'vishing'" md8 d-flex>
                    <v-card>
                        <v-container>
                            <h2>Loan Follow-Up Script</h2><br>
                            <pre style="font-size:16pt;">{{scriptRender}}</pre>
                        </v-container>
                    </v-card>
                </v-flex>
                <v-flex v-if="attack.type === 'phishing'" md9 d-flex>

                    <v-card>
                        <v-container>
                            <v-layout row wrap>
                                <v-flex xs6 m6>
                                    <h3>Subject Line:</h3>
                                    <v-text-field :value="attack.template.subjectLine" outline single-line readonly></v-text-field>
                                </v-flex>
                                <v-flex xs6 m6>
                                    <h3>Credentials Captured:</h3>
                                    <v-text-field v-model="last" style="font-family:monospace;" class="v-input--is-focused testHeight credsText" :label="`${credsEmail}:${credsPW}`" solo-inverted readonly></v-text-field>

                                </v-flex>

                            </v-layout>
                            <h3>Email Body:</h3>
                            <div class="ql-editor">
                                <v-card elevation-10>
                                    <div v-html="attack.template.template">
                                    </div>
                                </v-card>

                            </div>
                        </v-container>
                    </v-card>

                </v-flex>

                <v-flex v-if="attack.type === 'vishing'" md4 d-flex>
                    <v-card>
                        <v-container text-xs-center fill-height fluid grid-list-md>
                            <v-layout row wrap>
                                <v-flex d-flex xs12 sm6 md12>
                                    <v-card>

                                        <div class="text-xs-center">
                                            <v-btn style="margin-bottom:0;margin-top:0;" v-if="attack.status === 'ready'" :disabled="dialog" block large :loading="dialog" class="white--text" color="red darken-2" @click.stop="showDialogAndUpdateLog">
                                                Place Call
                                            </v-btn>
                                            <v-btn v-else-if="attack.status === 'vuln' || attack.status === 'safe'" :disabled="dialog" :loading="dialog" block large style="margin-bottom:0;margin-top:0;" class="white--text" color="purple darken-2" @click.stop="playRec">
                                                Play Call
                                            </v-btn>
                                            <v-dialog v-model="dialog" hide-overlay persistent width="300">
                                                <v-card color="primary" dark>
                                                    <v-card-text>
                                                        Calling Your Attack Phone
                                                        <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
                                                    </v-card-text>
                                                </v-card>
                                            </v-dialog>
                                        </div>
                                        <v-bottom-sheet inset v-model="showRecSheet" :position-x="x" :position-y="y" absolute offset-y id="noBlock">

                                            <v-card tile>
                                                <v-progress-linear :value="scrubber" color="green darken-1" class="my-0" height="3"></v-progress-linear>

                                                <v-list>
                                                    <v-list-tile>
                                                        <v-list-tile-content>
                                                            <v-list-tile-title>{{target.name}} Vishing Call</v-list-tile-title>
                                                            <v-list-tile-sub-title>{{recording.date}} | {{recording.time}}</v-list-tile-sub-title>
                                                        </v-list-tile-content>

                                                        <v-spacer></v-spacer>

                                                        <v-list-tile-action>
                                                            <v-btn icon @click="rwRec">
                                                                <v-icon>fast_rewind</v-icon>
                                                            </v-btn>
                                                        </v-list-tile-action>

                                                        <v-list-tile-action :class="{ 'mx-5': $vuetify.breakpoint.mdAndUp }">
                                                            <v-btn icon @click="playPauseRec">
                                                                <v-icon v-if="this.paused">play_arrow</v-icon>
                                                                <v-icon v-else>pause</v-icon>
                                                            </v-btn>
                                                        </v-list-tile-action>

                                                        <v-list-tile-action :class="{ 'mr-3': $vuetify.breakpoint.mdAndUp }">
                                                            <v-btn icon>
                                                                <v-icon>fast_forward</v-icon>
                                                            </v-btn>
                                                        </v-list-tile-action>

                                                    </v-list-tile>
                                                </v-list>
                                            </v-card>
                                        </v-bottom-sheet>
                                        <!-- <v-bottom-sheet inset v-model="showSheet" :position-x="x" :position-y="y" absolute offset-y persistent hide-overlay id="noBlock"> -->
                                        <v-bottom-sheet inset v-model="showSheet" :position-x="x" :position-y="y" absolute offset-y persistent id="noBlock">

                                            <v-card tile>
                                                <v-progress-linear :value="100" color="red" class="my-0" height="3"></v-progress-linear>

                                                <v-list>
                                                    <v-list-tile>
                                                        <v-list-tile-content>
                                                            <v-list-tile-title>Calling {{target.name}}</v-list-tile-title>
                                                            <v-list-tile-sub-title>Calling {{}} | Recording</v-list-tile-sub-title>
                                                        </v-list-tile-content>

                                                        <v-spacer></v-spacer>

                                                        <v-list-tile-action>
                                                            <v-btn @click="byeLog2" icon>
                                                                <v-icon>cancel</v-icon>

                                                            </v-btn>
                                                        </v-list-tile-action>

                                                    </v-list-tile>
                                                </v-list>
                                            </v-card>
                                        </v-bottom-sheet>
                                        <v-dialog v-model="dialogEnd" persistent max-width="350">
                                            <v-card>
                                                <v-card-title class="headline">How'd it go?</v-card-title>
                                                <center>
                                                    <v-card-text><b>Is {{target.name}} vuln? <br>Did you get the goods?!</b></v-card-text>
                                                </center>
                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn color="green darken-1" dark @click.native="endAttack('safe')">Not Vuln</v-btn>
                                                    <v-btn color="red darken-1" dark @click.native="endAttack('vuln')">Vuln</v-btn>
                                                    <v-btn color="blue darken-1" dark @click.native="endAttack('vm')">Voicemail</v-btn>
                                                    <v-spacer></v-spacer>
                                                </v-card-actions>
                                            </v-card>
                                        </v-dialog>
                                    </v-card>
                                </v-flex>
                                <v-flex d-flex xs12 sm6 md12>
                                    <v-card flat>

                                        <v-textarea name="input-7-1" v-model="callNotes" box height="115px" label="Call Notes" auto-grow value="The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through."></v-textarea>
                                    </v-card>
                                </v-flex>

                            </v-layout>
                        </v-container>
                    </v-card>
                </v-flex>
                <v-flex v-if="attack.type === 'phishing'" md3 d-flex>
                    <v-card>
                        <v-container text-xs-center fill-height fluid grid-list-md>
                            <v-layout row wrap>

                                <v-flex d-flex xs12 sm6 md12>
                                    <v-card flat>

                                        <v-textarea name="input-7-1" v-model="callNotes" box height="115px" label="Phishing Attack Notes" auto-grow value="The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through."></v-textarea>
                                    </v-card>
                                </v-flex>

                            </v-layout>
                        </v-container>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-flex>
        <v-flex d-flex xs12 sm6 md4>
            <v-layout column wrap>
                <v-flex md7 d-flex>

                    <v-card>
                        <v-toolbar style="margin-left:0;" color="blue-grey darken-1" dark>

                            <div style="width:100%;margin-left: -24px;">
                                <v-list-tile avatar>
                                    <v-list-tile-avatar @click="toDossier(targetID)">
                                        <img :src="target.image">
                                    </v-list-tile-avatar>

                                    <v-list-tile-content>
                                        <v-list-tile-title>{{target.name}}</v-list-tile-title>
                                        <v-list-tile-sub-title>{{target.companyName}}</v-list-tile-sub-title>
                                    </v-list-tile-content>
                                    <v-spacer></v-spacer>
                                    <v-list-tile-action text-color="white">
                                        <v-list-tile-action-text class="white--text" text-color="white">Target</v-list-tile-action-text>
                                    </v-list-tile-action>
                                </v-list-tile>
                            </div>
                        </v-toolbar>
                        <v-container id="scroll-target" style="padding:0;padding-top:4px;padding-left:0;padding-right:16px;max-height: 396px" class="scroll-y">
                            <v-layout v-scroll:#scroll-target="onScroll" column style="height:60%;">
                                <v-list two-line>

                                    <v-subheader>Contact Information</v-subheader>
                                    <v-list-tile>
                                        <v-list-tile-action>
                                            <v-icon color="blue darken-4">phone</v-icon>
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
                                    <v-list-tile v-if="target.phishGuessName">
                                        <v-list-tile-action>
                                            <v-icon color="indigo darken-2">email</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{target.email}}</v-list-tile-title>
                                            <v-list-tile-sub-title>Work Email</v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-icon>check</v-icon>
                                        </v-list-tile-action>
                                    </v-list-tile>
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
                                    <v-divider></v-divider>
                                    <v-subheader>
                                        Work Experience
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

                                    <v-subheader>
                                        Education
                                    </v-subheader>
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

                                    <v-subheader>
                                        Background Info
                                    </v-subheader>
                                    <v-list-tile v-if="target.dob != null">
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
                                    <v-list-tile v-if="target.address != null">
                                        <v-list-tile-action>
                                            <v-icon color="blue darken-1">location_on</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{target.address.street}}</v-list-tile-title>
                                            <v-list-tile-sub-title>{{target.address.city}}</v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-icon color="gray lighten-2">fingerprint</v-icon>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider inset></v-divider>
                                    <v-list-tile v-if="target.gender != null">
                                        <!-- <v-list-tile-action>
                                            <v-icon color="pink darken-2">mdi-gender-female</v-icon>
                                        </v-list-tile-action> -->
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{target.gender}}</v-list-tile-title>
                                            <v-list-tile-sub-title>Gender Pronouns</v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-icon color="gray lighten-2">fingerprint</v-icon>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                </v-list>
                            </v-layout>
                        </v-container>
                    </v-card>
                </v-flex>

                <v-flex md5 d-flex>
                    <v-card>
                        <v-toolbar color="blue-grey darken-1" dark>
                            <v-toolbar-title>Attack Log</v-toolbar-title>

                            <v-spacer></v-spacer>

                        </v-toolbar>
                        <v-container v-if="attack.type === 'phishing'" id="scroll-target" style="padding:0;padding-top:4px;padding-left:0;padding-right:16px;max-height: 260px" class="scroll-y">
                            <v-layout v-scroll:#scroll-target="onScroll" column style="height:60%;">
                                <v-list two-line>

                                    <v-list-tile>
                                        <v-list-tile-action>
                                            <v-icon color="red darken-2">fa-keyboard</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>Creds Entered</v-list-tile-title>
                                            <v-list-tile-sub-title><kbd class="credsColor">{{credsEmail}}:{{credsPW}}</kbd></v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>{{creds.date}}<br>{{creds.time}}</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider inset></v-divider>
                                    <v-list-tile>
                                        <v-list-tile-action>
                                            <v-icon color="orange darken-2">fa-link</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>Link Clicked</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>8/10/18<br>1:47pm</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider inset></v-divider>
                                    <v-list-tile>
                                        <v-list-tile-action>
                                            <v-icon color="yellow darken-2">fa-envelope-open</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>Email Opened</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>8/10/18<br>1:47pm</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider inset></v-divider>
                                    <v-list-tile>
                                        <v-list-tile-action>
                                            <v-icon color="green darken-2">call_made</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>Email Sent</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>8/10/18<br>1:46pm</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                </v-list>

                            </v-layout>
                        </v-container>
                        <v-container v-else id="scroll-target" style="padding:0;padding-top:4px;padding-left:0;padding-right:16px;max-height: 260px" class="scroll-y">
                            <v-layout v-scroll:#scroll-target="onScroll" column style="height:60%;">
                                <v-list two-line>

                                    <template v-if="attack.status === 'safe'">
                                        <v-list-tile>
                                            <v-list-tile-action>
                                                <v-icon color="green darken-2">play_arrow</v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title>Vishing Call Unsuccessful</v-list-tile-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-list-tile-action-text>8/10/18<br>1:48pm</v-list-tile-action-text>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-divider inset></v-divider>
                                    </template>

                                    <template v-if="updateLog">
                                        <v-list-tile>
                                            <v-list-tile-action>
                                                <v-icon color="orange darken-2">phone</v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title>Vishing Call Placed</v-list-tile-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-list-tile-action-text>8/10/18<br>1:47pm</v-list-tile-action-text>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-divider inset></v-divider>
                                    </template>

                                    <v-list-tile>
                                        <v-list-tile-action>
                                            <v-icon color="yellow darken-2">fa-envelope-open</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>Linked Email Opened</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>8/10/18<br>1:47pm</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider inset></v-divider>
                                    <v-list-tile>
                                        <v-list-tile-action>
                                            <v-icon color="green darken-2">call_made</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>Linked Email Sent</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-list-tile-action-text>8/10/18<br>1:46pm</v-list-tile-action-text>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                </v-list>

                            </v-layout>
                        </v-container>

                    </v-card>
                </v-flex>

            </v-layout>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
var audioElement = document.createElement('audio')
audioElement.setAttribute('preload', 'none')
const fb = require('../db/index.js')
const db = fb.db
export default {
    name: 'SingleAttack',
    data() {
        return {
            recording: {},
            updateLog: false,
            x: 0,
            scrubber: 0,
            audioRecordingUrl: '',
            recordingDate: null,
            recordingTime: null,
            paused: false,
            showSheet: false,
            showRecSheet: false,
            dialogEnd: false,
            y: 0,
            target: {},
            attack: {},
            lorem: 'testing',
            dialog: false,
            engagement: {},
            testType: {
                cbPhishing: false,
                cbVishing: false,
                cbPhysical: false
            },
            script: {},
            scriptRender: '',
            scriptTags: {},
            callNotes: '',
            scriptID: '',
            search: '',
            testScript: '',
            targetName: '',
            targetID: ''
        }
    },
    beforeCreate() {

        this.attackID = this.$route.params.attackID

        db
            .collection('attacks')
            .doc(this.attackID)
            .get()
            .then(doc1 => {
                
                var tempObject = Object(doc1.data())
                tempObject.id = doc1.id
                

                if (tempObject.type === 'vishing') {
                    if (tempObject.script != null) {
                        var newLineString = tempObject.script.scriptRaw.replace('\\n', '\n')
                        var renderScript = newLineString.replace(
                            '${targetName}',
                            tempObject.targetName
                        )
                        tempObject.script.scriptRender = renderScript
                    }

                    tempObject.target.ageNum = this.getAge(tempObject.target.dob)
                    this.updateInfo(tempObject)
                } else {

                    db
                        .collection('emailTemplates')
                        .doc(tempObject.templateID)
                        .get()
                        .then(doc1 => {
                            tempObject.template = doc1.data()
                            tempObject.target.ageNum = this.getAge(tempObject.target.dob)
                            this.updatePhishingInfo(tempObject)
                        })
                }
            })

    },
    created() {

    },
    computed: {

    },
    watch: {
        dialog(val) {
            if (!val) return

            setTimeout(() => this.byeLog(), 4000)
        }
    },
    mounted: {},
    methods: {
        showDialogAndUpdateLog() {
            var vm = this
            vm.dialog = true
            vm.updateLog = true
        },

        toDossier(targetID) {
            var vm = this
            vm.$router.push({
                name: 'Dossier',
                params: {
                    targetID: targetID
                }
            })
        },
        endAttack(result) {
            var vm = this
            setTimeout(() => (vm.dialogEnd = false), 1000)

            vm.recordingDate = Date().toLocaleDateString
            vm.recordingTime = Date().toLocaleTimeString

            switch (result) {
                case 'vuln':
                    db
                        .collection('attacks')
                        .doc(this.attackID)
                        .set({
                            status: 'vuln'
                        }, {
                            merge: true
                        })
                        .then(function () {
                            vm.attack.status = 'vuln'
                        })

                    break
                case 'safe':
                    db
                        .collection('attacks')
                        .doc(this.attackID)
                        .set({
                            status: 'safe'
                        }, {
                            merge: true
                        })
                        .then(function () {
                            vm.attack.status = 'safe'
                        })
                    break
                case 'vm':
                    db
                        .collection('attacks')
                        .doc(this.attackID)
                        .set({
                            status: 'vm'
                        }, {
                            merge: true
                        })
                        .then(function () {
                            vm.attack.status = 'vm'
                        })
                    break

                default:
                    break
            }
        },
        aBuffer() {
            var vm = this
            setInterval(function () {
                var cTime = audioElement.currentTime / audioElement.duration * 100
                if (cTime != 100) {
                    vm.scrubber = cTime
                } else {
                    vm.scrubber = 0
                    vm.paused = true
                }

            }, 100)
        },
        playRec() {
            this.showRecSheet = true
            audioElement.setAttribute(
                'src',
                this.audioRecordingUrl
            )
            audioElement.play()
            audioElement.pl
            this.aBuffer()
        },
        rwRec() {
            audioElement.currentTime = 0
            if (!this.paused) {
                audioElement.play()
            }
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

        playPauseRec() {
            if (this.paused) {
                audioElement.play()
                // this.aBuffer("start");
            } else {
                audioElement.pause()
                // this.aBuffer();
            }
            this.paused = !this.paused
        },
        byeLog() {
            this.dialog = false
            this.showSheet = !this.showSheet
            setTimeout(() => this.byeLog2(), 18000)
        },
        byeLog2() {
            this.showSheet = !this.showSheet
            this.dialogEnd = true
        },
        noBlock() {
            var element = document.getElementById('noBlock')
            element.classList.remove('v-overlay--active')
        },
        updateInfo(attack) {
            var vm = this
            vm.attack = attack
            vm.target = attack.target
            vm.targetID = attack.targetID
            vm.scriptRender = attack.script.scriptRender
        },
        updatePhishingInfo(attack) {
            var vm = this
            vm.attack = attack
            vm.target = attack.target
            vm.targetID = attack.targetID
        },
        close() {
            var vm = this
            vm.dialogue = false
        },
        save() {
            this.close()
        },
        showDialogue() {
        }

    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div.v-overlay--active {
    /* touch-action: auto !important; */
    pointer-events: none !important;
}

.v-text-field__details {
    display: none !important;
}

/* div.v-input__slot {
  height: 56px !important;
} */

.testHeight div div {
    height: 56px !important;
}

.form-control {
    -webkit-appearance: menulist !important;
    border-style: solid !important;
    background-color: red !important;
}

h1,
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
    color: #2c3e50;
}

.input-field input[type='text']:focus+label {
    color: #000;
}

.input-field input[type='text']:focus {
    border-bottom: 1px solid #000;
    box-shadow: 0 1px 0 0 #000;
}

.prefix.active {
    color: #b71c1c;
}

span.badge {
    margin-left: 4px;
}
</style>
