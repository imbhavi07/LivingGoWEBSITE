import { StyleSheet, Platform, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

export default function VisitingApp() {
  return (
    <SafeAreaView style={styles.container}>
      <WebView 
        source={{ uri: 'https://www.livinggo.in/visiting' }} 
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={Platform.OS === 'android'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Matches your web app's background
  },
  webview: {
    flex: 1,
  },
});