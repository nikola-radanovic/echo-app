import React, { useEffect } from 'react';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { app } from './firebaseConfig';
import HomeScreen from './screens/HomeScreen';
import Toast from 'react-native-toast-message';

export default function App() {
  useEffect(() => {
    const auth = getAuth(app);
    signInAnonymously(auth).catch(console.error);
  }, []);

  return (
    <>
      <HomeScreen />
      <Toast />
    </>
  );
}

