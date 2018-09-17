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
                    <v-flex xs6>
                        <v-text-field :mask="mask" v-model="attackerPhone" label="Attack Phone # (Your Cell)"></v-text-field>
                    </v-flex>
                    <v-flex xs5>
                        <v-text-field :mask="mask" v-model="callerIdNumber" label="Masked # (Caller ID)"></v-text-field>
                    </v-flex>
                    <v-flex xs5>
                        <v-text-field v-model="callerIdName" label="Caller ID Name"></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                        <v-combobox v-model="selectedTags" :items="tags" item-text="nickname" item-value="id" :search-input.sync="search" return-object hide-selected hint="Maximum of 5 tags" label="Add some tags" multiple persistent-hint small-chips>
                            <template slot="no-data">
                                <v-list-tile>
                                    <v-list-tile-content>

                                        <v-list-tile-title>
                                            No tags matching "<strong>{{ search }}</strong>". Press <kbd>enter</kbd> to create one.
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                            </template>
                        </v-combobox>
                    </v-flex><br>
                    <h3>Variables:</h3>
                    <code style="cursor:pointer" @click="clickedToken('${firstName}')">${firstName}</code> <code style="cursor:pointer" @click="clickedToken('${lastName}')">${lastName}</code> <code style="cursor:pointer" @click="clickedToken('${fullName}')">${fullName}</code> <code style="cursor:pointer" @click="clickedToken('${phoneNumber}')">${phoneNumber}</code> <code style="cursor:pointer" @click="clickedToken('${emailAddress}')">${emailAddress}</code>
                    <v-layout row>
                        <v-flex xs8>
                            <v-text-field ref="scriptContent" name="input-7-3" label="Script - Variable for Target name is <b>${targetName}</b>" value="" v-model="scriptText" multi-line></v-text-field>
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
            mask: 'phone',
            selectedTags: [],
            selectedCategory: "",
            scriptText: "",
            callerIdName: '',
            callerIdNumber: '',
            attackerPhone: '',
            scriptName: "",
            tags: [],
            search: null,
            categories: [],
            projects: [],
            script: {},
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

        db
            .collection('tags')
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc1 => {

                    var tempObject = {
                        nickname: doc1.data().nickname,
                        id: doc1.id
                    }

                    this.tags.push(tempObject)

                })
            })
    },
    computed: {

    },
    watch: {
        selectedTags(val) {
            if (val.length > 5) {
                this.$nextTick(() => this.selectedTags.pop())
            }
        }
    },
    methods: {
        clickedToken(token) {
            var vm = this
            vm.scriptText += token
            vm.$refs.scriptContent.focus()

        },

        saveScript() {
            var vm = this;
            var tempObject = {};
            tempObject.tags = {};
            tempObject.title = this.scriptName;
            this.selectedTags.forEach(function (tag) {
                tempObject.tags[tag] = true
            })
            var tempScript = this.scriptText;
            tempObject.script = tempScript;
            tempObject.callerIDName = this.callerIdName
            tempObject.callerIDNum = this.callerIdNumber
            tempObject.attackerNum = this.attackerPhone

            function checkTags(tags) {
                var finalSelectedTags = {}

                tags.forEach(tag => {
                    if (typeof tag === 'string') {

                        var ref = db
                            .collection('tags')
                            .add({
                                nickname: tag
                            })
                            .then(function (newTag) {
                                finalSelectedTags[newTag.id] = true

                            })
                    } else {

                        finalSelectedTags[tag.id] = true

                    }

                });

                return finalSelectedTags

            }
            tempObject.tags = checkTags(vm.selectedTags)

            function checkCategory(category) {
                if (typeof category === 'string') {

                    var ref = db
                        .collection('categories')
                        .add({
                            nickname: category
                        })
                        .then(function (newCategory) {
                            tempObject.category = newCategory.id
                            var ref = db
                                .collection("vishingScripts")
                                .add(tempObject)
                                .then(function (docRef) {
                                    console.log("Uploaded new script: ", docRef.id);
                                    //setting up for conversions/retraining now
                                    db.collection('conversions').doc(docRef.id).set({
                                        type: 'vishing',
                                        status: 'new'
                                    })
                                    vm.$router.push({
                                        name: 'VishingScripts',
                                    })

                                });

                        })
                } else {

                    tempObject.category = category.id
                    var ref = db
                        .collection("vishingScripts")
                        .add(tempObject)
                        .then(function (docRef) {
                            console.log("Uploaded new script: ", docRef.id);
                            //setting up for conversions/retraining now
                            db.collection('conversions').doc(docRef.id).set({
                                type: 'vishing',
                                status: 'new'
                            })
                            vm.$router.push({
                                name: 'VishingScripts',
                            })

                        });

                }

            }

            checkCategory(this.selectedCategory)
            console.log(tempObject);

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
