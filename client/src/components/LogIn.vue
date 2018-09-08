<template>
<v-container grid-list-md text-xs-center>
    <v-layout row wrap>
        <v-flex xs12>
            <v-flex xs12>
                <v-card>
                    <v-toolbar color="blue-grey darken-1" dark>
                        <v-toolbar-title>Log In</v-toolbar-title>
                        <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-form>
                        <v-container grid-list-md text-xs-center>
                            <v-text-field v-model="email" label="E-Mail" required></v-text-field>
                            <v-text-field v-model="password" label="Password" type="password" @keyup.enter.native="logInHelper(email, password)" required></v-text-field>
                        </v-container>
                    </v-form>
                    <v-btn @click="logInHelper(email, password)">
                        Log In
                    </v-btn>
                </v-card>
            </v-flex><br>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
import firebase from 'firebase'
const fb = require('../db/index.js')

export default {
    name: "LogIn",
    methods: {
        logInHelper(email, password) {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(user => {
                    var vm = this
                    vm.$router.push({
                        name: 'Engagements',
                    })
                }, err => {
                })
        }
    },
    data() {
        return {
            email: "",
            password: ""
        };
    },
    beforeCreate() {},
    created() {
        firebase.auth().onAuthStateChanged(user => {
            this.authUser = user
            if (user) {
            }
        })
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
