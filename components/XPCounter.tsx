import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Colors, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useBadges } from "@/providers/BadgeContext";
import { BadgeKey, BadgeLevel, BADGES, BadgeStatus, fetchUserXP } from "@/utils/gamification";

export const XPCounter = () => {
  const [xp, setXP] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState(false);
  const { badges } = useBadges();

  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accent = useThemeColor({}, "accent");
  const border = useThemeColor({}, "border");

  useEffect(() => {
    (async () => {
      const userXP = await fetchUserXP();
      setXP(userXP);
    })();
  }, []);

  const xpCounterUnit = useMemo(
    () => (
      <>
        <IconSymbol name="star.circle" size={18} color={accent} />
        <ThemedText style={[styles.xpText, { color: accent }]}>{xp} XP</ThemedText>
      </>
    ),
    [xp, accent]
  );

  console.log("XP Counter:", badges);

  return (
    <>
      <Pressable style={styles.counter} onPress={() => setModalVisible(true)}>
        {xpCounterUnit}
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" backdropColor={background}>
        <SafeAreaView>
          <View style={styles.modalHeader}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Spacings.xs,
              }}
            >
              <ThemedText type="title">Your Badges</ThemedText>
              {xpCounterUnit}
            </View>
            <Pressable onPress={() => setModalVisible(false)}>
              <IconSymbol name="arrow.down" size={28} color={textColor} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.badgeGrid}>
            {Object.values(BADGES)
              .sort((a, b) => {
                const aStatus = badges[a.id as BadgeKey]?.status;
                const bStatus = badges[b.id as BadgeKey]?.status;

                const aLevel = a.level;
                const bLevel = b.level;

                // Sort by earned status: EARNED badges come first
                if (aStatus === BadgeStatus.EARNED && bStatus !== BadgeStatus.EARNED) {
                  return -1;
                }
                if (aStatus !== BadgeStatus.EARNED && bStatus === BadgeStatus.EARNED) {
                  return 1;
                }

                // Then sort by level: BRONZE < SILVER < GOLD (GOLD appears last)
                const levelOrder: Record<BadgeLevel, number> = {
                  [BadgeLevel.BRONZE]: 0,
                  [BadgeLevel.SILVER]: 1,
                  [BadgeLevel.GOLD]: 2,
                  [BadgeLevel.PLATINUM]: 3,
                };

                return levelOrder[aLevel] - levelOrder[bLevel];
              })

              .map((badge) => {
                const earned = badges[badge.id as BadgeKey]?.status === BadgeStatus.EARNED;
                return (
                  <View key={badge.name} style={[styles.badgeItem, { opacity: earned ? 1 : 0.4, borderColor: border }]}>
                    <View style={styles.iconWrapper}>
                      <IconSymbol name={badge.icon} size={28} color={earned ? accent : border} />
                    </View>
                    <ThemedText type="defaultSemiBold" style={styles.badgeName} numberOfLines={1}>
                      {badge.name}
                    </ThemedText>
                    <ThemedText style={styles.badgeDesc}>{badge.description}</ThemedText>
                  </View>
                );
              })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  counter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacings.md,
    paddingVertical: 6,
    borderRadius: BorderRadii.md,
    borderWidth: 1,
    borderColor: Colors.light.accent,
    alignSelf: "flex-end",
    margin: Spacings.sm,
  },
  xpText: {
    marginLeft: 6,
    fontWeight: "600",
    lineHeight: 18,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacings.lg,
    paddingTop: Spacings.xl,
  },
  badgeGrid: {
    padding: Spacings.md,
    paddingBottom: 96,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacings.sm,
    justifyContent: "space-between",
  },
  badgeItem: {
    minWidth: "38%",
    flex: 1,
    padding: Spacings.md,
    borderRadius: BorderRadii.md,
    borderWidth: 1,
  },
  iconWrapper: {
    marginBottom: Spacings.sm,
    alignItems: "center",
  },
  badgeName: {
    textAlign: "center",
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
});
