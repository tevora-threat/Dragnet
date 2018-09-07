<template>
<v-container fluid>
    <h2>SMTP Servers</h2>
    <v-layout row>
        <v-flex xs12 sm6 offset-sm3>

            <v-flex xs12>

                <v-layout row justify-center>
                    <v-dialog v-model="dialog" persistent max-width="800px">

                        <v-btn color="blue" slot="activator" fab dark>
                            <v-icon>add</v-icon>
                        </v-btn>

                        <v-card>
                            <v-card-title>
                                <span class="headline">New SMTP Server</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container>
                                    <v-form ref="form" v-model="valid1" lazy-validation>

                                        <v-layout row wrap>
                                            <v-flex xs12>
                                                <v-text-field v-model="newSMTP.nickname" label="Nickname" :rules="[rules.required]" required></v-text-field>

                                            </v-flex>
                                            <v-flex xs5>
                                                <v-text-field v-model="newSMTP.hostname" label="Hostname" :rules="[rules.required]" required></v-text-field>

                                            </v-flex>
                                            <v-spacer></v-spacer>
                                            <v-flex xs3>
                                                <v-text-field v-model="newSMTP.port" type="number" :rules="[rules.required, rules.counter]" maxlength="5" label="Port Number"></v-text-field>

                                            </v-flex>
                                            <v-spacer></v-spacer>
                                            <v-flex xs3>
                                                <v-checkbox color="blue darken-1" label="Secure" v-model="newSMTP.secure"></v-checkbox>

                                            </v-flex>
                                            <v-flex xs5>
                                                <v-text-field v-model="newSMTP.username" label="Username" :rules="[rules.required]" required></v-text-field>

                                            </v-flex>
                                            <v-spacer></v-spacer>
                                            <v-flex xs5>
                                                <v-text-field v-model="newSMTP.password" type="password" label="Password" :rules="[rules.required]" required></v-text-field>

                                            </v-flex>
                                            <v-spacer></v-spacer>

                                        </v-layout>
                                    </v-form>

                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" flat @click.native="cancelAddServer">Cancel</v-btn>
                                <v-btn color="blue darken-1" :disabled="!valid1" flat @click.native="addServer">Save</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-layout>
            </v-flex>
            <v-card>
                <template>
                    <div>

                        <v-expansion-panel v-model="smtpServerPanel" expand>
                            <v-expansion-panel-content v-for="server in SMTPServers" :key="server['.key']">
                                <div slot="header"><code>{{server.nickname}}</code> // <code>{{server.hostname}}</code>
                                </div>
                                <v-card>
                                    <v-card-text>
                                        <h3>Details</h3>
                                        <v-form v-model="valid1">
                                            <v-text-field v-model="server.nickname" label="Nickname" required></v-text-field>
                                            <v-text-field v-model="server.hostname" label="Hostname" required></v-text-field>
                                            <v-text-field v-model="server.port" label="Port Number" required></v-text-field>
                                            <v-checkbox color="blue darken-1" label="Secure" v-model="server.secure"></v-checkbox>
                                            <v-text-field v-model="server.username" label="Username" required></v-text-field>
                                            <v-text-field v-model="server.password" type="password" label="Password" required></v-text-field>

                                        </v-form>
                                    </v-card-text>
                                </v-card>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </div>
                </template>
            </v-card>
        </v-flex>
    </v-layout>

    <br><br><br><br>
    <h2>Landing Pages</h2>
    <v-layout row>
        <v-flex xs12 sm6 offset-sm3>

            <v-flex xs12>

                <v-layout row justify-center>
                    <v-dialog v-model="dialog2" persistent max-width="800px">

                        <v-btn color="blue" slot="activator" fab dark>
                            <v-icon>add</v-icon>
                        </v-btn>

                        <v-card>
                            <v-card-title>
                                <span class="headline">New Landing Page</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container>
                                    <v-form ref="form2" v-model="valid2" lazy-validation>

                                        <v-layout row wrap>
                                            <v-flex xs12>
                                                <v-text-field v-model="newLanding.nickname" label="Nickname" :rules="[rules.required]" required></v-text-field>

                                            </v-flex>
                                            <v-flex xs12>
                                                <v-text-field v-model="newLanding.url" label="Url" :rules="[rules.required]" required></v-text-field>

                                            </v-flex>

                                        </v-layout>
                                    </v-form>

                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" flat @click.native="cancelAddLanding">Cancel</v-btn>
                                <v-btn color="blue darken-1" :disabled="!valid2" flat @click.native="addLanding">Save</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-layout>
            </v-flex>
            <v-card>
                <template>
                    <div>

                        <v-expansion-panel v-model="landingPanel" expand>
                            <v-expansion-panel-content v-for="page in landingPages" :key="page['.key']">
                                <div slot="header"><code>{{page.nickname}}</code> // <code>{{page.url}}</code>
                                </div>
                                <v-card>
                                    <v-card-text>
                                        <h3>Details</h3>
                                        <v-form v-model="valid2">
                                            <v-text-field v-model="page.nickname" label="Nickname" required></v-text-field>
                                            <v-text-field v-model="page.url" label="Url" required></v-text-field>

                                        </v-form>
                                    </v-card-text>
                                </v-card>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </div>
                </template>
            </v-card>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
const fb = require('../db/index.js')
const db = fb.db
export default {
    name: 'Integrations',
    data() {
        return {
            valid: true,
            valid1: true,
            valid2: true,
            rules: {
                required: value => !!value || 'Required.',
                counter: value => value.length <= 5 || 'Max 5 characters',
                email: value => {
                    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    return pattern.test(value) || 'Invalid e-mail.'
                }
            },
            newSMTP: {
                hostname: '',
                nickname: '',
                password: '',
                secure: false,
                port: '',
                username: ''
            },
            smtpServerPanel: [],
            SMTPServers: [],
            newLanding: {
                hostname: '',
                url: ''
            },
            landingPanel: [],
            landingPages: [],
            liPassword: 'testing',
            expanded: false,
            panel: [],
            items: 3,
            projects: [],
            search: '',
            testTemplate: '',
            targetName: 'John Doe'
        }
    },
    created() {
        db
            .collection('smtpservers')
            .orderBy('nickname', 'asc')
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc1 => {
                    this.SMTPServers.push(doc1.data())
                })
            })

        db
            .collection('landingpages')
            .orderBy('nickname', 'asc')
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc1 => {
                    this.landingPages.push(doc1.data())
                })
            })
    },
    computed: {},
    methods: {
        addServer() {
            if (this.$refs.form.validate()) {
                var ref = db
                    .collection('smtpservers')
                    .add(this.newSMTP)
                    .then(function (docRef) {
                    })
                    .then(ref => {
                        this.dialog = false
                        this.$refs.form.reset()
                        this.SMTPServers = []
                    })
                    .then(ref => {
                        db
                            .collection('smtpservers')
                            .orderBy('nickname', 'desc')
                            .get()
                            .then(querySnapshot => {
                                querySnapshot.forEach(doc1 => {
                                    this.SMTPServers.push(doc1.data())
                                })
                            })
                    })
            }
        },
        cancelAddServer() {
            this.dialog = false
            this.$refs.form.reset()
        },
        addLanding() {
            if (this.$refs.form2.validate()) {
                var ref = db
                    .collection('landingpages')
                    .add(this.newLanding)
                    .then(function (docRef) {
                        
                    })
                    .then(ref => {
                        this.dialog2 = false
                        this.$refs.form2.reset()
                        this.landingPages = []
                    })
                    .then(ref => {
                        db
                            .collection('landingpages')
                            .orderBy('nickname', 'desc')
                            .get()
                            .then(querySnapshot => {
                                querySnapshot.forEach(doc1 => {
                                    this.landingPages.push(doc1.data())
                                })
                            })
                    })
            }
        },
        cancelAddLanding() {
            this.dialog2 = false
            this.$refs.form2.reset()
        },
        all() {
            this.panel = [...Array(this.items).keys()].map(_ => true)
            this.expanded = true
        },
        none() {
            this.panel = []
            this.expanded = false
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
    text-decoration: none;
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
