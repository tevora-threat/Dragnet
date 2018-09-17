<template>
<v-container fluid>
    <h2>Phishing Templates > {{template.cNick}} > {{template.title}}</h2>
    <h4>PAGE IS WIP</h4>
    <br>
    <v-layout row>
        <v-flex xs12>

            <v-card>
                <v-container>
                    <h3>Category</h3>
                    <b>{{template.cNick}}</b><br><br>
                   
                    <h3>Subject Line</h3>
                    <h4>{{template.subjectLine}}</h4>
                    <br><br>
                    <h3>template</h3>
                    <div class="ql-editor">
                        <div v-html="template.template">
                        </div>
                    </div>
                </v-container>

            </v-card><br><br>
            <code>
            {{injectionCode}}    
            </code>
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
            cloudFuncsEndpointURl:'test',
            landingPageUrl:'t',
            injectionCode:`
<script>
function getCookie(name) {
      var cookies = '; ' + document.cookie;
      var splitCookie = cookies.split('; ' + name + '=');
      if (splitCookie.length == 2) return splitCookie.pop();
    }

    if (getCookie('aID')) {
      console.log(getCookie('aID'));
      var aID = getCookie('aID');
      var cookieImg = new Image();
      cookieImg.src = 'https://${this.cloudFuncsEndpointURl}.cloudfunctions.net/analytics?aID=' + aID;

    } else {
      console.log('not set');

      function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var
          regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
          results = regex.exec(url);
        if (!results) return null;
        if (!results[2])
          return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
      }

      document.cookie = "aID=" + getParameterByName('aID') + "; expires=365; path=/";
      window.location = "${this.landingPageUrl}";

    }
<\/script>`,
            projects: [],
            template: {},
            templateTags: {},
            tags: [],
            templateID: "",
            search: "",
            testTemplate: "",
            landingpage:'',
            targetName: "John Doe"
        };
    },
    beforeCreate() {
        this.templateID = this.$route.params.templateID;

        let existingTags = []

        db
            .collection("emailTemplates")
            .doc(this.templateID)
            .get()
            .then(doc1 => {
                var tempObject = Object(doc1.data());
                tempObject.id = doc1.id;

                db.collection('landingpages').doc(tempObject.landingPages).get().then(doc1=>{
                this.landingPage = doc1.data().url
                console.log(this.landingPage);
                
            })

            console.log(tempObject);
            

               
                tempObject.subjectLine = renderSubject;
                tempObject.template = renderTemplate;
                this.tags = tempObject.tags
                console.log(this.tags);

                db.collection("tags")
                    .get()
                    .then(querySnapshot => {
                        querySnapshot.forEach(doc1 => {
                            var tagObject = {}
                            tagObject[doc1.id] = doc1.data().nickname
                            existingTags.push(tagObject)
                        })
                    })

                this.template = tempObject;
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