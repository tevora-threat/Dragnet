<template>
<v-container fluid>
    <v-layout row wrap>
        <v-flex xs8>

            <h1>Import Existing Conversion Data</h1>
            <h4>Drop in a csv formatted as shown below. Be sure that if you list a templateID in Column 2, you've already created it in Dragnet. </h4>
            <h5>{{warning}}</h5>
        </v-flex>

        <v-spacer></v-spacer>
        <template>
            <v-flex xs4>
                <vue-dropzone v-on:vdropzone-file-added="upTest" id="drop1" :options="dropOptions"></vue-dropzone>

            </v-flex>
        </template>
        <v-spacer></v-spacer>

    </v-layout>
    <br>
    <v-container grid-list-md text-xs-center>

        <v-layout row wrap>
            <v-flex xs12>
                <v-layout row wrap>
                    <v-flex xs4>
                        <h2>email</h2>
                        <v-card dark color="secondary">
                            <v-card-text class="px-0">email@address.com</v-card-text>
                        </v-card>
                    </v-flex>
                    <v-spacer></v-spacer>
                    <v-flex xs4>
                        <h2>templateID</h2>
                        <v-card dark color="secondary">
                            <v-card-text class="px-0">{{emailTemplates[0]}}</v-card-text>
                        </v-card>
                    </v-flex>
                    <v-spacer></v-spacer>
                    <v-flex xs4>
                        <h2>result</h2>
                        <v-card dark color="secondary">
                            <v-card-text class="px-0">3</v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
    </v-container>
    <!-- <v-layout row wrap>
        <v-flex xs4>

            <h3>Import Existing Conversion Data Here</h3>
        </v-flex>
        <v-spacer></v-spacer>
        <template>
            <v-flex xs5>
                <vue-dropzone v-on:vdropzone-file-added="upTest" id="drop1" :options="dropOptions"></vue-dropzone>
            </v-flex>
        </template>
        <v-spacer></v-spacer>

    </v-layout> -->

    <br>

</v-container>
</template>

<script>
const fb = require('../db/index.js')
const db = fb.db
const storageRef = fb.storage
import Papa from 'papaparse'
import {
    VueCsvImport
} from 'vue-csv-import'
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
const delay = require('delay')
export default {
    name: 'FirstImport',
    firestore() {
        return {

        }
    },
    data() {
        return {
            emailTemplates: [],
            warning: '',
            dropOptions: {
                previewTemplate: this.template(),
                url: '#',
                dictDefaultMessage: "<i style='font-size:20pt;' class='fa fa-cloud-upload'></i><br>Drag in a CSV to import targets."
            },
            csvValue: null,
            loading: false,
        }
    },
    components: {
        VueCsvImport,
        vueDropzone: vue2Dropzone
    },
    beforeCreate() {

    },
    created() {

        db.collection('emailTemplates').get().then(querySnapshot => {
            querySnapshot.forEach(doc1 => {
                this.emailTemplates.push(doc1.id)
            })

            this.warning = `Existing Email Templates (Any template IDs you use in your import spreadsheet should be in this list): [${this.emailTemplates}]`
        })
        console.log(this.emailTemplates);

    },
    computed: {

    },
    watch: {

    },
    methods: {

        template: function () {
            return `<div class="dz-preview dz-file-preview" style="width:200px;box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12) !important;">
                <div class="dz-image">
                    <div data-dz-thumbnail-bg></div>
                </div>
                <div class="dz-details" style="border-radius:2px!important;background-color:#2196f3!important;">
                    <div class="dz-size"><span data-dz-size></span></div>
                    <div class="dz-filename"><span data-dz-name></span></div>
                </div>
                <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
                <div class="dz-error-message" style="display:none;"><span data-dz-errormessage></span></div>
                <div class="dz-success-mark"><i class="fa fa-check"></i></div>
                <div class="dz-error-mark" style="left:45%!important;top:26%!important;"><i style="color:white;" class="fa fa-check"></i></div>
            </div>
        `
        },
        upTest(file) {
            var vm = this

            console.log(file)

            Papa.parse(file, {
                complete: function (results) {

                    var draggedTargets = results.data
                    console.log(draggedTargets);

                    var targetsToAdd = []

                    draggedTargets.forEach(target => {

                        if (target[0] != 'Email' && target[0] != '') {

                            var convUpdate = {
                                email: target[0],
                                template: target[1],
                                result: target[2],
                            }

                            if (vm.emailTemplates.indexOf(target[1]) > -1) {
                                db.collection('conversionsPendingOSINT').add(convUpdate).then((convRef) => {
                                    console.log('added: ', convRef.id);
                                })

                            }

                            if (targetsToAdd.indexOf(!target[0] > -1)) {
                                targetsToAdd.push(target[0])
                            }
                        }
                    })

                    var uniqTargets = targetsToAdd.filter(function (item, pos) {
                        return targetsToAdd.indexOf(item) == pos;
                    })

                    uniqTargets.forEach(target => {
                        db.collection('targets').add({
                            email: target,
                            special: 'conversionPendingOSINT'
                        }).then((targetRef) => {
                            console.log('addedTarget: ', targetRef.id);
                        })

                    });

                }
            })

        }

    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>
@import url('https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');

span#errorChip span {
    cursor: pointer !important;
}

.dz-error-mark {
    display: none;
}

.dz-details {
    border-radius: 2px;
}

.dz-preview {
    box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
        0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12) !important;
}

.form-control {
    -webkit-appearance: menulist !important;
    border-style: solid !important;
    background-color: red !important;
}

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

.input-field input[type='text']:focus+label {
    color: #000;
}

.dz-error-mark {
    display: none;
}

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

.dz-details {
    border-radius: 3px;
    background-color: #2196f3;
}

.accent--text {
    color: #2196f3 !important;
}
</style>
