import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView} from "react-native";

type Props = {
  visible: boolean;
  initialDate: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

export default function CustomTimePicker({ visible, initialDate, onConfirm, onCancel }: Props) {
  const [hour, setHour] = useState(initialDate.getHours() % 12 || 12);
  const [minute, setMinute] = useState(initialDate.getMinutes() >= 30 ? 30 : 0);
  const [ampm, setAmpm] = useState(initialDate.getHours() >= 12 ? "PM" : "AM");

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 30];
  const ampmOptions = ["AM", "PM"];

  const applySelection = () => {
    let h = hour % 12;
    if (ampm === "PM") h += 12;
    const finalDate = new Date();
    finalDate.setHours(h);
    finalDate.setMinutes(minute);
    finalDate.setSeconds(0);
    onConfirm(finalDate);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.column}>
            <Text style={styles.label}>Hour</Text>
            <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center" }}
            style={styles.wheel}
            >
            {hours.map((item) => (
                <TouchableOpacity key={item} onPress={() => setHour(item)}>
                <Text style={[styles.wheelItem, hour === item && styles.selected]}>{item}</Text>
                </TouchableOpacity>
            ))}
            </ScrollView>


          </View>

          <View style={styles.column}>
            <Text style={styles.label}>Min</Text>
            {minutes.map((m) => (
              <TouchableOpacity key={m} onPress={() => setMinute(m)}>
                <Text style={[styles.item, minute === m && styles.selected]}>
                  {m.toString().padStart(2, "0")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>AM/PM</Text>
            {ampmOptions.map((opt) => (
              <TouchableOpacity key={opt} onPress={() => setAmpm(opt)}>
                <Text style={[styles.item, ampm === opt && styles.selected]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancelButton]}>
                <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={applySelection} style={[styles.button, styles.confirmButton]}>
                <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
  },
  pickerContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    justifyContent: "space-around",
  },
  column: {
    alignItems: "center",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  item: {
    fontSize: 18,
    paddingVertical: 6,
  },
  selected: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 24,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  cancel: {
    color: "red",
    fontSize: 16,
  },
  confirm: {
    color: "#007AFF",
    fontSize: 16,
  },wheel: {
    height: 150, // adjust based on desired visible items
  },
  wheelItem: {
    fontSize: 22,
    paddingVertical: 10,
    color: "#555",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  
  cancelButton: {
    backgroundColor: "#ccc",
  },
  
  confirmButton: {
    backgroundColor: "#007AFF",
  },
  
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  
});
