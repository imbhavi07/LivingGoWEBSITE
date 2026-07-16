import React from 'react';
import { StyleSheet, View, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9e7d3" />
      
      <WebView 
        source={{ uri: 'https://www.livinggo.in/' }} 
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        /* These two lines trigger the smart native loader */
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#f9e7d3" />
          </View>
        )}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f9e7d3',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  }
});