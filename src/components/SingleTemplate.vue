<template>
<v-container fluid>
    <h2>Phishing Templates > {{template.category}} > {{template.title}}</h2>
    <br>
    <v-layout row>
        <v-flex xs12>

            <v-card>
                <v-container>
                    <h3>Category</h3>
                    <b>{{template.category}}</b><br><br>
                    <h3>Tags</h3>
                    <v-chip v-if="templateTags.urgent" color="blue" text-color="white">Urgent</v-chip>
                    <v-chip v-if="templateTags.breach" color="red" text-color="white">Breach</v-chip>
                    <v-chip v-if="templateTags.recruit" color="brown" text-color="white">Recruit</v-chip>
                    <v-chip v-if="templateTags.sales" color="orange" text-color="white">Sales</v-chip>
                    <v-chip v-if="templateTags.help" color="brown" text-color="white">Help</v-chip>
                    <br><br>
                    <h3>Subject Line</h3>
                    <h4>{{template.subjectLine}}</h4>
                    <br><br>
                    <h3>template</h3>
                    <div class="ql-editor">
                        <div v-html="template.template">
                        </div>
                    </div>
                </v-container>

            </v-card>
            <v-btn @click="deleteTemplate" color="error">Delete (should only allow hide for final)</v-btn><br>Shouldn't allow editing because it would skew the stats for correlation. Click to clone / create variation coming in another version.
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
const fb = require('../db/index.js')
const db = fb.db
export default {
    name: "SingleTemplate",
    data() {
        return {
            items: [],
            projects: [],
            template: {},
            templateTags: {},
            templateID: "",
            search: "",
            testTemplate: "",
            targetName: "John Doe"
        };
    },
    beforeCreate() {
        this.templateID = this.$route.params.templateID;

        db
            .collection("emailTemplates")
            .doc(this.templateID)
            .get()
            .then(doc1 => {
                var tempObject = Object(doc1.data());
                tempObject.id = doc1.id;
                
                var newLineString = tempObject.template.replace("\\n", "\n");
                var renderTemplate = newLineString.replace(
                    "${targetName}",
                    this.targetName
                );
                var renderSubject = tempObject.subjectLine.replace(
                    "${targetName}",
                    this.targetName
                );
                tempObject.subjectLine = renderSubject;
                tempObject.template = renderTemplate;
                this.template = tempObject;
                this.templateTags = tempObject.tags;
            });
    },
    created() {},
    computed: {},
    methods: {
        deleteTemplate() {
            db
                .collection("emailTemplates")
                .doc(this.template.id)
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
