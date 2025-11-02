import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/constants';

interface MeasurementInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit?: string;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
}

export const MeasurementInput: React.FC<MeasurementInputProps> = ({
  label,
  value,
  onChangeText,
  unit,
  placeholder,
  error,
  keyboardType = 'numeric',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          placeholderTextColor={Colors.textTertiary}
        />
        {unit && (
          <View style={styles.unitContainer}>
            <Text style={styles.unit}>{unit}</Text>
          </View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  unitContainer: {
    paddingLeft: Spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
    marginLeft: Spacing.sm,
  },
  unit: {
    ...Typography.caption,
    color: Colors.textSecondary,
    paddingLeft: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    marginTop: Spacing.xs,
    fontSize: 12,
  },
});

