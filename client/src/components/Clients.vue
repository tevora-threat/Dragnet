<template>
<v-container fluid>
    <h1>Clients</h1>
    <br>
    <v-layout row>
        <v-flex xs12 sm6 offset-sm3>
            <v-card>
                <v-layout align-center>
                    <v-flex xs12 sm12 text-xs-center>
                        <div style="padding-top:16px;">
                            <v-btn :to="{name: 'NewClient'}" color="cyan darken-2" class="white--text" large>Add a New Client</v-btn>
                        </div>
                    </v-flex>
                </v-layout>
                <v-container fluid style="min-height: 0;" grid-list-lg>
                    <v-layout row wrap>
                        <v-flex xs12 v-for="client in clients" :key="client['.key']">
                            <v-card color="blue-grey darken-2" class="white--text">
                                <v-container fluid grid-list-lg>
                                    <v-layout row>
                                        <v-flex xs7>
                                            <div>
                                                <div class="headline">{{client.clientName}}</div><br>
                                                Date Added: {{client.regTime}}
                                            </div>
                                        </v-flex>
                                        <v-flex xs5>
                                            <v-card-media :src="client.logoLink" height="125px" contain></v-card-media>
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
    name: "Clients",
    data() {
        return {
            show: false,
            clients: []
        };
    },
    created() {
        //ordering by date added is a breaking change for companies added prior to tracking dateAdded.
        db.collection("companies").orderBy("dateAdded", "desc")
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc1 => {
                    var tempObject = doc1.data()
                    tempObject.id = doc1.id
                    if (doc1.data().domainName) {
                        //TODO: turn this into a cloud func
                        tempObject.logoLink = `//logo.clearbit.com/${doc1.data().domainName}`
                    }

                    if (doc1.data().dateAdded) {
                        tempObject.regTime = new Date(doc1.data().dateAdded.seconds * 1000).toLocaleDateString();
                    }
                    this.clients.push(tempObject)
                })
            })
    }
};
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
