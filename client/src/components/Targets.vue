<template>
<v-container fluid>
    <v-card>
        <v-card-title>
            Targets
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
        </v-card-title>
        <v-data-table :headers="headers" :items="targets" :search="search">

            <template slot="items" slot-scope="props">

                <router-link :to="{
      name: 'Dossier',
      params: { targetID: props.item.targetID }
    }">
                    <td>{{ props.item.name }}</td>
                </router-link>
                <td>{{ props.item.company }}</td>
                <td>{{ props.item.location }}</td>

            </template>
            <v-alert slot="no-results" :value="true" color="error" icon="warning">
                Your search for "{{ search }}" found no results.
            </v-alert>
        </v-data-table>
    </v-card>
</v-container>
</template>

<script>
const fb = require('../db/index.js')
const db = fb.db
export default {
    name: "Targets",
    created() {
        db
            .collection("targets")
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc1 => {
                    var targetObject = {
                        value: false,
                        name: `${doc1.data().fName} ${doc1.data().lName}`,
                        targetID: doc1.id
                    };

                    db
                        .collection("companies")
                        .doc(doc1.data().company)
                        .get()
                        .then(querySnapshot => {
                            targetObject.company = querySnapshot.data().clientName;
                            this.targets.push(targetObject);
                        });

                });
            });
    },
    data() {
        return {
            search: "",
            headers: [{
                    text: "Name",
                    align: "left",
                    value: "name"
                },
                {
                    text: "Company",
                    align: "left",
                    value: "company"
                },
                {
                    text: "Location",
                    align: "left",
                    value: "location"
                }
            ],
            targets: []
        };
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
