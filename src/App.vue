<template>
  <v-app :dark="darkMode">
    <v-navigation-drawer
      persistent
      :mini-variant="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      enable-resize-watcher
      fixed
      app
    >
      <v-list dense class="pt-0">
      <v-list-tile v-for="(item, i) in items" :key="i" :to="item.path">

        <v-list-tile-action>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{ item.title }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    </v-navigation-drawer>
    <v-toolbar
      app
      :clipped-left="clipped"
    >
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
      </v-btn>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
            <v-btn v-if="userLoggedIn" @click.stop="logOut">
        Log Out
      </v-btn>
    </v-toolbar>
    <v-content>
      <router-view/>
    </v-content>
    <v-navigation-drawer
      temporary
      :right="right"
      v-model="rightDrawer"
      fixed
      app
    >
      <v-list>
        <v-list-tile @click="right = !right">
          <v-list-tile-action>
            <v-icon>compare_arrows</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Switch drawer (click me)</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-footer :fixed="fixed" app>
      <span style="padding-left:8px;">&copy; 2018 Tevora</span>
      <v-spacer></v-spacer>
<v-btn flat small @click="darkMode = !darkMode">
      <v-icon>wb_sunny</v-icon>
    </v-btn>
    </v-footer>
  </v-app>
</template>

<script>
import firebase from 'firebase'
export default {
  data() {
    return {
      clipped: true,
      userLoggedIn:false,
      drawer: true,
      fixed: false,
      darkMode: false,
      items: [
        {
          icon: 'domain',
          title: 'Clients',
          path: '/clients'
        },
        {
          icon: 'playlist_play',
          title: 'Engagements',
          path: '/engagements'
        },
        {
          icon: 'perm_phone_msg',
          title: 'Vishing Scripts',
          path: '/templates/vishing'
        },
        {
          icon: 'email',
          title: 'Email Templates',
          path: '/templates/phishing'
        },
        {
          icon: 'settings',
          title: 'Integrations',
          path: '/integrations'
        }
      ],
      miniVariant: true,
      right: true,
      rightDrawer: false,
      title: 'Dragnet'
    }
  },
      methods: {
    logOut() {

      firebase.auth().signOut()
      .then(result => {
        var vm = this
      vm.$router.push({
        name: 'LogIn',
      })
        
      }, err => {
        console.log(err.message);
        
      })

    }},
      created() {
      firebase.auth().onAuthStateChanged(user => {
        this.authUser = user
        if (user) {
          this.userLoggedIn = true
        } else {
          this.userLoggedIn = false
        }
      })
  },
  name: 'App'
}
</script>

<style scoped>
.v-btn--floating.v-btn--small {
  height: 20px;
  width: 20px;
}

.v-btn--floating.v-btn--small .v-icon {
  font-size: 10px;
}
</style>

<style>
.credsText .v-input__slot {
  margin-bottom: 0;
  height: 56px !important;
}

.accent--text {
  color: #2196f3 !important;
}
</style>


