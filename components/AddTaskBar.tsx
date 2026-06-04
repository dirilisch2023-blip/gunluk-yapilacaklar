import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Priority, PRIORITY_COLORS, PRIORITY_LABELS } from "@/contexts/TodoContext";

interface Props {
  onAdd: (text: string, priority: Priority) => void;
}

const PRIORITIES: Priority[] = ["high", "medium", "low"];

export default function AddTaskBar({ onAdd }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed, priority);
    setText("");
    setPriority("medium");
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: bottomPad + 8,
        },
      ]}
    >
      <View style={styles.priorityRow}>
        {PRIORITIES.map((p) => {
          const selected = priority === p;
          const color = PRIORITY_COLORS[p];
          return (
            <TouchableOpacity
              key={p}
              onPress={() => setPriority(p)}
              style={[
                styles.priorityBtn,
                {
                  backgroundColor: selected ? color : color + "18",
                  borderColor: selected ? color : "transparent",
                },
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: selected ? "#fff" : color },
                ]}
              />
              <Text
                style={[
                  styles.priorityLabel,
                  { color: selected ? "#fff" : color },
                ]}
              >
                {PRIORITY_LABELS[p]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <Feather
          name="plus"
          size={18}
          color={colors.mutedForeground}
          style={styles.plusIcon}
        />
        <TextInput
          style={[
            styles.input,
            { color: colors.foreground, fontFamily: "Inter_400Regular" },
          ]}
          placeholder="Yeni görev ekle..."
          placeholderTextColor={colors.mutedForeground}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        {text.trim().length > 0 && (
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.sendBtn,
              { backgroundColor: PRIORITY_COLORS[priority] },
            ]}
            activeOpacity={0.8}
          >
            <Feather name="arrow-up" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
  },
  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  priorityLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 8,
    gap: 8,
  },
  plusIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 2,
  },
  sendBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
