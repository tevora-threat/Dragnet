<template>
<v-container fluid>
    <h1>Engagements</h1>
    <br>
    <v-layout row>
        <v-flex xs12 sm8 offset-sm2>

            <v-card>

                <v-container fluid style="min-height: 0;" grid-list-lg>

                    <v-layout row>

                        <v-flex xs8>
                            <v-icon style="transform:rotate(-90deg);" v-if="showFilters" @click="showFilters = false">filter_list</v-icon>
                            <v-icon v-if="!showFilters" @click="showFilters = true">filter_list</v-icon>

                            <template v-if="showFilters">
                                <v-chip @click.native="toggleFilter('up')" v-if="showUpcoming" label color="blue" text-color="white">
                                    <v-icon style="padding-right: 4px;" dark>check</v-icon>
                                    Upcoming
                                </v-chip>
                                <v-chip @click.native="toggleFilter('up')" v-if="!showUpcoming" label outline color="blue" text-color="blue">
                                    Upcoming
                                </v-chip>

                                <v-chip @click.native="toggleFilter('ip')" v-if="showInProgress" label color="red" text-color="white">
                                    <v-icon style="padding-right: 4px;" dark>check</v-icon>
                                    In Progress
                                </v-chip>
                                <v-chip @click.native="toggleFilter('ip')" v-if="!showInProgress" label outline color="red" text-color="red">
                                    In Progress
                                </v-chip>

                                <v-chip @click.native="toggleFilter('co')" v-if="showCompleted" label color="green" text-color="white">
                                    <v-icon style="padding-right: 4px;" dark>check</v-icon>
                                    Completed
                                </v-chip>
                                <v-chip @click.native="toggleFilter('co')" v-if="!showCompleted" label outline color="green" text-color="green">
                                    Completed
                                </v-chip>
                            </template>

                        </v-flex>
                        <v-spacer></v-spacer>
                        <v-flex xs3>
                            <v-dialog v-model="dialog" persistent max-width="800px">
                                <v-btn slot="activator" color="primary" dark>New Engagement</v-btn>
                                <v-card>
                                    <v-card-title>
                                        <span class="headline">New Engagement</span>
                                    </v-card-title>
                                    <v-card-text>
                                        <v-container fluid>
                                            <v-layout wrap>
                                                <v-flex xs12>
                                                    <v-combobox v-model="companySelected" :items="clients" chips label="Company"></v-combobox>
                                                </v-flex>
                                                <v-flex xs12>
                                                    <v-select :items="testTypes" v-model="testTypesSelected" label="Test Type" multiple chips></v-select>
                                                </v-flex>
                                                <v-flex xs12 sm6>
                                                    <v-container fluid>
                                                        <v-flex xs12>
                                                            <v-menu ref="menu2" :close-on-content-click="false" v-model="menu2" :nudge-right="40" :return-value.sync="date" lazy transition="scale-transition" offset-y full-width min-width="290px">
                                                                <v-text-field slot="activator" v-model="computedDateFormatted" label="Start Date" prepend-icon="event" readonly></v-text-field>
                                                                <v-date-picker v-model="date" @input="$refs.menu2.save(date)"></v-date-picker>

                                                            </v-menu>
                                                        </v-flex>

                                                    </v-container>
                                                </v-flex>

                                                <v-flex xs12 sm6>
                                                    <v-container fluid>
                                                        <v-flex xs12>
                                                            <v-menu ref="menu3" :close-on-content-click="false" v-model="menu3" :nudge-right="40" :return-value.sync="date2" lazy transition="scale-transition" offset-y full-width min-width="290px">
                                                                <v-text-field slot="activator" v-model="computedDate2Formatted" label="End Date" prepend-icon="event" readonly></v-text-field>
                                                                <v-date-picker v-model="date2" @input="$refs.menu3.save(date2)"></v-date-picker>

                                                            </v-menu>
                                                        </v-flex>
                                                    </v-container>
                                                </v-flex>
                                            </v-layout>
                                        </v-container>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
                                        <v-btn color="blue darken-1" flat @click.native="addEngagement">Save</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </v-flex>
                    </v-layout>
                    <v-layout row wrap>

                        <v-flex xs12 v-for="engagement in egFiltered(engagements)" :key="engagement['.key']">
                            <v-card v-if="engagement.timeStat == 'In Progress'" color="blue-grey darken-2" style="border:2px solid #f44336 !important;" class="white--text" hover>
                                <v-container fluid grid-list-lg @click="toEngagement(engagement['.key'])">
                                    <v-layout row>
                                        <v-flex xs7>
                                            <div>
                                                <div class="headline">{{ engagement.companyName }}</div>

                                                <div>{{engagement.pSD}} - {{engagement.pED}}</div>
                                                <br>
                                                <div><b>Test Type:</b></div>
                                                <div>

                                                    <v-chip color="blue" text-color="white" v-if="engagement.testType.cbVishing">
                                                        <v-avatar class="blue darken-4">
                                                            <v-icon dark>phone</v-icon>
                                                        </v-avatar>
                                                        Vishing
                                                    </v-chip>
                                                    <v-chip color="indigo" text-color="white" v-if="engagement.testType.cbPhishing">
                                                        <v-avatar class="indigo darken-4">
                                                            <v-icon dark>mail</v-icon>
                                                        </v-avatar>
                                                        Phishing
                                                    </v-chip>
                                                    <v-chip color="red" text-color="white" v-if="engagement.testType.cbPhysical">
                                                        <v-avatar class="red darken-4">
                                                            <v-icon dark>lock</v-icon>
                                                        </v-avatar>
                                                        Physical
                                                    </v-chip>

                                                </div>
                                            </div>
                                        </v-flex>
                                        <v-flex xs5>
                                            <v-card-media style="border-readius:50%;" :src="engagement.logoUrl" height="125px" contain></v-card-media>
                                        </v-flex>
                                    </v-layout>
                                </v-container>
                            </v-card>
                            <v-card v-if="engagement.timeStat == 'Upcoming'" color="blue-grey darken-2" style="border:2px solid #3ea4f5 !important;" class="white--text" hover>
                                <v-container fluid grid-list-lg @click="toEngagement(engagement['.key'])">
                                    <v-layout row>
                                        <v-flex xs7>
                                            <div>
                                                <div class="headline">{{ engagement.companyName }}</div>

                                                <div>{{engagement.pSD}} - {{engagement.pED}}</div>
                                                <br>
                                                <div><b>Test Type:</b></div>
                                                <div>

                                                    <v-chip color="blue" text-color="white" v-if="engagement.testType.cbVishing">
                                                        <v-avatar class="blue darken-4">
                                                            <v-icon dark>phone</v-icon>
                                                        </v-avatar>
                                                        Vishing
                                                    </v-chip>
                                                    <v-chip color="indigo" text-color="white" v-if="engagement.testType.cbPhishing">
                                                        <v-avatar class="indigo darken-4">
                                                            <v-icon dark>mail</v-icon>
                                                        </v-avatar>
                                                        Phishing
                                                    </v-chip>
                                                    <v-chip color="red" text-color="white" v-if="engagement.testType.cbPhysical">
                                                        <v-avatar class="red darken-4">
                                                            <v-icon dark>lock</v-icon>
                                                        </v-avatar>
                                                        Physical
                                                    </v-chip>

                                                </div>
                                            </div>
                                        </v-flex>
                                        <v-flex xs5>
                                            <v-card-media style="border-readius:50%;" :src="engagement.logoUrl" height="125px" contain></v-card-media>
                                        </v-flex>
                                    </v-layout>
                                </v-container>
                            </v-card>
                            <v-card v-if="engagement.timeStat == 'Completed'" color="blue-grey darken-2" style="border:2px solid #63b967 !important;" class="white--text" hover>
                                <v-container fluid grid-list-lg @click="toEngagement(engagement['.key'])">

                                    <v-layout row>
                                        <v-flex xs7>
                                            <div>
                                                <div class="headline">{{ engagement.companyName }}</div>

                                                <div>{{engagement.pSD}} - {{engagement.pED}}</div>
                                                <br>
                                                <div><b>Test Type:</b></div>
                                                <div>

                                                    <v-chip color="blue" text-color="white" v-if="engagement.testType.cbVishing">
                                                        <v-avatar class="blue darken-4">
                                                            <v-icon dark>phone</v-icon>
                                                        </v-avatar>
                                                        Vishing
                                                    </v-chip>
                                                    <v-chip color="indigo" text-color="white" v-if="engagement.testType.cbPhishing">
                                                        <v-avatar class="indigo darken-4">
                                                            <v-icon dark>mail</v-icon>
                                                        </v-avatar>
                                                        Phishing
                                                    </v-chip>
                                                    <v-chip color="red" text-color="white" v-if="engagement.testType.cbPhysical">
                                                        <v-avatar class="red darken-4">
                                                            <v-icon dark>lock</v-icon>
                                                        </v-avatar>
                                                        Physical
                                                    </v-chip>

                                                </div>
                                            </div>
                                        </v-flex>
                                        <v-flex xs5>
                                            <v-card-media style="border-readius:50%;" :src="engagement.logoUrl" height="125px" contain></v-card-media>
                                        </v-flex>
                                    </v-layout>
                                </v-container>
                            </v-card>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
const fb = require('../db/index.js')
const db = fb.db

export default {
    name: 'Engagements',
    methods: {
        remove(item) {
            this.chips.splice(this.chips.indexOf(item), 1)
            this.chips = [...this.chips]
        },
        egFiltered: function (engagements) {
            var vm = this
            return engagements.filter(function (engagement) {
                return vm.timesChosen.includes(engagement.timeStat)
            })
        },
        toggleFilter(btn) {
            var vm = this
            if (btn == 'up') {
                vm.showUpcoming = !vm.showUpcoming
                var index = vm.timesChosen.indexOf('Upcoming')
                if (index > -1) {
                    vm.timesChosen.splice(index, 1)
                } else {
                    vm.timesChosen.push('Upcoming')
                }
            } else if (btn == 'ip') {
                vm.showInProgress = !vm.showInProgress
                var index = vm.timesChosen.indexOf('In Progress')
                if (index > -1) {
                    vm.timesChosen.splice(index, 1)
                } else {
                    vm.timesChosen.push('In Progress')
                }
            } else if (btn == 'co') {
                vm.showCompleted = !vm.showCompleted
                var index = vm.timesChosen.indexOf('Completed')
                if (index > -1) {
                    vm.timesChosen.splice(index, 1)
                } else {
                    vm.timesChosen.push('Completed')
                }
            } else {
            }
        },
        runUpdate() {

            this.engagements.forEach(engagement => {
            })
        },
        toEngagement(engagement) {
            var vm = this
            vm.$router.push({
                name: 'SingleEngagement',
                params: {
                    engagementID: engagement
                }
            })
        },
        addEngagement() {
            if (typeof this.companySelected === 'object') {
                var vm = this
                var tempObject = {}

                if (this.clientImages[this.companySelected.value] != null) {
                    tempObject.logoUrl = this.clientImages[this.companySelected.value][1]
                }
                tempObject.company = this.companySelected.value
                tempObject.companyName = this.companySelected.text
                //fix this
                tempObject.testType = {
                    cbPhishing: this.testTypesSelected.includes('phishing'),
                    cbVishing: this.testTypesSelected.includes('vishing'),
                    cbPhysical: this.testTypesSelected.includes('physical')
                }

                tempObject.status = 'targetSelection'
                tempObject.timeStat = 'Upcoming'

               

                tempObject.startDate = new Date(`${this.date}` + 'T10:00:00')
                tempObject.endDate = new Date(this.date2 + 'T18:00:00')

                var ref = db
                    .collection('engagements')
                    .add(tempObject)
                    .then(function (docRef) {
                        

                        vm.$router.push({
                            name: 'SingleEngagement',
                            params: {
                                engagementID: docRef.id
                            }
                        })
                    })
            } else {

                var vm = this

                var tempClient = {}
                tempClient.tags = {}
                tempClient.clientName = this.companySelected
                tempClient.domainName = ''

               

                var ref = db
                    .collection('companies')
                    .add(tempClient)
                    .then(function (docRef) {
                        
                        // var vm = this;
                        var tempObject = {}
                        tempObject.company = docRef.id
                        //fix this
                        tempObject.testType = {
                            cbPhishing: this.testTypesSelected.includes('phishing'),
                            cbVishing: this.testTypesSelected.includes('vishing'),
                            cbPhysical: this.testTypesSelected.includes('physical')
                        }

                        tempObject.status = 'targetSelection'

                      

                        tempObject.startDate = new Date(`${this.date}` + 'T10:00:00')
                        tempObject.endDate = new Date(this.date2 + 'T18:00:00')

                        var ref = db
                            .collection('engagements')
                            .add(tempObject)
                            .then(function (docRef) {
                                
                              

                                vm.$router.push({
                                    name: 'SingleEngagement',
                                    params: {
                                        engagementID: docRef.id
                                    }
                                })
                            })
                    })
            }
        },
        toTargetSelection(engagement) {
            var vm = this
            vm.$router.push({
                name: 'SingleEngagement',
                params: {
                    engagementID: engagement
                }
            })
        },
        testLog() {
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
        }
    },
    data() {
        return {
            showFilters: true,
            timesChosen: ['Upcoming', 'In Progress', 'Completed'],
            chips: [
                'Upcoming',
                'In Progress',
                'Completed',
                'Vishing',
                'Phishing',
                'Physical'
            ],
            items: [
                'Upcoming',
                'In Progress',
                'Completed',
                'Vishing',
                'Phishing',
                'Physical'
            ],
            selected: [],
            testTypes: [{
                    text: 'Phishing',
                    value: 'phishing'
                },
                {
                    text: 'Vishing',
                    value: 'vishing'
                }
            ],
            dialog: false,
            showUpcoming: true,
            showInProgress: true,
            showCompleted: true,
            testTypesSelected: [],
            engagements: [],
            clients: [],
            clientImages: {},
            checkOrAdd: [],
            show: false,
            companySelected: '',
            DNSshow1: false,
            HTTPshow1: false,
            DNSshow: false,
            HTTPshow: false,
            dateFormatted: null,
            date2Formatted: null,
            date: null,
            date2: null,
            menu2: false,
            menu3: false
        }
    },

    firestore() {
        return {
            engagements: db.collection('engagements').orderBy('startDate', 'desc')
        }
    },
    watch: {
        date(val) {
            this.dateFormatted = this.formatDate(this.date)
        },
        date2(val) {
            this.date2Formatted = this.formatDate(this.date2)
        },

        engagements(val) {
            var options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }
            var tempObject = val
            tempObject.forEach(engagement => {
                engagement.pSD = new Date(
                    engagement.startDate.seconds * 1000
                ).toLocaleDateString('en-US', options)
                engagement.pED = new Date(
                    engagement.endDate.seconds * 1000
                ).toLocaleDateString('en-US', options)

            })

        }
    },
    computed: {
        computedDateFormatted() {
            return this.formatDate(this.date)
        },
        computedDate2Formatted() {
            return this.formatDate(this.date2)
        }

    },
    mounted() {
        this.$binding('companies', db.collection('companies')).then(companies => {
            companies.forEach(doc1 => {
                var targetObject = {

                    text: doc1.clientName,
                    value: doc1['.key']
                }
                var imgObject = [doc1['.key'], doc1.logoUrl]

                if (imgObject[1] != null) {
                    this.clientImages[doc1['.key']] = imgObject
                    doc1.logoUrl = imgObject[1]
                }
                this.clients.push(targetObject)

                this.checkOrAdd.push(doc1.clientName)
            })
            this.runUpdate()
        })

    },
    created() {

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
    color: #42b983;
}
</style>
