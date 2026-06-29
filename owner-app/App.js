import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  // Script to instantly kill the PWA "Add to Home Screen" banner
  const hidePWABannerScript = `
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
    });
    true;
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9e7d3" />
      <WebView
        // Keep your live Vercel URL here!
        source={{ uri: 'https://www.livinggo.in/owner' }} 
        style={styles.webview}
        startInLoadingState={true}
        showsVerticalScrollIndicator={false}
        
        // FIX 1: Spoof the User Agent so Google Sign-In allows access
        userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"
        
        // FIX 2: Inject the script to hide the PWA banner
        injectedJavaScript={hidePWABannerScript}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9e7d3',
  },
  webview: {
    flex: 1,
  },
});