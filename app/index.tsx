import React, { useCallback } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useColors } from "@/hooks/useColors";
import { useTodos, Todo } from "@/contexts/TodoContext";
import TaskItem from "@/components/TaskItem";
import AddTaskBar from "@/components/AddTaskBar";

function ProgressBar({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const colors = useColors();
  const pct = total === 0 ? 0 : completed / total;

  return (
    <View
      style={[styles.progressTrack, { backgroundColor: colors.progressBg }]}
    >
      <View
        style={[
          styles.progressFill,
          {
            backgroundColor: colors.primary,
            width: `${Math.round(pct * 100)}%` as unknown as number,
          },
        ]}
      />
    </View>
  );
}

function EmptyState() {
  const colors = useColors();
  return (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyIcon, { color: colors.border }]}>
        ◎
      </Text>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
        Bugün ne yapacaksın?
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
        Görevlerini ekle ve gününü planla
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { todos, addTodo, toggleTodo, deleteTodo, todayLabel, completedCount, totalCount } =
    useTodos();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const renderItem = useCallback(
    ({ item }: { item: Todo }) => (
      <TaskItem todo={item} onToggle={toggleTodo} onDelete={deleteTodo} />
    ),
    [toggleTodo, deleteTodo]
  );

  const keyExtractor = useCallback((item: Todo) => item.id, []);

  const allDone = totalCount > 0 && completedCount === totalCount;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {allDone ? "Muhteşem, her şey tamam!" : "Bugünün listesi"}
            </Text>
            <Text style={[styles.dateLabel, { color: colors.foreground }]}>
              {todayLabel}
            </Text>
          </View>
          <View
            style={[styles.badge, { backgroundColor: colors.primary + "18" }]}
          >
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {completedCount}/{totalCount}
            </Text>
          </View>
        </View>

        {totalCount > 0 && (
          <ProgressBar completed={completedCount} total={totalCount} />
        )}
      </View>

      <FlatList
        data={todos}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={EmptyState}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <AddTaskBar onAdd={addTodo} />
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        Bu uygulama Yüksel Uysal tarafından geliştirilmiştir
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    textTransform: "capitalize",
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  footer: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 8,
  },
});
