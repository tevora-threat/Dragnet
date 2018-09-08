import firebase from 'firebase'
import 'firebase/firestore'
import { config } from '../../../configs/fbConfig'

firebase.initializeApp(config)

const db = firebase.firestore()
const storage = firebase.storage()
const auth = firebase.auth()
const currentUser = auth.currentUser

const settings = {
  timestampsInSnapshots: true
}
db.settings(settings)

export {
  db,
  auth,
  currentUser,
  storage
}
