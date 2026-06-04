import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Todo, PRIORITY_COLORS, PRIORITY_LABELS } from "@/contexts/TodoContext";

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ todo, onToggle, onDelete }: Props) {
  const colors = useColors();
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;
  const rowOpacity = useRef(new Animated.Value(1)).current;

  const priorityColor = PRIORITY_COLORS[todo.priority];

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) {
          translateX.setValue(Math.max(g.dx, -80));
          deleteOpacity.setValue(Math.min(-g.dx / 80, 1));
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -60) {
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -400,
              duration: 220,
              useNativeDriver: true,
            }),
            Animated.timing(rowOpacity, {
              toValue: 0,
              duration: 220,
              useNativeDriver: true,
            }),
          ]).start(() => onDelete(todo.id));
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          Animated.timing(deleteOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleToggle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle(todo.id);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.deleteHint, { opacity: deleteOpacity }]}>
        <Feather name="trash-2" size={20} color="#FFFFFF" />
      </Animated.View>
      <Animated.View
        style={[
          styles.row,
          {
            backgroundColor: todo.completed ? colors.completedBg : colors.card,
            borderColor: colors.border,
            transform: [{ translateX }],
            opacity: rowOpacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View
          style={[styles.priorityBar, { backgroundColor: priorityColor }]}
        />

        <TouchableOpacity
          onPress={handleToggle}
          style={[
            styles.checkbox,
            {
              borderColor: todo.completed ? colors.primary : colors.border,
              backgroundColor: todo.completed ? colors.primary : "transparent",
            },
          ]}
          activeOpacity={0.7}
        >
          {todo.completed && (
            <Feather name="check" size={13} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <View style={styles.textBlock}>
          <Text
            style={[
              styles.text,
              {
                color: todo.completed ? colors.completed : colors.foreground,
                textDecorationLine: todo.completed ? "line-through" : "none",
              },
            ]}
            numberOfLines={3}
          >
            {todo.text}
          </Text>
          <Text
            style={[
              styles.priorityTag,
              {
                color: todo.completed ? colors.mutedForeground : priorityColor,
              },
            ]}
          >
            {PRIORITY_LABELS[todo.priority]}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onDelete(todo.id)}
          style={styles.deleteBtn}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 10,
    position: "relative",
  },
  deleteHint: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 70,
    backgroundColor: "#FF3B30",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 12,
    paddingRight: 12,
    borderWidth: 1,
    gap: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  priorityBar: {
    width: 4,
    alignSelf: "stretch",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  text: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  priorityTag: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  deleteBtn: {
    padding: 2,
    flexShrink: 0,
  },
});
