<template>
<v-container fluid>
    <v-layout row wrap>
        <v-flex xs4>

            <h1>{{engagement.companyName}} Engagement</h1>

            <div>

                <v-chip color="blue" text-color="white" v-if="testType.cbVishing">
                    <v-avatar class="blue darken-4">
                        <v-icon dark>phone</v-icon>
                    </v-avatar>
                    Vishing
                </v-chip>
                <v-chip color="indigo" text-color="white" v-if="testType.cbPhishing">
                    <v-avatar class="indigo darken-4">
                        <v-icon dark>mail</v-icon>
                    </v-avatar>
                    Phishing
                </v-chip>
                <v-chip color="red" text-color="white" v-if="testType.cbPhysical">
                    <v-avatar class="red darken-4">
                        <v-icon dark>lock</v-icon>
                    </v-avatar>
                    Physical
                </v-chip>

            </div>

            <h3>{{engagement.pSD}} - {{engagement.pED}}</h3>
        </v-flex>

        <template v-if="engagement.status==='targetSelection'">
            <v-flex xs5>
                <vue-dropzone v-on:vdropzone-file-added="upTest" id="drop1" :options="dropOptions"></vue-dropzone>
            </v-flex>
        </template>
        <v-spacer></v-spacer>
        <v-flex xs3 align-center justify-center layout text-xs-center>
            <v-avatar :tile="tile" :size="150" color="grey lighten-4">
                <img :src="engagement.imgUrl" alt="avatar">
            </v-avatar>
        </v-flex>
    </v-layout>

    <br>
    <template v-if="engagement.status==='targetSelection'">

        <v-layout row>

        </v-layout>
        <v-layout row>
            <v-flex xs12>
                <h3>Targets Selected for this Engagement:</h3><br>
                <v-data-table :headers="headers" :items="targets" :search="search" hide-actions v-model="selected" item-key="name" select-all class="elevation-10">
                    <template slot="headerCell" slot-scope="props">
                        <v-tooltip bottom>
                            <span slot="activator">
          {{ props.header.text }}
        </span>
                            <span>
          {{ props.header.text }}
        </span>
                        </v-tooltip>
                    </template>
                    <template slot="items" slot-scope="props">
                        <td>
                            <v-checkbox color="blue darken-1" v-model="props.selected" primary hide-details></v-checkbox>
                        </td>
                        <td>{{ props.item.name }}</td>
                        <td>{{ props.item.email }}</td>
                        <td>{{ props.item.phone }}</td>
                        <td>
                            <v-checkbox color="blue darken-1" v-model="props.item.tPhishing" primary hide-details></v-checkbox>
                        </td>
                        <td>
                            <v-checkbox color="blue darken-1" v-model="props.item.tVishing" primary hide-details></v-checkbox>
                        </td>
                    </template>
                    <template slot="no-data">
                        <v-alert :value="true" color="green darken-2" icon="warning">
                            This is your first engagement with {{engagement.companyName}}. Import some targets above to get started!
                        </v-alert>
                    </template>
                    <template slot="footer">
                        <td colspan="100%">
                            <center><strong>Once you've finalized your targets and chosen their test types, click the <span style="color:green;">SAVE</span> below to begin OSINT.</strong></center>
                        </td>
                    </template>
                </v-data-table>
            </v-flex>
        </v-layout>
        <br>
        <v-layout row>
            <v-flex xs12>

                <v-btn block large @click="testSelected" color="success">Save</v-btn>
            </v-flex>
        </v-layout>
    </template>

    <template v-if="(engagement.status==='osintStaging'||engagement.status === 'launch')">
        <v-layout row>
            <v-flex xs12 sm12 md12>

                <v-data-table :headers="stagingHeaders" :items="selectedTargets" :loading="loading" hide-actions class="elevation-10">

                    <template slot="headerCell" slot-scope="props">
                        <v-tooltip bottom>
                            <span slot="activator">
          {{ props.header.text }}
        </span>
                            <span>
          {{ props.header.text }}
        </span>
                        </v-tooltip>
                    </template>
                    <template slot="items" slot-scope="props">

                        <td style="cursor:pointer" @click="toDossier(props.item['.key'])">
                            <v-avatar v-if="props.item.image != null">
                                <img style="padding:4px" :src="props.item.image">
                            </v-avatar>
                            {{ props.item.name }}
                        </td>
                        <td>{{ props.item.email }}</td>
                        <td>{{ props.item.phone }}

                        </td>

                        <template v-if="!props.item.phishing">
                            <td><i>n/a</i>
                            </td>
                        </template>
                        <template v-else-if="!props.item.phishGuessID">
                            <td>
                                <v-progress-circular v-if="props.item.errorStatus != null" :value="40" color="red"></v-progress-circular>
                                <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
                            </td>
                        </template>
                        <template v-else>
                            <td v-if="props.item.phishGuessType === 'Money'" style="cursor:pointer;color:#43a047" @click="toAttack(props.item.phishingAttackLink)">
                                <b> {{props.item.phishGuessName}}</b>
                            </td>
                            <td v-else-if="props.item.phishGuessType === 'Flashy'" style="cursor:pointer;color:#cc0000" @click="toAttack(props.item.phishingAttackLink)">
                                <b> {{props.item.phishGuessName}}</b>
                            </td>
                            <td v-else style="cursor:pointer;color:#2196f3" @click="toAttack(props.item.phishingAttackLink)">
                                <b> {{props.item.phishGuessName}}</b>
                            </td>
                        </template>

                        <template v-if="!props.item.vishing">
                            <td><i>n/a</i>
                            </td>
                        </template>
                        <template v-else-if="!props.item.vishGuessID">
                            <td>
                                <v-progress-circular v-if="props.item.errorStatus != null" :value="70" color="red"></v-progress-circular>
                                <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
                            </td>
                        </template>
                        <template v-else>

                            <td v-if="props.item.phishGuessType === 'Money'" style="cursor:pointer;color:#43a047" @click="toAttack(props.item.vishingAttackLink)">
                                <b> {{props.item.vishGuessName}}</b>
                            </td>
                            <td v-else-if="props.item.phishGuessType === 'Flashy'" style="cursor:pointer;color:#cc0000" @click="toAttack(props.item.vishingAttackLink)">
                                <b> {{props.item.vishGuessName}}</b>
                            </td>
                            <td v-else style="cursor:pointer;color:#2196f3" @click="toAttack(props.item.vishingAttackLink)">
                                <b> {{props.item.vishGuessName}}</b>
                            </td>
                        </template>
                        <td>

                            <v-chip id="errorChip" @click.stop="openDialog" v-if="props.item.errorStatus != null" color="red" text-color="white">
                                <v-avatar>
                                    <v-icon>error_outline</v-icon>
                                </v-avatar>
                                {{props.item.errorStatus}}

                            </v-chip>

                            <v-chip v-if="props.item.phishingStatus ==='Creds Captured'" color="red darken-1" text-color="white">
                                <v-avatar>
                                    <v-icon>mail_outline</v-icon>
                                </v-avatar>
                                {{props.item.phishingStatus}}

                            </v-chip>

                            <v-chip v-else-if="props.item.phishingStatus != null" color="blue" text-color="white">
                                <v-avatar>
                                    <v-icon>mail_outline</v-icon>
                                </v-avatar>
                                {{props.item.phishingStatus}}

                            </v-chip>
                            <v-chip v-if="props.item.vishingStatus ==='Call Unsuccessful'" color="green darken-1" text-color="white">
                                <v-avatar>
                                    <v-icon>phone</v-icon>
                                </v-avatar>
                                {{props.item.vishingStatus}}

                            </v-chip>
                            <v-chip v-else-if="props.item.vishingStatus != null" color="purple" text-color="white">
                                <v-avatar>
                                    <v-icon>phone</v-icon>
                                </v-avatar>
                                {{props.item.vishingStatus}}

                            </v-chip>
                            <v-chip v-if="props.item.mainStatus != null" color="orange" text-color="white">
                                <v-avatar>
                                    <v-icon>fingerprint</v-icon>
                                </v-avatar>
                                {{props.item.mainStatus}}
                            </v-chip>
                        </td>
                    </template>
                    <template slot="footer">
                        <td v-if="engagement.status === 'launch'" colspan="100%">
                            <center><strong><span style="color:red;">ENGAGEMENT IN PROGRESS</span></strong></center>
                        </td>
                        <td v-if="engagement.status === 'osintStaging'" colspan="100%">
                            <center><strong>When you're ready to start the engagement, <span style="color:green;">LAUNCH</span> below.</strong></center>
                        </td>
                    </template>
                </v-data-table>

            </v-flex>
        </v-layout>
        <br>
        <v-layout row>
            <v-flex xs12>

                <v-btn v-if="engagement.status != 'launch'" @click="startQueue" large block color="success">Launch</v-btn>
            </v-flex>
        </v-layout>
    </template>
    <v-snackbar v-model="snackbar" :bottom="false" :left="false" :multi-line="true" :right="true" :timeout="30000" :top="true" :vertical="mode === 'vertical'">{{alert.target.name}} just opened your email. <br>Would you like to vish him (or her) now?
        <v-btn color="green darken-2" dark @click="toVishingAttack">
            Yes
        </v-btn><br>
        <v-btn color="red darken-2" dark @click="snackbar = false">
            No
        </v-btn>
        <br>

    </v-snackbar>
</v-container>
</template>

<script>
const fb = require('../db/index.js')
const db = fb.db
const storageRef = fb.storage
import Papa from 'papaparse'
import {
    VueCsvImport
} from 'vue-csv-import'
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
const delay = require('delay')
export default {
    name: 'SingleEngagement',
    firestore() {
        return {
            selectedTargets: db
                .collection('engagements')
                .doc(this.$route.params.engagementID)
                .collection('targets'),

            targetInfo: db.collection('targets'),

            engagement: db
                .collection('engagements')
                .doc(this.$route.params.engagementID)
        }
    },
    data() {
        return {
            dialog: false,
            alert: {
                target: {
                    name: ''
                }
            },
            snackbar: false,
            toasterLink: '',
            dropOptions: {
                previewTemplate: this.template(),
                url: '#',
                dictDefaultMessage: "<i style='font-size:20pt;' class='fa fa-cloud-upload'></i><br>Drag in a CSV to import targets."
            },
            csvValue: null,
            loading: false,
            targetInfo: [],
            engagement: {},
            testType: {
                cbPhishing: false,
                cbVishing: false,
                cbPhysical: false
            },
            items: [],
            projects: [],
            script: {},
            scriptTags: {},
            scriptID: '',
            search: '',
            selectedTargets: [],
            selected: [],
            stagingHeaders: [{
                    text: 'Name',
                    align: 'left',
                    value: 'name'
                },
                {
                    text: 'Email',
                    value: 'email'
                },
                {
                    text: 'Phone',
                    value: 'phone'
                },
                {
                    text: 'Phishing Template',
                    align: 'left',
                    value: 'phishing'
                },
                {
                    text: 'Vishing Template',
                    value: 'vishing'
                },
                {
                    text: 'Last Update',
                    value: 'targetStatus'
                }
            ],
            stagingTargets: [],
            headers: [{
                    text: 'Name',
                    align: 'left',
                    value: 'name'
                },
                {
                    text: 'Email',
                    value: 'email'
                },
                {
                    text: 'Phone',
                    value: 'phone'
                },
                {
                    text: 'Phishing?',
                    value: 'tPhishing'
                },
                {
                    text: 'Vishing?',
                    value: 'tVishing'
                }
            ],
            targets: [],

            testScript: '',
            targetName: 'John Doe'
        }
    },
    components: {
        VueCsvImport,
        vueDropzone: vue2Dropzone
    },
    beforeCreate() {

        this.engagementID = this.$route.params.engagementID

        db
            .collection('engagements')
            .doc(this.engagementID)
            .get()
            .then(doc1 => {
                var tempObject = Object(doc1.data())
                tempObject.id = doc1.id

                var options = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }
                tempObject.pSD = new Date(
                    tempObject.startDate.seconds * 1000
                ).toLocaleDateString('en-US', options)
                tempObject.pED = new Date(
                    tempObject.endDate.seconds * 1000
                ).toLocaleDateString('en-US', options)

                db
                    .collection('companies')
                    .doc(doc1.data().company)
                    .get()
                    .then(querySnapshot => {
                        tempObject.companyName = querySnapshot.data().clientName
                        this.testType = tempObject.testType

                        if (querySnapshot.data().domainName) {
                            tempObject.imgUrl = `//logo.clearbit.com/${querySnapshot.data().domainName}`
                        }

                        this.engagement = tempObject
                        this.updateTargets(this.engagement.company, this.engagement.status)

                    })
            })

    },
    created() {

    },
    computed: {

    },
    watch: {
        selected(val) {

            var stillSelected = []
            val.forEach(selectedTarget => {
                stillSelected.push(selectedTarget.email)
            })
            this.targets.forEach(target => {
                if (!stillSelected.includes(target.email)) {
                    target.tPhishing = false
                    target.tVishing = false
                } else if (stillSelected.includes(target.email)) {
                    target.tPhishing = true
                    target.tVishing = true
                }
            })
        },
        engagement(val) {
            var tempObject = Object(val)
            var options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }
            tempObject.pSD = new Date(
                tempObject.startDate.seconds * 1000
            ).toLocaleDateString('en-US', options)
            tempObject.pED = new Date(
                tempObject.endDate.seconds * 1000
            ).toLocaleDateString('en-US', options)
        },

        dialog(val) {
            val || this.close()
        },

        targetInfo: function (val) {

            val.forEach(targetAll => {
                var targetKey = targetAll['.key']
                this.selectedTargets.forEach(targetHere => {
                    var thisTargetKey = targetHere['.key']
                    if (targetKey === thisTargetKey) {
                        var newStatus = targetAll.mainStatus
                        if (targetAll.errorStatus != null) {
                            this.$firestore.selectedTargets.doc(targetKey).set({
                                errorStatus: targetAll.errorStatus
                            }, {
                                merge: true
                            })
                        } else if (targetAll.vishingStatus != null) {
                            this.$firestore.selectedTargets.doc(targetKey).set({
                                vishingStatus: targetAll.vishingStatus
                            }, {
                                merge: true
                            })
                        } else if (targetAll.phishingStatus != null) {
                            this.$firestore.selectedTargets.doc(targetKey).set({
                                phishingStatus: targetAll.phishingStatus
                            }, {
                                merge: true
                            })
                        } else {
                            this.$firestore.selectedTargets.doc(targetKey).set({
                                errorStatus: null
                            }, {
                                merge: true
                            })
                        }

                        if (targetAll.image != null) {
                            this.$firestore.selectedTargets.doc(targetKey).set({
                                image: targetAll.image
                            }, {
                                merge: true
                            })
                        }

                        this.$firestore.selectedTargets.doc(targetKey).set({
                            mainStatus: newStatus
                        }, {
                            merge: true
                        })
                        if (targetAll.phishGuessID != null) {
                            this.$firestore.selectedTargets.doc(targetKey).set({
                                phishGuessID: targetAll.phishGuessID,
                                vishGuessID: targetAll.vishGuessID,
                                phishGuessName: targetAll.phishGuessName,
                                vishGuessName: targetAll.vishGuessName
                            }, {
                                merge: true
                            })
                        }

                    }
                })
            })
        }
    },
    methods: {

        toVishingAttack() {
            this.snackbar = false
            var vm = this

            vm.selectedTargets.forEach(target => {

            })

        },
        toAttack(attackID) {
            var vm = this
            vm.$router.push({
                name: 'SingleAttack',
                params: {
                    attackID: attackID
                }
            })
        },
        toDossier(target) {
            var vm = this
            vm.$router.push({
                name: 'Dossier',
                params: {
                    targetID: target
                }
            })
        },
        close() {
            var vm = this
            vm.dialog = false
        },
        save() {
            this.close()
        },
        openDialog() {
            this.dialog = true
        },
        closeDialog() {
            var vm = this
            vm.dialog = false
            vm.selectedTargets.forEach(target => {
                if (target.errorStatus === 'Action Required') {
                    db
                        .collection('targets')
                        .doc(target['.key'])
                        .set({
                            errorStatus: null,
                            mainStatus: 'Resuming OSINT'
                        }, {
                            merge: true
                        })
                }
            })
        },
        updateTargets(company, status) {
            var vm = this
            if (status === 'targetSelection') {

                var targetQuery = db
                    .collection('targets')
                    .where('company', '==', company)
                    .get()
                    .then(function (querySnapshot) {
                        querySnapshot.forEach(function (doc) {
                            var tempTarget = doc.data()
                            var additions = {
                                value: false,
                                tPhishing: true,
                                tVishing: true,
                                tID: doc.id
                            }
                            var mergeObject = Object.assign(additions, tempTarget)
                            vm.targets.push(mergeObject)
                            vm.selected.push(mergeObject)
                        })
                    })
                    .catch(function (error) {
                        console.log('Error getting documents: ', error)
                    })
            } else if (status === 'osintStaging') {

                var stagingQuery = db
                    .collection('engagements')
                    .doc(vm.engagementID)
                    .collection('targets')
                    .get()
                    .then(function (querySnapshot) {
                        querySnapshot.forEach(function (doc) {
                            var tempTarget = doc.data()
                            var additions = {
                                value: false,
                                tID: doc.id
                            }
                            var mergeObject = Object.assign(additions, tempTarget)
                            vm.stagingTargets.push(mergeObject)
                            //vm.selected.push(mergeObject);
                        })
                        vm.loading = false
                    })
            }
        },
        deleteScript() {
            db
                .collection('engagements')
                .doc(this.engagementID)
                .delete()
                .then(function () {
                    console.log('Document successfully deleted!')
                })
                .catch(function (error) {
                    console.error('Error removing document: ', error)
                })
        },
        saveTargets() {
            this.csvValue.forEach(target => {
                this.target.newTarget = true
                var targetObject = target
                targetObject.company = this.engagement.company

                targetObject.status = 'osint'

                var ref = db
                    .collection('targets')
                    .add(targetObject)
                    .then(function (docRef) {

                    })
            })
        },
        startQueue() {

            this.$firestore.engagement.set({
                status: 'launch',
                timeStat: 'In Progress'
            }, {
                merge: true
            });
        },
        testSelected() {
            this.selected.forEach(target => {
                if (target.newTarget) {
                    var tObject = {
                        phishing: target.tPhishing,
                        vishing: target.tVishing,
                        newTarget: true,
                        name: target.name,
                        email: target.email,
                        phone: target.phone,
                        mainStatus: 'Starting OSINT'
                    }
                    var ref = db
                        .collection('engagements')
                        .doc(this.engagementID)
                        .collection('targets')
                        .doc(target.tID)
                        .set(tObject, {
                            merge: true
                        })
                        .then(function (docRef) {})
                } else {
                    var tObject = {
                        phishing: target.tPhishing,
                        vishing: target.tVishing,
                        name: target.name,
                        newTarget: false,
                        email: target.email,
                        phone: target.phone,
                        mainStatus: 'Restarting OSINT'
                    }
                    var ref = db
                        .collection('engagements')
                        .doc(this.engagementID)
                        .collection('targets')
                        .doc(target.tID)
                        .set(tObject, {
                            merge: true
                        })
                        .then(function (docRef) {
                            var targetRef = db
                                .collection('targets')
                                .doc(target.tID)
                                .set({
                                    mainStatus: 'Restarting OSINT'
                                }, {
                                    merge: true
                                })
                        })
                }

            })
            var vm = this
            vm.engagement.status = 'osintStaging'
            var engRef = db.collection('engagements').doc(this.engagementID)

            var setWithMerge = engRef.set({
                status: 'osintStaging'
            }, {
                merge: true
            })
        },
        //this is the dropzone styling
        template: function () {
            return `<div class="dz-preview dz-file-preview" style="width:200px;box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12) !important;">
                <div class="dz-image">
                    <div data-dz-thumbnail-bg></div>
                </div>
                <div class="dz-details" style="border-radius:2px!important;background-color:#2196f3!important;">
                    <div class="dz-size"><span data-dz-size></span></div>
                    <div class="dz-filename"><span data-dz-name></span></div>
                </div>
                <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
                <div class="dz-error-message" style="display:none;"><span data-dz-errormessage></span></div>
                <div class="dz-success-mark"><i class="fa fa-check"></i></div>
                <div class="dz-error-mark" style="left:45%!important;top:26%!important;"><i style="color:white;" class="fa fa-check"></i></div>
            </div>
        `
        },
        //end dz styling
        upTest(file) {
            var vm = this

            Papa.parse(file, {
                complete: function (results) {

                    var draggedTargets = results.data
                    draggedTargets.forEach
                    draggedTargets.forEach(target => {
                        if (target.length == 1 || target[2] === '') {
                            console.log('empty cell')
                        } else if (target[2] == 'Email') {
                            console.log('header row')
                        } else {
                            console.log('data:' + target)
                            var fbObject = {
                                company: vm.engagement.company,
                                companyName: vm.engagement.companyName,
                                addedOnEngagementID: vm.engagementID,
                                name: `${target[0]} ${target[1]}`,
                                email: target[2],
                                phone: target[3],
                                status: 'osint'
                            }
                            //this does not account for duplicates yet, we will have to fix that by checking for matching email or phone number.
                            var addTargetToFB = db
                                .collection('targets')
                                .add(fbObject)
                                .then(function (docRef) {
                                    console.log('Target Uploaded: => ', docRef.id)
                                    var tempObject = {
                                        value: false,
                                        tID: docRef.id,
                                        name: `${target[0]} ${target[1]}`,
                                        email: target[2],
                                        phone: target[3],
                                        tPhishing: true,
                                        tVishing: true,
                                        newTarget: true
                                    }
                                    vm.targets.push(tempObject)
                                    vm.selected.push(tempObject)
                                })
                        }
                    })

                }
            })
            var storage = storageRef.ref()
            var targetsRef = storage.child(
                `targetUploads/${this.engagement.company}/${+new Date() +
          '-' +
          file.name}`
            )
            targetsRef
                .put(file)
                .then(snapshot => snapshot.ref.getDownloadURL())
                .then(url => {
                    var tempObject = {}
                    tempObject.url = url
                    var ref = db
                        .collection('companies')
                        .doc(this.engagement.company)
                        .collection('targetUploads')
                        .add(tempObject)
                        .then(function (docRef) {

                        })
                })
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import url('https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
span#errorChip span {
    cursor: pointer !important;
}

.dz-error-mark {
    display: none;
}

.dz-details {
    border-radius: 2px;
}

.dz-preview {
    box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12) !important;
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

.dz-error-mark {
    display: none;
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

.dz-details {
    border-radius: 3px;
    background-color: #2196f3;
}

.accent--text {
    color: #2196f3 !important;
}
</style>
