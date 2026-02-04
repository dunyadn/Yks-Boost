import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { EXPO_PUBLIC_DOMAIN } from '@env';

const PDFUploadScreen = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (result.type === 'success') {
        // Validate domain
        if (!EXPO_PUBLIC_DOMAIN) {
          throw new Error('EXPO_PUBLIC_DOMAIN is not defined. Please check your environment variables.');
        }
        setFile(result);
        setError(''); // Clear any previous error
      } else {
        setError('Document selection was not successful.');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload PDF</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Select PDF" onPress={handleUpload} />
      {file && <Text style={styles.fileName}>Selected file: {file.name}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
  fileName: {
    marginTop: 20,
    fontSize: 18,
  },
});

export default PDFUploadScreen;