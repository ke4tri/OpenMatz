import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomTimePicker from "./CustomTimePicker";


export type TimeBlock = {
  day: string;
  startTime: string;
  endTime: string;
  note?: string;
};

type Props = {
  label: string;
  blocks: TimeBlock[];
  setBlocks: (blocks: TimeBlock[]) => void;
};

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TimeBlockPicker: React.FC<Props> = ({ label, blocks, setBlocks }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());
  const [note, setNote] = useState("");
  const [pickerMode, setPickerMode] = useState<"start" | "end" | null>(null);
  const [startConfirmed, setStartConfirmed] = useState(false);
  const [endConfirmed, setEndConfirmed] = useState(false);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const openPicker = (mode: "start" | "end") => {
    setTempTime(mode === "start" ? startTime : endTime);
    setPickerMode(mode);
  };

  const confirmPicker = () => {
    const snappedTime = new Date(tempTime);
    const minutes = snappedTime.getMinutes();
    const snappedMinutes = minutes < 15 ? 0 : minutes < 45 ? 30 : 0;
  
    // If rounding up to 0, also bump the hour forward
    if (minutes >= 45) {
      snappedTime.setHours(snappedTime.getHours() + 1);
    }
  
    snappedTime.setMinutes(snappedMinutes);
    snappedTime.setSeconds(0);
  
    if (pickerMode === "start") {
      setStartTime(snappedTime);
      setStartConfirmed(true);
    } else if (pickerMode === "end") {
      setEndTime(snappedTime);
      setEndConfirmed(true);
    }
  
    setPickerMode(null);
  };
  

  const addBlock = () => {
    const newBlock: TimeBlock = {
      day: selectedDay,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      note: note.trim(),
    };
    setBlocks([...blocks, newBlock]);
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedDay("Monday");
    setStartTime(new Date());
    setEndTime(new Date());
    setNote("");
    setStartConfirmed(false);
    setEndConfirmed(false);
    setPickerMode(null);
  };

  const removeBlock = (index: number) => {
    const updated = [...blocks];
    updated.splice(index, 1);
    setBlocks(updated);
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.label}>{label}</Text>

      <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
        {[...blocks]
          .sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day))
          .map((item, index) => (
            <View key={index} style={styles.block}>
              <View style={{ flex: 1 }}>
                <Text style={styles.blockText}>
                  {item.day}: {item.startTime} - {item.endTime}
                  {item.note ? ` (${item.note})` : ""}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeBlock(index)}>
                <Text style={styles.remove}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>Add Time</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Select Day:</Text>
            {daysOfWeek.map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                style={[styles.dayOption, day === selectedDay && styles.selectedDay]}
              >
                <Text>{day}</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.label}>Start Time:</Text>
            <TouchableOpacity onPress={() => openPicker("start")}>
              <Text style={[styles.timeInput, pickerMode === "start" && styles.activeTime]}>
                {formatTime(startTime)}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>End Time:</Text>
            <TouchableOpacity onPress={() => openPicker("end")}>
              <Text style={[styles.timeInput, pickerMode === "end" && styles.activeTime]}>
                {formatTime(endTime)}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Note (optional):</Text>
            <TextInput
              placeholder="e.g. Kids class or Gi"
              value={note}
              onChangeText={setNote}
              style={styles.noteInput}
              placeholderTextColor="#888"
            />

{!pickerMode && (
  <View style={styles.modalButtons}>
    <TouchableOpacity
      style={styles.modalButton}
      onPress={() => setModalVisible(false)}
    >
      <Text style={styles.modalButtonText}>Cancel</Text>
    </TouchableOpacity>

    {startConfirmed && endConfirmed && (
      <TouchableOpacity style={styles.modalButton} onPress={addBlock}>
        <Text style={styles.modalButtonText}>Add</Text>
      </TouchableOpacity>
    )}
  </View>
)}


            <CustomTimePicker
              visible={!!pickerMode}
              initialDate={tempTime}
              onCancel={() => setPickerMode(null)}
              onConfirm={(date) => {
                if (pickerMode === "start") {
                  setStartTime(date);
                  setStartConfirmed(true);
                } else if (pickerMode === "end") {
                  setEndTime(date);
                  setEndConfirmed(true);
                }
                setPickerMode(null);
              }}
              
            />

            {pickerMode && (
              <TouchableOpacity
                style={[styles.modalButton, { alignSelf: "center" }]}
                onPress={confirmPicker}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: { fontWeight: "bold", fontSize: 16, marginBottom: 6 },
  block: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  blockText: { fontSize: 14 },
  remove: { color: "red" },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  dayOption: {
    padding: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
  },
  selectedDay: {
    backgroundColor: "#cce5ff",
    borderColor: "#007AFF",
  },
  timeInput: {
    fontSize: 16,
    padding: 8,
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
    borderRadius: 5,
    textAlign: "center",
  },
  activeTime: {
    backgroundColor: "#ccf5cc",
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  modalButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 6,
    minWidth: 100,
    alignItems: "center",
    marginTop: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default TimeBlockPicker;

