import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { lightPalette } from "../theme/palette";

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("App render error", error);
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            SplitPay hit an unexpected issue. Tap retry to continue.
          </Text>
          <Pressable accessibilityRole="button" onPress={this.reset} style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}>
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightPalette.background,
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: { fontSize: 22, fontWeight: "700", color: lightPalette.textPrimary },
  subtitle: { fontSize: 14, lineHeight: 21, color: lightPalette.textSecondary },
  retry: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: lightPalette.primary,
    marginTop: 8,
  },
  retryPressed: { opacity: 0.92 },
  retryLabel: { fontSize: 16, fontWeight: "600", color: lightPalette.textInverse },
});
