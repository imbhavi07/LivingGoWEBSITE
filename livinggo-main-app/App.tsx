import { StyleSheet, Platform, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MainApp() {
  return (
    <SafeAreaView style={styles.container}>
      <WebView 
        source={{ uri: 'https://www.livinggo.in/' }} 
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
    backgroundColor: '#f9e7d3',
  },
  webview: {
    flex: 1,
  },
});