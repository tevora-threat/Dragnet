import Vue from 'vue'
import Router from 'vue-router'
import LogIn from '@/components/LogIn'
import Targets from '@/components/Targets'
import Clients from '@/components/Clients'
import NewClient from '@/components/NewClient'
import Dossier from '@/components/Dossier'
import Engagements from '@/components/Engagements'
import VishingScripts from '@/components/VishingScripts'
import SingleScript from '@/components/SingleScript'
import NewScript from '@/components/NewScript'
import EmailTemplates from '@/components/EmailTemplates'
import SingleTemplate from '@/components/SingleTemplate'
import NewTemplate from '@/components/NewTemplate'
import SingleEngagement from '@/components/SingleEngagement'
import SingleAttack from '@/components/SingleAttack'
import Integrations from '@/components/Integrations'
import FirstImport from '@/components/FirstImport'
import firebase from 'firebase'
Vue.use(Router)

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '*',redirect:'/'
    },
    // {
    //   path: '/',
    //   name: 'Dashboard',
    //   component: Dashboard
    // },
    {
      path: '/',
      name: 'LogIn',
      component: LogIn
    },
    {
      path: '/targets',
      name: 'Targets',
      component: Targets,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/targets/:targetID',
      name: 'Dossier',
      component: Dossier,
      meta: {
        requiresAuth: true
      }
    },

    {
      path: '/clients',
      name: 'Clients',
      component: Clients,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/clients/new',
      name: 'NewClient',
      component: NewClient,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/engagements',
      name: 'Engagements',
      component: Engagements,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/engagements/:engagementID',
      name: 'SingleEngagement',
      component: SingleEngagement,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/templates/vishing',
      name: 'VishingScripts',
      component: VishingScripts,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/templates/vishing/:scriptID',
      name: 'SingleScript',
      component: SingleScript,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/templates/vishing/new',
      name: 'NewScript',
      component: NewScript,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/templates/phishing',
      name: 'EmailTemplates',
      component: EmailTemplates,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/templates/phishing/:templateID',
      name: 'SingleTemplate',
      component: SingleTemplate,
      meta: {
        requiresAuth: true
      }
    }, {
      path: '/templates/phishing/new',
      name: 'NewTemplate',
      component: NewTemplate,
      meta: {
        requiresAuth: true
      }
    }, {
      path: '/attacks/:attackID',
      name: 'SingleAttack',
      component: SingleAttack,
      meta: {
        requiresAuth: true
      }
    },{
      path: '/integrations',
      name: 'Integrations',
      component: Integrations,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/import',
      name: 'FirstImport',
      component: FirstImport,
      meta: {
        requiresAuth: true
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  let currentUser = firebase.auth().currentUser;
  let requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !currentUser) next('')
  else if (!requiresAuth && currentUser) next('engagements')
  else if (requiresAuth && currentUser) next()
  else next()
})

export default router
