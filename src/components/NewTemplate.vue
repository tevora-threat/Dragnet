<template>
<v-container fluid>
    <h2>New Template</h2>
    <br>
    <v-layout row>
        <v-flex xs12 sm6 offset-sm3>
            <v-card>
                <v-container>
                    <h3>Template:</h3><br>
                    <v-flex xs6>
                        <v-combobox v-model="selectedCategory" item-text="nickname" item-value="id" :items="categories" return-object label="Category" hint="You can also create a new category"></v-combobox>
                    </v-flex>

                    <v-flex xs6>
                        <v-select :items="servers" item-value="value" v-model="selectedSMTPServer" label="SMTP Server" single-line></v-select>
                    </v-flex>
                    <v-flex xs6>
                        <v-select :items="landingPages" item-value="value" v-model="selectedLandingPage" label="Landing Page" single-line></v-select>
                    </v-flex>

                    <v-flex xs6>
                        <v-checkbox color="blue darken-1" label="Send at a certain time?" v-model="scheduledSend"></v-checkbox>

                    </v-flex>
                    <v-flex xs6 v-if="scheduledSend">
                        <v-container fluid>
                            <h3>Day / Time to Send:</h3>
                            <v-container fluid>

                                <v-flex xs6>
                                    <v-select :items="dows" item-value="value" v-model="selectedDOW" label="Day of Week" single-line></v-select>
                                </v-flex>

                                <v-flex xs12>
                                    <v-menu ref="menu3" :close-on-content-click="false" v-model="menu3" :nudge-right="40" :return-value.sync="time" lazy transition="scale-transition" offset-y full-width min-width="290px">
                                        <v-text-field slot="activator" v-model="computedTimeFormatted" label="Time of Day" prepend-icon="event" readonly></v-text-field>
                                        <v-time-picker v-model="picker" :landscape="false"></v-time-picker>

                                    </v-menu>
                                </v-flex>

                            </v-container>
                        </v-container>

                    </v-flex>

                    <v-flex xs8>
                        <v-text-field id="testing" name="input-1" v-model="templateName" label="Template Name"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                        <v-select v-model="selectedTags" :items="tags" item-value="value" label="Tags" chips tags></v-select>
                    </v-flex>
                    <v-flex xs8>
                        <v-text-field id="fromAddress" name="input-fromAddress" v-model="fromAddress" label="'From' Address"></v-text-field>
                    </v-flex>

                    <v-flex xs8>
                        <v-text-field id="fromName" name="input-fromName" v-model="fromName" label="'From' Name"></v-text-field>
                    </v-flex>
                    <v-flex xs8>
                        <v-text-field id="sLine" name="input-sLine" v-model="sLine" label="Subject Line"></v-text-field>
                    </v-flex>
                    <h3>Content</h3><br>
                    <h4>Tokens for use in templates</h4>
                    First Name:
                    <pre>${firstName}</pre> Last Name:
                    <pre>${lastName}</pre> Phone Number:
                    <pre>${phoneNumber}</pre> Email Address:
                    <pre>${emailAddress}</pre>
                    <v-tabs icons-and-text centered dark color="cyan">
                        <v-tabs-slider color="yellow"></v-tabs-slider>
                        <v-tab @click="updateHTML" href="#tab-1">
                            Render
                            <v-icon>email</v-icon>
                        </v-tab>
                        <v-tab @click="updateHTML" href="#tab-2">
                            WYSIWYG
                            <v-icon>brush</v-icon>
                        </v-tab>
                        <v-tab @click="updateHTML2" href="#tab-3">
                            Code
                            <v-icon>code</v-icon>
                        </v-tab>
                        <v-tab-item v-for="i in 3" :key="i" :id="'tab-' + i">
                            <v-card flat>
                                <v-card-text v-if="i == 1">
                                    <div class="ql-editor">
                                        <div v-html="content">
                                        </div>
                                    </div>
                                </v-card-text>
                                <v-card-text v-if="i == 2">
                                    <vue-editor v-model="content"></vue-editor>
                                </v-card-text>
                                <v-card-text v-if="i == 3">

                                    <v-textarea solo-inverted name="input-html" v-model="contentBlob"></v-textarea>
                                </v-card-text>

                            </v-card>
                        </v-tab-item>
                    </v-tabs>

                </v-container>

            </v-card><br>
            <v-btn dark color="blue" @click="saveTemplate">Save</v-btn>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
const fb = require('../db/index.js')
const db = fb.db
export default {
    name: 'NewTemplate',
    data() {
        return {
            newContent: '',
            picker: null,
            dateFormatted: null,
            date2Formatted: null,
            date: null,
            time: null,
            date2: null,
            menu2: false,
            menu3: false,
            scheduledSend: false,
            //       content: `
            // <h1 class="ql-align-center"> <span class="ql-font-serif"><span class="ql-cursor">﻿</span>I am Example 3!</span></span> </h1><center><h2 style="color:red;">red text</h2></center> <p><br></p> <p><strong class="ql-font-serif">Whenever you play the game of thrones, you either win or die. There is no middle ground.</strong></p> <p><br></p> <p><u class="ql-font-serif">Some war against sword and spear to win, and the others the crow and the paper to win.</u></p> <p><br></p> <p><em class="ql-font-serif">Dead history is write in ink, the living sort in blood.</em></p> <p><br></p> <p><span class="ql-font-serif" style="color: rgb(0, 102, 204);">They're only numbers. Numbers on paper. Once you understand that, it's easy to make them behave.</span></p> <p><br></p> <p><span class="ql-font-serif">Every time we deal with an enemy, we create two more.</span></p> <p><br></p> <p><span class="ql-font-serif">So the king has decreed. The small council consents.</span></p> <p><br></p> <p><span class="ql-font-serif">Chaos not is a pit, chaos is a ladder.</span></p> <p><br></p> <p><span class="ql-font-serif">A chain needs all sorts of metals, and a land needs all sorts of people.</span></p> <p><br></p> <p><span class="ql-font-serif">When the snows fall and the white winds blow, the lone wolf dies, but the pack survives.</p>`,
            content: `<b>bold</b><br><i>italic</i>`,
            contentBlob: `<b>bold</b><br><i>italic</i>`,
            selectedTags: [],
            selectedCategory: null,
            selectedDOW: '',
            selectedSMTPServer: '',
            templateText: '',
            sLine: '',
            fromAddress: '',
            fromName: '',
            templateName: '',
            dows: [{
                    text: 'Monday',
                    value: 'Monday'
                },
                {
                    text: 'Tuesday',
                    value: 'Tuesday'
                },
                {
                    text: 'Wednesday',
                    value: 'Wednesday'
                },
                {
                    text: 'Thursday',
                    value: 'Thursday'
                },
                {
                    text: 'Friday',
                    value: 'Friday'
                },
                {
                    text: 'Saturday',
                    value: 'Saturday'
                },
                {
                    text: 'Sunday',
                    value: 'Sunday'
                }
            ],
            tags: [],
            servers: [],
            landingPages: [],

            categoryLabels: [],
            categories: [],

            projects: [],
            script: {},
            template: {},
            templateTags: {},
            templateID: '',
            search: '',
            testTemplate: '',
            targetName: 'John Doe'
        }
    },
    beforeCreate() {
        this.templateID = this.$route.params.templateID

    },
    created() {
        db
            .collection('smtpservers')
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc1 => {

                    var tempObject = {
                        text: `${doc1.data().nickname} [${doc1.data().hostname}]`,
                        value: doc1.id
                    }
                    this.servers.push(tempObject)
                })
            })

        db
            .collection('landingpages')
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc1 => {

                    var tempObject = {
                        text: `${doc1.data().nickname} [${doc1.data().url}]`,
                        value: doc1.id
                    }
                    this.landingPages.push(tempObject)
                })
            })

        db
            .collection('categories')
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc1 => {

                    var tempObject = {
                        nickname: doc1.data().nickname,
                        id: doc1.id
                    }

                    this.categories.push(tempObject)

                })
            })
    },
    computed: {
        computedDateFormatted() {
            return this.formatDate(this.date)
        },
        computedTimeFormatted() {
            return this.formatTime(this.picker)
        },
        computedDate2Formatted() {
            return this.formatDate(this.date2)
        }
    },
    watch: {
        date(val) {
            this.dateFormatted = this.formatDate(this.date)
        },

        date2(val) {
            this.date2Formatted = this.formatDate(this.date2)
        }
    },
    methods: {
        updateHTML() {
            var vm = this
            vm.content = vm.contentBlob
        },
        updateHTML2() {
            var vm = this
            vm.contentBlob = vm.content
        },
        formatTime(time) {
            if (!time) return null
            time = time
                .toString()
                .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time]
            if (time.length > 1) {
                // If time format correct
                time = time.slice(1) // Remove full string match value
                time[5] = +time[0] < 12 ? 'AM' : 'PM' // Set AM/PM
                time[0] = +time[0] % 12 || 12 // Adjust hours
            }
            return time.join('')
        },
        formatDate(date) {
            if (!date) return null

            const [year, month, day] = date.split('-')
            return `${month}/${day}/${year}`
        },
        parseDate(date) {
            if (!date) return null

            const [month, day, year] = date.split('/')
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        },

        saveTemplate() {

            var tempObject = {}
            tempObject.tags = {}
            tempObject.title = this.templateName
            tempObject.subjectLine = this.sLine
            this.selectedTags.forEach(function (tag) {
                tempObject.tags[tag] = true
            })
            tempObject.strictTime = this.scheduledSend
            if (this.selectedDOW != '') {
                tempObject.dowSend = this.selectedDOW
                tempObject.timeSend = this.computedTimeFormatted
            }
            tempObject.smtpServer = this.selectedSMTPServer
            tempObject.landingPages = this.selectedLandingPage
            tempObject.fromAddress = this.fromAddress
            tempObject.fromName = this.fromName
            var tempTemplate = this.content

            tempObject.template = tempTemplate

            if (typeof this.selectedCategory === 'string') {

                var ref = db
                    .collection('categories')
                    .add({
                        nickname: this.selectedCategory
                    })
                    .then(function (newCategory) {
                        tempObject.category = newCategory.id

                        var ref2 = db
                            .collection('emailTemplates')
                            .add(tempObject)
                            .then(function (docRef) {

                            })

                    })
            } else {
                tempObject.category = this.selectedCategory.id,
                    tempObject.cNick = this.selectedCategory.nickname

                var ref = db
                    .collection('emailTemplates')
                    .add(tempObject)
                    .then(function (docRef) {

                    }).catch(err => {
                        console.log(err);

                    })
            }

        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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

/* label focus color */

.input-field input[type='text']:focus+label {
    color: #000;
}

/* label underline focus color */

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
