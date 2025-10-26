import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyD-v4tJJResl35o_u22ms2JzDEctGkm888',
  authDomain: 'calhacks25-mwj.firebaseapp.com',
  projectId: 'calhacks25-mwj',
  storageBucket: 'calhacks25-mwj.appspot.com',
  messagingSenderId: '56091146871',
  appId: '1:56091146871:web:710b40233d41e29cb36472',
  measurementId: 'G-2GMXBKWSD3',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
