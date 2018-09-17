<template>
<v-container fluid>
    <h2>Vishing Scripts > {{script.title}}</h2>
    <h4>PAGE IS WIP</h4>
    <br>
    <v-layout row>
        <v-flex xs12 sm6 offset-sm3>
            <v-card>
                <v-container>
                    <h3>Tags</h3>
                    <br><br>
                    <h3>Script</h3>
                    <pre>{{script.script}}</pre>
                </v-container>

            </v-card>
            <v-btn @click="deleteScript" color="error">Delete (should only allow hide for final)</v-btn><br>Shouldn't allow editing because it would skew the stats for correlation. Click to clone / create variation coming in another version.
      </v-flex>
    </v-layout>
</v-container>
</template>

<script>
const fb = require('../db/index.js')
const db = fb.db
export default {
    name: "SingleScript",
    data() {
        return {
            items: [],
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

        db
            .collection("vishingScripts")
            .doc(this.scriptID)
            .get()
            .then(doc1 => {
                var tempObject = Object(doc1.data());
                tempObject.id = doc1.id;

                var newLineString = tempObject.script.replace("\\n", "\n");
                var renderScript = newLineString.replace(
                    "${targetName}",
                    this.targetName
                );
                tempObject.script = renderScript;

                this.script = tempObject;
                this.scriptTags = tempObject.tags;
            });
    },
    created() {},
    computed: {

    },
    methods: {
        deleteScript() {
            db
                .collection("vishingScripts")
                .doc(this.script.id)
                .delete()
                .then(function () {
                    console.log("Document successfully deleted!");
                })
                .catch(function (error) {
                    console.error("Error removing document: ", error);
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
