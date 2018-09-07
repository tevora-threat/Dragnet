<template>
<v-container fluid>
    <h2>New Script</h2>
    <br>
    <v-layout row>
        <v-flex xs12 sm6 offset-sm3>
            <v-card>
                <v-container>
                    <h3>Script</h3><br>
                    <v-flex xs6>
                        <v-flex xs6>

                            <v-combobox v-model="selectedCategory" item-text="nickname" item-value="id" :items="categories" return-object label="Category" hint="You can also create a new category"></v-combobox>
                        </v-flex>
                    </v-flex>

                    <v-flex xs8>
                        <v-text-field id="testing" name="input-1" v-model="scriptName" label="Script Name"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                        <v-select v-model="selectedTags" :items="tags" item-value="value" label="Tags" chips tags></v-select>
                    </v-flex>
                    <v-layout row>
                        <v-flex xs8>
                            <p style="white-space: pre-line;">{{ scriptText }}</p>
                            <v-text-field name="input-7-3" label="Script - Variable for Target name is <b>${targetName}</b>" value="" v-model="scriptText" multi-line></v-text-field>
                        </v-flex>
                    </v-layout>
                </v-container>

            </v-card><br>
            <v-btn dark color="blue" @click="saveScript">Save</v-btn>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
const fb = require('../db/index.js')
const db = fb.db
export default {
    name: "NewScript",
    data() {
        return {
            selectedTags: [],
            selectedCategory: "",
            scriptText: "",
            scriptName: "",
            tags: [],
            categories: [],
            projects: [],
            script: {},
            scriptTags: {},
            scriptID: "",
            search: "",
            testScript: "",
            targetName: "John Doe"
        };
    },
    beforeCreate() {
        this.scriptID = this.$route.params.scriptID;

    },
    created() {
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

    },
    methods: {

        saveScript() {
            var tempObject = {};
            tempObject.tags = {};
            tempObject.title = this.scriptName;
            this.selectedTags.forEach(function (tag) {
                tempObject.tags[tag] = true;
            });
            var tempScript = this.scriptText;
            tempObject.script = tempScript;

            if (typeof this.selectedCategory === 'string') {

                var ref = db
                    .collection('categories')
                    .add({
                        nickname: this.selectedCategory
                    })
                    .then(function (newCategory) {
                        tempObject.category = newCategory.id

                        var ref2 = db
                            .collection("vishingScripts")
                            .add(tempObject)
                            .then(function (docRef) {;
                            });

                    })
            } else {

                tempObject.category = this.selectedCategory.id

                var ref = db
                    .collection("vishingScripts")
                    .add(tempObject)
                    .then(function (docRef) {;
                    });

            }

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
