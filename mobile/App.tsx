/**
 * Adventure Management Platform - Mobile Application
 *
 * Main entry point for React Native mobile app
 */

import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/store';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    flex: 1,
  };

  return (
    <Provider store={store}>
      <NavigationContainer>
        <SafeAreaView style={backgroundStyle}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <View style={styles.container}>
            <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
              🗺️ Adventure Platform
            </Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? '#ccc' : '#666' }]}>
              Mobile app scaffold ready!
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>✅ React Native 0.73</Text>
              <Text style={styles.infoText}>✅ TypeScript</Text>
              <Text style={styles.infoText}>✅ Redux Toolkit</Text>
              <Text style={styles.infoText}>✅ React Navigation</Text>
              <Text style={styles.infoText}>✅ React Native Maps</Text>
              <Text style={styles.infoText}>✅ Geolocation Services</Text>
            </View>
            <Text style={styles.nextSteps}>
              Next steps:{'\n'}
              1. Implement authentication screens{'\n'}
              2. Create quest browsing UI{'\n'}
              3. Build GPS tracking features{'\n'}
              4. Add camera for checkpoints{'\n'}
              5. Integrate with backend API
            </Text>
          </View>
        </SafeAreaView>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#2563eb',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  nextSteps: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
    lineHeight: 22,
  },
});

export default App;
