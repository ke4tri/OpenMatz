// screens/AddGymScreen.tsx
import React, { useState} from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Switch,
  Text,
  Alert,
} from 'react-native';
import type { Gym } from '../types';

type AddGymScreenProps = {
  onAddGym: (gym: Gym) => void;
};

const AddGymScreen = ({ onAddGym }: AddGymScreenProps) => {

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    logo: '',
    latitude: '',
    longitude: '',
    openMatTimes: '',
    address: '',
    email: '',
    phone: '',
    approved: false,
  });
  

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.latitude || !formData.longitude) {
      Alert.alert("Missing required fields", "Name, latitude, and longitude are required.");
      return;
    }

    const newGym: Gym = {
      ...formData,
      id: Date.now().toString(),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      openMatTimes: formData.openMatTimes
        ? formData.openMatTimes.split(',').map(str => str.trim())
        : [],
    };

    onAddGym(newGym);
    Alert.alert("Success", "Gym submitted!");
    setFormData({
      name: '',
      city: '',
      state: '',
      logo: '',
      latitude: '',
      longitude: '',
      openMatTimes: '',
      address: '',
      email: '',
      phone: '',
      approved: false,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {Object.entries(formData).map(([key, val]) => {
        if (key === 'approved') return null;
        return (
            <TextInput
              key={key}
              placeholder={key}
              value={String(val)}
              onChangeText={(text) => handleChange(key, text)}
              style={styles.input}
            />
          );
          
      })}
      <View style={styles.switchRow}>
        <Text>Approved</Text>
        <Switch
          value={formData.approved}
          onValueChange={(value) =>
            setFormData(prev => ({ ...prev, approved: value }))
          }
        />
      </View>
      <Button title="Submit Gym" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default AddGymScreen;
