import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Alert,
  ScrollView
} from 'react-native';
import * as Location from 'expo-location';
import { GeoFirestore } from 'geofirestore';
import { firebase, firestore } from '../firebaseConfig';

const HomeScreen = () => {
  const [text, setText] = useState('');
  const [location, setLocation] = useState(null);
  const [echoes, setEchoes] = useState([]);
  const [radius, setRadius] = useState(10);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Enable location to use Echo.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      console.log('📍 User location:', loc.coords.latitude, loc.coords.longitude);
      loadNearbyEchoes(loc.coords, radius);
    })();
  }, []);

  const postEcho = async () => {
    if (!text.trim() || !location) return;

    try {
      await firestore.collection('echoes').add({
        content: text,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        location: new firebase.firestore.GeoPoint(location.latitude, location.longitude)
      });
      setText('');
      alert('Echo posted!');
      loadNearbyEchoes(location, radius);
    } catch (e) {
      console.error('❌ Failed to post echo:', e);
      alert('Failed to post echo.');
    }
  };

  const loadNearbyEchoes = async (coords, queryRadius = radius) => {
    try {
      const geoFirestore = new GeoFirestore(firestore);
      const geoCollection = geoFirestore.collection('echoes');

      const since = firebase.firestore.Timestamp.fromMillis(
        Date.now() - 24 * 60 * 60 * 1000
      );

      const query = geoCollection
        .near({
          center: new firebase.firestore.GeoPoint(coords.latitude, coords.longitude),
          radius: queryRadius
        })
        .where('createdAt', '>=', since);

      const snapshot = await query.get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('📦 Nearby Echoes:', data);
      setEchoes(data);
    } catch (e) {
      console.error('❌ Echo failed:', e.code, e.message);
      alert(`Failed to post echo: ${e.message}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Drop an Echo</Text>
      <TextInput
        placeholder="What's on your mind?"
        value={text}
        onChangeText={setText}
        style={styles.input}
        maxLength={200}
        multiline
      />
      <Button title="Echo it" onPress={postEcho} />

      <View style={styles.filterContainer}>
        {[1, 5, 10].map((r) => (
          <View
            key={r}
            style={[styles.filterButton, radius === r && styles.filterButtonActive]}
          >
            <Text
              style={[styles.filterText, radius === r && styles.filterTextActive]}
              onPress={() => {
                setRadius(r);
                if (location) loadNearbyEchoes(location, r);
              }}
            >
              {r}km
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.subheading}>Nearby Echoes</Text>
      {echoes.length === 0 ? (
        <Text style={styles.noEcho}>No echoes nearby yet...</Text>
      ) : (
        echoes.map((echo) => (
          <View key={echo.id} style={styles.echoCard}>
            <Text style={styles.echoText}>{echo.content}</Text>
            {echo.location && (
              <Text style={styles.echoMeta}>
                {echo.location.latitude.toFixed(3)}, {echo.location.longitude.toFixed(3)}
              </Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100 },
  heading: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  subheading: { fontSize: 18, marginTop: 30, marginBottom: 10 },
  noEcho: { fontSize: 14, fontStyle: 'italic', color: 'gray', textAlign: 'center' },
  input: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: 'top'
  },
  echoCard: {
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  echoText: { fontSize: 16 },
  echoMeta: { fontSize: 10, color: 'gray', marginTop: 5 },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginHorizontal: 5
  },
  filterButtonActive: { backgroundColor: '#007aff' },
  filterText: { color: '#000' },
  filterTextActive: { color: '#fff' }
});

export default HomeScreen;
