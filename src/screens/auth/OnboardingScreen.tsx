import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { CaretCircleRight } from "phosphor-react-native";
import { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "../../components/ui/AppButton";
import { RootStackParamList } from "../../types";
import { useSplitPayTheme } from "../../theme/ThemeProvider";
import { motion } from "../../theme/motion";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

const { width: SCREEN_W } = Dimensions.get("window");

const SLIDES = [
  {
    key: "split",
    title: "Split bills without chasing anyone",
    body: "Create a split, add friends, everyone pays their share. No more “I forgot.”",
    mesh: ["#0A4D3C", "#14B8A6", "#1A6B52"] as const,
    image:
      "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "ajo",
    title: "Digital ajo, zero trust issues",
    body: "Set contribution, invite members, auto-reminders. Everyone sees who paid. No scams.",
    mesh: ["#064E3B", "#0D9488", "#065F46"] as const,
    image:
      "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "vendor",
    title: "Offer pay-in-4 to your customers",
    body: "Generate a link in 30 seconds. You get full payment now, they pay over time.",
    mesh: ["#14532D", "#F59E0B", "#0A4D3C"] as const,
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
  },
] as const;

export function OnboardingScreen({ navigation }: Props) {
  const { colors, typography, spacing, radius } = useSplitPayTheme();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.background },
        mesh: { ...StyleSheet.absoluteFillObject },
        header: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          paddingHorizontal: spacing.mdL,
          paddingTop: insets.top + spacing.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        brand: { ...typography.h3, color: colors.textInverse, fontWeight: "800" },
        brandPill: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          borderRadius: 999,
          backgroundColor: "rgba(0,0,0,0.32)",
        },
        skip: { ...typography.caption, color: "rgba(255,255,255,0.75)", fontWeight: "600" },
        pagerWrap: { flex: 1 },
        slide: {
          width: SCREEN_W,
          paddingHorizontal: 0,
          paddingTop: 0,
          alignItems: "center",
          gap: 0,
        },
        artCard: {
          width: SCREEN_W,
          flex: 1,
          borderRadius: 0,
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
        },
        artImage: {
          width: "100%",
          height: "100%",
        },
        sheet: {
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          paddingHorizontal: spacing.mdL,
          paddingTop: spacing.xl,
          paddingBottom: spacing.xxl + spacing.md,
          minHeight: SCREEN_W * 0.42,
          backgroundColor: colors.surface,
          gap: spacing.sm,
        },
        title: {
          ...typography.h1,
          color: colors.textPrimary,
          textAlign: "center",
          marginTop: spacing.sm,
        },
        bodyText: {
          ...typography.bodyLarge,
          color: colors.textSecondary,
          textAlign: "center",
          lineHeight: 24,
          marginBottom: spacing.md,
        },
        dotsRow: {
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          marginTop: spacing.xs,
        },
        dot: {
          height: 8,
          borderRadius: 999,
          backgroundColor: colors.primaryMuted,
        },
        dotActive: {
          width: 20,
          backgroundColor: colors.primary,
          height: 8,
          borderRadius: 999,
        },
        footerNote: {
          ...typography.small,
          color: colors.textMuted,
          textAlign: "center",
          paddingHorizontal: spacing.md,
          marginBottom: spacing.xs,
        },
        actionsRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          marginBottom: spacing.sm,
        },
        backBtn: {
          flex: 0.35,
        },
        nextBtn: {
          flex: 0.65,
        },
      }),
    [colors, insets.top, radius, spacing, typography],
  );

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / SCREEN_W);
    setIndex(Math.min(SLIDES.length - 1, Math.max(0, i)));
  };

  const SlideArt = ({ i }: { i: number }) => {
    const imageUri = SLIDES[i]?.image;
    return (
      <View style={[styles.artCard, { backgroundColor: "rgba(255,255,255,0.06)" }]}>
        <Image source={{ uri: imageUri }} style={styles.artImage} resizeMode="cover" />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={SLIDES[index].mesh} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mesh} />

      <SafeAreaView style={styles.root} edges={["bottom"]}>
        <View style={styles.header}>
          <View style={styles.brandPill}>
            <Text style={styles.brand}>SplitPay</Text>
          </View>
          <CaretCircleRight size={34} weight="duotone" color="#FFFFFF90" />
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          ref={scrollRef}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
          style={styles.pagerWrap}
        >
          {SLIDES.map((slide, i) => (
            <Animated.View
              entering={FadeInRight.duration(motion.normal).delay(i * 40)}
              key={slide.key}
              style={styles.slide}
            >
              <SlideArt i={i} />
            </Animated.View>
          ))}
        </ScrollView>

        <View style={styles.sheet}>
          <Text style={styles.title}>{SLIDES[index]?.title}</Text>
          <Text style={styles.bodyText}>{SLIDES[index]?.body}</Text>

          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View key={i} style={i === index ? styles.dotActive : [styles.dot, { width: 8 }]} />
            ))}
          </View>

          <View style={styles.actionsRow}>
            <View style={styles.backBtn}>
              <AppButton
                label="Back"
                variant="secondary"
                onPress={() => {
                  if (index > 0) {
                    scrollRef.current?.scrollTo({ x: SCREEN_W * (index - 1), animated: true });
                  }
                }}
                disabled={index === 0}
              />
            </View>
            <View style={styles.nextBtn}>
              <AppButton
                label={index < SLIDES.length - 1 ? "Continue" : "Get Started"}
                onPress={() => {
                  if (index < SLIDES.length - 1) {
                    scrollRef.current?.scrollTo({ x: SCREEN_W * (index + 1), animated: true });
                  } else {
                    navigation.navigate("PhoneAuth");
                  }
                }}
              />
            </View>
          </View>
          <Text style={styles.footerNote}>By continuing you agree to our Terms & Privacy.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
