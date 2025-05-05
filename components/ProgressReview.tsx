import Slider from "@react-native-community/slider";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedButton } from "./ThemedButton";
import { ThemedPicker } from "./ThemedPicker";
import { ThemedText } from "./ThemedText";

const { width: SCREEN_W } = Dimensions.get("window");
const GRID_SIZE = SCREEN_W * 0.9; // 90% of screen width
const FRAME_RATE_OPTIONS = [
  { label: "0.5×", value: "2000" },
  { label: "1×", value: "1000" },
  { label: "2×", value: "500" },
];

type Props = {
  photoURIs: string[];
};

export const ProgressReview: React.FC<Props> = ({ photoURIs }) => {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fpsInterval, setFpsInterval] = useState(1000);
  const containerRef = useRef<View>(null);
  const timer = useRef<number | null>(null);

  const background = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");

  // Auto-scrub control
  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setCurrent((i) => (i + 1) % photoURIs.length);
      }, fpsInterval);
    } else {
      timer.current && clearInterval(timer.current);
    }
    return () => {
      timer.current && clearInterval(timer.current);
    };
  }, [playing, fpsInterval, photoURIs.length]);

  // Preload next image
  useEffect(() => {
    const next = (current + 1) % photoURIs.length;
    if (!photoURIs[next]) return;
    Image.prefetch(photoURIs[next]);
  }, [current, photoURIs]);

  if (!photoURIs?.length)
    return (
      <View style={{ gap: 16, width: "100%" }}>
        <ThemedText type="subtitle">No photos available</ThemedText>

        <ThemedText type="default">
          Please take some photos to review your progress. You can do this by adding a self-report log and including a
          progress photo.
        </ThemedText>
      </View>
    );

  return (
    <View style={{ backgroundColor: background, width: "100%" }}>
      <View style={[styles.wrapper, { backgroundColor: background }]} ref={containerRef}>
        {/* Center-cropped photo */}
        {!!photoURIs[current] && <Image source={{ uri: photoURIs[current] }} style={styles.photo} resizeMode="cover" />}

        {/* Static grid */}
        <Image source={require("@/assets/images/grid.png")} style={styles.grid} resizeMode="cover" />

        {/* Controls */}
      </View>
      <View style={styles.controls}>
        <ThemedButton
          icon={playing ? "pause.fill" : "play.fill"}
          title=""
          onPress={() => setPlaying((p) => !p)}
          variant="ghost"
          style={styles.button}
        />

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={photoURIs.length - 1}
          step={1}
          value={current}
          onValueChange={setCurrent}
          minimumTrackTintColor={border}
          maximumTrackTintColor={border}
        />

        <ThemedPicker
          items={FRAME_RATE_OPTIONS}
          selectedValue={fpsInterval.toString()}
          onValueChange={(v) => setFpsInterval(+v)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    alignSelf: "center",
    overflow: "hidden",
  },
  grid: {
    position: "absolute",
    width: GRID_SIZE,
    height: GRID_SIZE,
    opacity: 0.4,
  },
  photo: {
    paddingTop: 8,
    position: "absolute",
    width: GRID_SIZE,
    height: GRID_SIZE,
  },
  controls: {
    marginTop: "auto",
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  button: {
    padding: 8,
    marginHorizontal: 4,
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  picker: {
    width: 100,
    height: 44,
  },
});
