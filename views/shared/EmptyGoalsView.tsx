import { AddGoalModal } from "@/components/modals/AddGoalModal";
import { Spacings } from "@/constants/Theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedButton } from "../../components/ThemedButton";
import { ThemedText } from "../../components/ThemedText";

export const EmptyGoalsView = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  return (
    <View style={styles.container}>
      <View
        style={[
          {
            width: "100%",
            alignItems: "center",
            gap: Spacings.md,
          },
        ]}
      >
        <Image
          source={require("@/assets/images/empty-goals.png")}
          style={{ width: 200, height: 200, marginBottom: 16 }}
          contentFit="contain"
        />
        <View style={{ gap: Spacings.sm }}>
          <ThemedText style={styles.title}>No goals found</ThemedText>
          <ThemedText style={styles.description}>
            You can add a new goal or explore some goals from the community
          </ThemedText>
          <ThemedButton
            variant="solid"
            title="Explore goals"
            onPress={() =>
              router.push({
                pathname: "/(tabs)/goals",
                params: { activeTab: "explore" },
              })
            }
            icon="magnifyingglass"
            iconSize={20}
            style={{
              marginTop: Spacings.sm,
            }}
          />
        </View>
      </View>

      <ThemedButton
        variant="outline"
        title="Add a new goal"
        onPress={() => setShowEditModal(true)}
        icon="plus.circle"
        iconSize={20}
        style={{
          marginTop: "auto",
        }}
      />

      <AddGoalModal
        isVisible={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
        onUpsertSuccess={() => {
          setShowEditModal(false);
        }}
        onDeleteSuccess={() => {
          setShowEditModal(false);
          router.back();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacings.md,
  },
  title: { fontSize: 16, fontWeight: "600" },
  description: { fontSize: 14, opacity: 0.7 },
});
