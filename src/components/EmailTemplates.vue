<template>
<v-container fluid>
    <h2>Email Templates</h2>
    <br>
    <v-layout row>
        <v-flex xs12 sm6 offset-sm3>
            <div class="text-xs-center">
                <div>
                    <router-link :to="{ name: 'NewTemplate' }">
                        <v-btn color="blue" fab dark>
                            <v-icon>add</v-icon>
                        </v-btn>
                    </router-link>

                </div>
            </div>
            <v-card>
                <v-list>
                    <v-list-group v-for="category in categories" v-model="category.active" :key="category.id" no-action>
                        <v-list-tile slot="activator">
                            <v-list-tile-content>
                                <v-list-tile-title>{{ category.nickname }}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile v-for="subItem in category.templates" :key="subItem.id" @click="log(subItem.id)">
                            <v-list-tile-content>
                                <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list-group>

                </v-list>
            </v-card><br>
            <pre>{{testTemplate}}</pre>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
const fb = require('../db/index.js')
const db = fb.db

export default {
    name: "EmailTemplates",
    data() {
        return {
            categories: [],
            projects: [],
            search: "",
            testTemplate: "",
            targetName: "John Doe"
        };
    },
    created() {
        db.collection("categories")
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc1 => {
                    var category = {
                        active: false,
                        nickname: doc1.data().nickname,
                        id: doc1.id,
                        templates: []
                    }

                    db.collection('emailTemplates').where('category', '==', doc1.id).get()
                        .then(querySnapshot => {
                            querySnapshot.forEach(doc2 => {
                                category.templates.push(doc2.data())
                            })
                        })
                    this.categories.push(category)
                })
            })
    },
    computed: {
        filteredList() {
            return this.projects.filter(project => {
                return project.nickname
                    .toLowerCase()
                    .includes(this.search.toLowerCase());
            });
        }
    },
    methods: {
        log: function (logMsg) {
            var vm = this;
            vm.$router.push({
                name: "SingleTemplate",
                params: {
                    templateID: logMsg
                }
            });
        }
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
    color: #2c3e50;
    text-decoration: none;
}

/* label focus color */

.input-field input[type="text"]:focus+label {
    color: #000;
}

/* label underline focus color */

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
