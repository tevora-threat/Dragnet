<template>
<v-container fill-height fluid grid-list-md>
    <v-layout row wrap>
        <v-flex d-flex xs12 sm6 md8>
            <v-layout column wrap>
                <v-flex v-if="attack.type === 'vishing'" md8 d-flex>
                    <v-card>
                        <v-container>
                            <h2>{{attack.template.title}} Script</h2><br>
                            <pre style="font-size:16pt;">{{scriptRender}}</pre>
                        </v-container>
                    </v-card>
                </v-flex>
                <v-flex v-if="attack.type === 'phishing'" md1 d-flex>

                    <v-card v-if="attack.status === 'ready'">
                        <v-toolbar color="blue darken-2" dark>
                            <v-toolbar-title>STATUS: <b>READY TO SEND</b></v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-toolbar-title>
                                <v-btn style="margin-bottom:0;margin-top:0;" v-if="attack.status === 'ready'" block large class="blue--text" color="white darken-2" @click.stop="sendEmail">
                                    SEND EMAIL
                                </v-btn>

                            </v-toolbar-title>

                        </v-toolbar>

                    </v-card>
                    <v-card v-if="attack.status === 'sendEmail'">
                        <v-toolbar color="blue darken-2" dark>
                            <v-toolbar-title>STATUS: <b>SENDING EMAIL</b></v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-toolbar-title>

                                <v-btn style="margin-bottom:0;margin-top:0;" v-if="attack.status === 'sendEmail'" block :loading="true" large class="blue--text" color="white darken-2">
                                    SENDING
                                </v-btn>
                            </v-toolbar-title>

                        </v-toolbar>

                    </v-card>
                    <v-card v-if="attack.status === 'scheduled'">
                        <v-toolbar color="orange darken-2" dark>
                            <v-toolbar-title>STATUS: <b>SCHEDULED</b></v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-toolbar-title>SENDING: <b>{{new Date(attack.strictTime.seconds*1000).toLocaleDateString()}} - {{new Date(attack.strictTime.seconds*1000).toLocaleTimeString()}}</b></v-toolbar-title>

                        </v-toolbar>

                    </v-card>
                    <v-card v-else-if="attack.status === 'sent'">
                        <v-toolbar color="blue darken-2" dark>
                            <v-toolbar-title>STATUS: <b>SENT</b></v-toolbar-title>
                            <v-spacer></v-spacer>

                        </v-toolbar>

                    </v-card>
                    <v-card v-else-if="attack.status === 'opened'">
                        <v-toolbar color="red darken-4" dark>
                            <v-toolbar-title>STATUS: <b>OPENED EMAIL</b></v-toolbar-title>
                            <v-spacer></v-spacer>

                        </v-toolbar>

                    </v-card>
                    <v-card v-else-if="attack.status === 'lpOpened'">
                        <v-toolbar color="red darken-2" dark>
                            <v-toolbar-title>STATUS: <b>OPENED LANDING PAGE</b></v-toolbar-title>
                            <v-spacer></v-spacer>

                        </v-toolbar>

                    </v-card>
                    <v-card v-else-if="attack.status === 'creds'">
                        <v-toolbar color="red darken-2" dark>
                            <v-toolbar-title>STATUS: <b>CREDS CAPTURED</b></v-toolbar-title>
                            <v-spacer></v-spacer>

                        </v-toolbar>

                    </v-card>

                </v-flex>
                <v-flex v-if="attack.type === 'phishing'" md8 d-flex>

                    <v-card>
                        <v-container>
                            <v-layout row wrap>
                                <v-flex xs6 m6>
                                    <h3>Subject Line:</h3>
                                    <v-text-field :value="attack.template.subjectLine" outline single-line readonly></v-text-field>
                                </v-flex>
                                <v-flex v-if="attack.status === 'creds'" xs6 m6>
                                    <h3>Credentials Captured:</h3>
                                    <v-text-field v-model="last" style="font-family:monospace;" class="v-input--is-focused testHeight credsText" :label="`${attack.credsEmail}:${attack.credsPW}`" solo-inverted readonly></v-text-field>

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
                                            <v-btn style="margin-bottom:0;margin-top:0;" v-if="attack.status === 'ready'" block large class="white--text" color="red darken-2" @click.stop="placeCall">
                                                Place Call
                                            </v-btn>
                                            <v-btn v-else-if="attack.status === 'vuln' || attack.status === 'safe'" :disabled="!attack.recordingLocation" :loading="!attack.recordingLocation" block large style="margin-bottom:0;margin-top:0;" class="white--text" color="purple darken-2" @click.stop="playRec">
                                                Play Call
                                            </v-btn>
                                            <v-dialog v-if="attack.status === 'callAttacker'" v-model="dialog" hide-overlay persistent width="300">
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
                                                            <v-list-tile-sub-title>{{recordingDate}} | {{recordingTime}}</v-list-tile-sub-title>
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
                                        <v-bottom-sheet inset v-model="showSheet" :position-x="x" :position-y="y" absolute offset-y persistent id="noBlock">

                                            <v-card tile>
                                                <v-progress-linear :value="100" color="red" class="my-0" height="3"></v-progress-linear>

                                                <v-list>
                                                    <v-list-tile>
                                                        <v-list-tile-content>
                                                            <v-list-tile-title>Calling {{target.name}}</v-list-tile-title>
                                                            <v-list-tile-sub-title v-if="attack.canRecord">Calling {{target.number}} | Recording</v-list-tile-sub-title>
                                                            <v-list-tile-sub-title v-else>Calling {{target.number}} | <b>Not</b> Recording</v-list-tile-sub-title>

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

                                        <v-textarea name="input-7-1" v-model="attackNotes" box height="115px" label="Call Notes" auto-grow value=""></v-textarea>
                                        <div class="text-xs-center">
                                            <v-btn style="margin-bottom:0;margin-top:0;" v-if="attack.notes != attackNotes" block large class="white--text" color="blue darken-2" @click.stop="saveNotes">
                                                Save Notes
                                            </v-btn>
                                        </div>
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

                                        <v-textarea v-if="attack.notes != attackNotes" name="input-7-1" v-model="attackNotes" height="80px" box label="Phishing Attack Notes" auto-grow value=""></v-textarea>
                                        <v-textarea v-else-if="attack.notes === attackNotes" name="input-7-1" v-model="attackNotes" height="135px" box label="Phishing Attack Notes" auto-grow value=""></v-textarea>

                                        <div class="text-xs-center">
                                            <v-btn style="margin-bottom:0;margin-top:0;" v-if="attack.notes != attackNotes" block large class="white--text" color="blue darken-2" @click.stop="saveNotes">
                                                Save Notes
                                            </v-btn>
                                        </div>
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
                                <v-subheader>Contact Information</v-subheader>
                                <v-list v-if="target.phone" two-line>
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
                                </v-list>
                                <v-list v-if="target.email" two-line>
                                    <v-list-tile>
                                        <v-list-tile-action>
                                            <v-icon color="blue darken-4">email</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{target.email}}</v-list-tile-title>
                                            <v-list-tile-sub-title>Work Email</v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-icon>check</v-icon>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-divider inset></v-divider>
                                </v-list>
                                <v-list v-if="target.twitter" two-line>
                                    <v-list-tile>
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
                                    <v-divider inset></v-divider>
                                </v-list>
                                <v-list v-if="target.linkedInURL" two-line>
                                    <v-list-tile>
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
                                </v-list>

                                <v-subheader>
                                    Work Experience
                                </v-subheader>
                                <v-list v-for="job in currentJobs" avatar :key="job['position']" two-line>

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
                                    <v-divider :key="job['position']" inset></v-divider>
                                </v-list>
                                <v-list v-for="job in jobs" avatar :key="job['.key']" two-line>

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
                                    <v-divider v-if="jobs.indexOf(job)+1 == jobs.length"></v-divider>
                                    <v-divider v-else :key="job['position']" inset></v-divider>
                                </v-list>
                                <v-subheader>
                                    Education
                                </v-subheader>
                                <v-list v-for="edu in edus" :key="edu['schoolName']" two-line>

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
                                    <v-divider v-if="edus.indexOf(edu)+1 == edus.length"></v-divider>
                                    <v-divider v-else :key="edu['schoolName']" inset></v-divider>

                                </v-list>

                                <v-list two-line>
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
                                    <v-divider v-if="target.dob != null" inset></v-divider>
                                    <v-list-tile v-if="target.location != null">
                                        <v-list-tile-action>
                                            <v-icon color="blue darken-1">location_on</v-icon>
                                        </v-list-tile-action>
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{target.location}}</v-list-tile-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-icon color="gray lighten-2">fingerprint</v-icon>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                    <v-list-tile v-if="target.gender != null">
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

                        <v-container id="scroll-target" style="padding:0;padding-top:4px;padding-left:0;padding-right:16px;max-height: 260px" class="scroll-y">
                            <v-layout v-scroll:#scroll-target="onScroll" column style="height:60%;">
                                <v-list v-for="log in logs" :key="log['.key']" two-line>
                                    <template>
                                        <v-list-tile v-if="log.type === 'call' && log.status === 'callEnded'">
                                            <v-list-tile-action>
                                                <v-icon color="blue darken-2">fa-phone-slash</v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title>Call Ended</v-list-tile-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-list-tile v-if="log.type === 'call' && log.status === 'callingTarget'">
                                            <v-list-tile-action>
                                                <v-icon color="blue darken-2">fa-phone</v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title>Call Placed</v-list-tile-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-list-tile v-if="log.type === 'callResult' && log.result === 'vm'">
                                            <v-list-tile-action>
                                                <v-icon color="blue darken-2">fa-microphone-alt-slash</v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title>Got Voicemail</v-list-tile-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-list-tile v-if="log.type === 'callResult' && log.result === 'safe'">
                                            <v-list-tile-action>
                                                <v-icon color="green darken-2">fa-thumbs-up</v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title>Target Not Vuln</v-list-tile-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-list-tile v-if="log.type === 'callResult' && log.result === 'vuln'">
                                            <v-list-tile-action>
                                                <v-icon color="red darken-2">fa-exclamation-triangle</v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title>Target Vuln</v-list-tile-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-list-tile v-if="log.type === 'creds'">
                                            <v-list-tile-action>
                                                <v-icon color="red darken-2">fa-keyboard</v-icon>
                                            </v-list-tile-action>
                                            <v-list-tile-content>
                                                <v-list-tile-title>Creds Entered</v-list-tile-title>
                                                <v-list-tile-sub-title><kbd class="credsColor">{{log.credsEmail}}:{{log.credsPW}}</kbd></v-list-tile-sub-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-list-tile-action-text>{{log.date}}<br>{{log.time}}</v-list-tile-action-text>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-list-tile v-if="log.type === 'lpOpened'">
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
                </v-flex>

            </v-layout>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
var audioElement = document.createElement("audio");
audioElement.setAttribute("preload", "none");
const fb = require("../db/index.js");
const db = fb.db;
const storageRef = fb.storage;

export default {
    name: "SingleAttack",

    firestore() {
        return {
            attack: db.collection("attacks").doc(this.$route.params.attackID),
            logs: db
                .collection("logs")
                .where("attackID", "==", this.$route.params.attackID)
                .orderBy("dateAdded", "desc")
        };
    },
    data() {
        return {
            recording: {},
            updateLog: false,
            creds: false,
            jobs: [],
            logs: [],
            currentJobs: [],
            edus: [],
            x: 0,
            scrubber: 0,
            audioRecordingUrl: "",
            recordingDate: null,
            recordingTime: null,
            paused: false,
            showSheet: false,
            showRecSheet: false,
            dialogEnd: false,
            y: 0,
            target: {},
            attack: {},
            lorem: "testing",
            dialog: true,
            engagement: {},
            testType: {
                cbPhishing: false,
                cbVishing: false,
                cbPhysical: false
            },
            script: {},
            scriptRender: "Testing 123",
            scriptTags: {},
            attackID: "",
            attackNotes: "",
            scriptID: "",
            search: "",
            testScript: "",
            targetName: "",
            targetID: ""
        };
    },
    beforeCreate() {
        this.attackID = this.$route.params.attackID;

        db
            .collection("attacks")
            .doc(this.attackID)
            .get()
            .then(doc1 => {
                var tempObject = Object(doc1.data());
                tempObject.id = doc1.id;

                if (tempObject.type === "vishing") {
                    if (tempObject.script != null) {
                        var newLineString = tempObject.script.scriptRaw.replace(
                            "\\n",
                            "\n"
                        );

                        tempObject.script.scriptRender = newLineString;
                    }

                    tempObject.target.ageNum = this.getAge(tempObject.target.dob);
                    this.updateInfo(tempObject);
                } else {
                    db
                        .collection("emailTemplates")
                        .doc(tempObject.templateID)
                        .get()
                        .then(doc1 => {
                            tempObject.template = doc1.data();
                            tempObject.target.ageNum = this.getAge(tempObject.target.dob);
                            this.updatePhishingInfo(tempObject);
                        });
                }

                var storage = storageRef.ref();

                tempObject.target.edus.forEach(edu => {
                    console.log(edu);

                    if (edu.imgUrl) {
                        var imgParts = edu.imgUrl.split("/");
                        var fixedImg = `${imgParts[0]}/${imgParts[1]}/fixed_${imgParts[2]}`;
                        var eduRef = storage.child(fixedImg);
                        eduRef.getDownloadURL().then(url => {
                            edu.tempImgUrl = url;
                        });
                    }

                    this.edus.push(edu);
                });

                var sortedJobs = [];

                tempObject.target.jobs.forEach(job => {
                    if (job.imgUrl) {
                        var imgParts = job.imgUrl.split("/");
                        var fixedImg = `${imgParts[0]}/${imgParts[1]}/fixed_${imgParts[2]}`;
                        var jobRef = storage.child(fixedImg);
                        jobRef.getDownloadURL().then(url => {
                            job.tempImgUrl = url;
                            console.log(url);
                        });
                    }

                    if (job.isPresent) {
                        this.currentJobs.push(job);
                    } else {
                        sortedJobs.push(job);
                    }

                    console.log(job);
                });

                sortedJobs.sort(function (a, b) {
                    return b.sortEndDate.seconds - a.sortEndDate.seconds;
                });

                this.jobs = sortedJobs;
            });
    },
    created() {},
    computed: {},
    watch: {
        attack(val) {
            var vm = this;
            var storage = storageRef.ref();
            if (val.recordingLocation) {
                var recRef = storage.child(val.recordingLocation);
                recRef.getDownloadURL().then(url => {
                    this.audioRecordingUrl = url;
                    var timeSecs = val.recordingLocation.split("-")[1].split(".")[0];
                    this.recordingDate = new Date(timeSecs * 1000).toLocaleDateString();
                    this.recordingTime = new Date(timeSecs * 1000).toLocaleTimeString();
                });
            }

            if (val.target.image) {
                console.log("has image");
                console.log(val.target.image);

                var imgParts = val.target.image.split("/");
                console.log(imgParts);

                var fixedImg = `${imgParts[0]}/${imgParts[1]}/fixed_${imgParts[2]}`;
                var tImgRef = storage.child(fixedImg);
                tImgRef.getDownloadURL().then(url => {
                    vm.target.image = url;
                });
            }

            if (val.status) {
                switch (val.status) {
                    case "callAttacker":
                        //blue modal
                        break;
                    case "callingTarget":
                        this.byeLog();
                        break;
                    case "waitingResult":
                        this.byeLog2();
                        break;
                    case "safe":
                        break;
                    case "vuln":
                        break;
                    case "vm":
                        break;
                    default:
                        break;
                }
            }
        },

        logs(val) {
            console.log(val);

            val.forEach(log => {
                if (log.ts) {
                    log.date = new Date(log.ts * 1000).toLocaleDateString();
                    log.time = new Date(log.ts * 1000).toLocaleTimeString();
                } else if (log.dateAdded) {
                    log.date = new Date(
                        log.dateAdded.seconds * 1000
                    ).toLocaleDateString();
                    log.time = new Date(
                        log.dateAdded.seconds * 1000
                    ).toLocaleTimeString();
                }
            });
        }
    },
    mounted: {},
    methods: {
        saveNotes() {
            this.$firestore.attack.set({
                notes: this.attackNotes
            }, {
                merge: true
            });
        },
        placeCall() {
            var vm = this;

            this.$firestore.attack.set({
                status: "callAttacker"
            }, {
                merge: true
            });
        },

        sendEmail() {
            var vm = this;

            this.$firestore.attack.set({
                status: "sendEmail"
            }, {
                merge: true
            });
        },

        toDossier(targetID) {
            var vm = this;
            vm.$router.push({
                name: "Dossier",
                params: {
                    targetID: targetID
                }
            });
        },
        endAttack(result) {
            var vm = this;

            var attackID = this.$route.params.attackID;

            vm.recordingDate = Date().toLocaleDateString;
            vm.recordingTime = Date().toLocaleTimeString;

            switch (result) {
                case "vuln":
                    db
                        .collection("attacks")
                        .doc(attackID)
                        .set({
                            status: "vuln"
                        }, {
                            merge: true
                        })
                        .then(function () {
                            vm.attack.status = "vuln";
                        });

                    db
                        .collection("logs")
                        .add({
                            type: "callResult",
                            result: "vuln",
                            dateAdded: new Date(),
                            attackID: attackID
                        })
                        .then(function () {
                            vm.dialogEnd = false;
                        });

                    break;
                case "safe":
                    db
                        .collection("attacks")
                        .doc(attackID)
                        .set({
                            status: "safe"
                        }, {
                            merge: true
                        })
                        .then(function () {
                            vm.attack.status = "safe";
                        });

                    db
                        .collection("logs")
                        .add({
                            type: "callResult",
                            result: "safe",
                            dateAdded: new Date(),
                            attackID: attackID
                        })
                        .then(function () {
                            vm.dialogEnd = false;
                        });

                    break;
                case "vm":
                    db
                        .collection("attacks")
                        .doc(attackID)
                        .set({
                            status: "ready"
                        }, {
                            merge: true
                        })
                        .then(function () {
                            vm.attack.status = "ready";
                        });
                    db
                        .collection("logs")
                        .add({
                            type: "callResult",
                            result: "vm",
                            dateAdded: new Date(),
                            attackID: attackID
                        })
                        .then(function () {
                            vm.dialogEnd = false;
                        });
                    break;

                default:
                    break;
            }
        },
        aBuffer() {
            var vm = this;
            setInterval(function () {
                var cTime = audioElement.currentTime / audioElement.duration * 100;
                if (cTime != 100) {
                    vm.scrubber = cTime;
                } else {
                    vm.scrubber = 0;
                    vm.paused = true;
                }
            }, 100);
        },
        playRec() {
            this.showRecSheet = true;
            audioElement.setAttribute("src", this.audioRecordingUrl);
            audioElement.play();
            this.aBuffer();
        },
        rwRec() {
            audioElement.currentTime = 0;
            if (!this.paused) {
                audioElement.play();
            }
        },
        getAge(dateString) {
            var today = new Date();
            var birthDate = new Date(dateString);
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        },

        playPauseRec() {
            if (this.paused) {
                audioElement.play();
            } else {
                audioElement.pause();
            }
            this.paused = !this.paused;
        },
        byeLog() {
            this.dialog = false;
            this.showSheet = true;
        },
        byeLog2() {
            this.showSheet = false;
            this.dialogEnd = true;
        },
        noBlock() {
            var element = document.getElementById("noBlock");
            element.classList.remove("v-overlay--active");
        },
        updateInfo(attack) {
            var vm = this;
            vm.attack = attack;
            vm.target = attack.target;
            vm.targetID = attack.targetID;
            vm.attackNotes = attack.notes;
        },
        updatePhishingInfo(attack) {
            var vm = this;
            vm.attack = attack;
            vm.target = attack.target;
            vm.targetID = attack.targetID;
        },
        close() {
            var vm = this;
            vm.dialogue = false;
        },
        save() {
            this.close();
        },
        showDialogue() {}
    }
};
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

.input-field input[type="text"]:focus+label {
    color: #000;
}

.input-field input[type="text"]:focus {
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
