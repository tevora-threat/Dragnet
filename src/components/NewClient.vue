<template>
<v-container fluid>
    <h2>New Client</h2>
    <br>
    <v-layout row>
        <v-flex xs12 sm6 offset-sm3>
            <v-card>
                <v-container>
                    <h3>Basic Info</h3><br>
                    <v-flex xs8>
                        <v-text-field id="testing" name="input-1" v-model="clientName" label="Client Name"></v-text-field>
                    </v-flex>
                    <v-flex xs8>
                        <v-text-field id="dName" name="input-dName" v-model="domainName" label="Client's Main Website URL"></v-text-field>
                    </v-flex>
                    <v-flex xs8>
                        <v-checkbox color="blue darken-1" label="Record Calls When Vishing*" v-model="canRecord"></v-checkbox>
                    </v-flex>
                    <v-flex xs12>
                        <center><span class="smallText">*You may not record calls without express written permission from client.</span></center>
                    </v-flex>
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
    name: 'NewClient',
    data() {
        return {
            clientName: '',
            canRecord: false,
            domainName: '',
            tags: [],
            selectedTags: [],
            e1: 0,
            dialog: false,
            dialog2: false,
            dialog3: false,
            notifications: false,
            sound: true,
            widgets: false,
            items: [
            ],
            select: [
            ]
        }
    },
    methods: {
        saveTemplate() {
            var tempObject = {}
            tempObject.clientName = this.clientName
            tempObject.domainName = this.domainName
            tempObject.canRecord = this.canRecord
            
            var ref = db
                .collection('companies')
                .add(tempObject)
                .then(function (docRef) {
                    
                })
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

.smallText {
    font-size: 8pt;
    color: grey;
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

.accent--text {
    color: #2196f3 !important;
}
</style>
