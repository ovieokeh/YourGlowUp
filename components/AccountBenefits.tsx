import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { IconSymbol, IconSymbolName } from "./ui/IconSymbol";

const BENEFITS: {
  icon: IconSymbolName;
  title: string;
  desc: string;
}[] = [
  {
    icon: "arrow.triangle.2.circlepath.circle",
    title: "Sync Anywhere",
    desc: "Access your data on any device, seamlessly.",
  },
  {
    icon: "person.crop.circle.badge.checkmark",
    title: "AI Face Coach",
    desc: "Get tailored tips & tricks for your unique features.",
  },
  {
    icon: "clock.arrow.2.circlepath",
    title: "Track Progress",
    desc: "See side‑by‑side photo comparisons over time.",
  },
  {
    icon: "bell.badge",
    title: "Smart Reminders",
    desc: "Never miss a session with custom alerts.",
  },
  {
    icon: "star.circle",
    title: "Premium Content",
    desc: "Unlock exclusive exercises & deep‑dive tutorials.",
  },
  {
    icon: "person.3.sequence",
    title: "Community Challenges",
    desc: "Compete, share, and earn badges with peers.",
  },
];

export const AccountBenefits: React.FC = () => {
  const router = useRouter();
  const text = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");
  const tint = useThemeColor({}, "tint");
  const border = useThemeColor({}, "border");

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={[styles.heading, { color: text }]}>
        Unlock Your Full Potential
      </ThemedText>
      <ThemedText type="subtitle" style={[styles.subheading, { color: muted }]}>
        Create an account to enjoy all these perks:
      </ThemedText>

      <View style={styles.grid}>
        {BENEFITS.map((b) => (
          <BenefitCard key={b.title} benefit={b} tint={tint} text={text} muted={muted} border={border} />
        ))}
      </View>

      <ThemedButton title="Create Your Free Account" onPress={() => router.push("/auth")} style={styles.cta} />
    </View>
  );
};

type Benefit = (typeof BENEFITS)[number];
const BenefitCard: React.FC<{
  benefit: Benefit;
  tint: string;
  text: string;
  muted: string;
  border: string;
}> = ({ benefit, tint, text, muted }) => (
  <View style={[styles.card, { borderColor: tint, shadowColor: tint }]}>
    <IconSymbol name={benefit.icon} size={28} color={tint} style={styles.icon} />
    <View>
      <ThemedText style={[styles.cardTitle, { color: text }]}>{benefit.title}</ThemedText>
      <ThemedText style={[styles.cardDesc, { color: muted }]}>{benefit.desc}</ThemedText>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacings.lg,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacings.xs,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: Spacings.lg,
    lineHeight: 22,
  },
  grid: {},
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacings.md,
    marginBottom: Spacings.md,
    borderWidth: 1,
    borderRadius: BorderRadii.md,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: Spacings.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: 12,
    marginTop: Spacings.xs,
  },
  cta: {
    marginTop: Spacings.lg,
    paddingVertical: Spacings.md,
    borderRadius: BorderRadii.md,
    alignSelf: "center",
    paddingHorizontal: Spacings.xl,
  },
});
