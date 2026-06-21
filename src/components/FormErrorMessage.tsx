import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FormErrorMessageProps {
  message?: string;
}

export function FormErrorMessage({ message }: FormErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3F3',
    borderColor: '#FFD6D6',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
  },
  text: {
    color: '#C62828',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});
