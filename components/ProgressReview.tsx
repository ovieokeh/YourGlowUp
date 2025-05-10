import Slider from "@react-native-community/slider";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

import { Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { PhotoLog } from "@/queries/logs/logs";
import { ThemedButton } from "./ThemedButton";
import { ThemedPicker } from "./ThemedPicker";
import { ThemedText } from "./ThemedText";

const { width: SCREEN_W } = Dimensions.get("window");
const GRID_SIZE = SCREEN_W * 0.9;
const FRAME_RATE_OPTIONS = [
  { label: "0.5×", value: "2000" },
  { label: "1×", value: "1000" },
  { label: "2×", value: "500" },
];

type Props = {
  photoLogs: PhotoLog[];
};

const PhotoProgressScroll = ({
  photos,
}: {
  photos: {
    uri: string;
    transform?: {
      x: number;
      y: number;
      scale: number;
    };
  }[];
}) => {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fpsInterval, setFpsInterval] = useState(1000);
  const [showGrid, setShowGrid] = useState(true);
  const containerRef = useRef<View>(null);
  const timer = useRef<number | null>(null);

  const background = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");

  useEffect(() => {
    const next = (current + 1) % photos.length;
    if (!photos[next]) return;
    Image.prefetch(photos[next].uri);
  }, [current, photos]);

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setCurrent((i) => (i + 1) % photos.length);
      }, fpsInterval);
    } else {
      timer.current && clearInterval(timer.current);
    }
    return () => {
      timer.current && clearInterval(timer.current);
    };
  }, [playing, fpsInterval, photos.length]);

  return (
    <View style={{ backgroundColor: background, width: "100%" }}>
      <View style={[styles.wrapper, { backgroundColor: background }]} ref={containerRef}>
        {!!photos[current] && (
          <Image
            source={{ uri: photos[current].uri }}
            style={[
              styles.photo,
              {
                transform: [
                  { scale: Math.min(photos[current].transform?.scale || 1, 1) },
                  { translateX: photos[current].transform?.x || 0 },
                  { translateY: photos[current].transform?.y || 0 },
                ],
              },
            ]}
            resizeMode="cover"
          />
        )}
        {showGrid && <Image source={require("@/assets/images/grid.png")} style={styles.grid} resizeMode="cover" />}
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
          maximumValue={photos.length - 1}
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

        <ThemedButton
          icon={showGrid ? "eye.slash" : "eye"}
          title=""
          onPress={() => setShowGrid((g) => !g)}
          variant="ghost"
          style={styles.button}
        />
      </View>
    </View>
  );
};

export const ProgressReview: React.FC<Props> = ({ photoLogs }) => {
  const background = useThemeColor({}, "background");
  const [currentTab, setCurrentTab] = useState<"left" | "right" | "front">("front");

  const leftPhotos = photoLogs
    .map((log) => {
      const left = log.photos.left;
      return left;
    })
    .filter((photo) => !!photo);
  const rightPhotos = photoLogs
    .map((log) => {
      const right = log.photos.right;
      return right;
    })
    .filter((photo) => !!photo);
  const frontPhotos = photoLogs
    .map((log) => {
      const front = log.photos.front;
      return front;
    })
    .filter((photo) => !!photo);

  const label = currentTab === "left" ? "Left View" : currentTab === "right" ? "Right View" : "Front View";
  const photos = useMemo(
    () => (currentTab === "left" ? leftPhotos : currentTab === "right" ? rightPhotos : frontPhotos),
    [currentTab, leftPhotos, rightPhotos, frontPhotos]
  );

  return (
    <View style={{ backgroundColor: background, width: "100%", gap: Spacings.md }}>
      <View style={{ flexDirection: "row", gap: Spacings.md }}>
        <ThemedButton
          title="Left"
          onPress={() => setCurrentTab("left")}
          variant={currentTab === "left" ? "solid" : "outline"}
          active={currentTab === "left"}
        />
        <ThemedButton
          title="Front"
          onPress={() => setCurrentTab("front")}
          variant={currentTab === "front" ? "solid" : "outline"}
          active={currentTab === "front"}
        />
        <ThemedButton
          title="Right"
          onPress={() => setCurrentTab("right")}
          variant={currentTab === "right" ? "solid" : "outline"}
          active={currentTab === "right"}
        />
      </View>
      <View style={{ gap: Spacings.md }}>
        <ThemedText type="subtitle">{label}</ThemedText>
        {photos.length > 0 ? (
          <PhotoProgressScroll photos={photos} />
        ) : (
          <View style={{ gap: Spacings.md, width: "100%" }}>
            <ThemedText type="subtitle">No photos available</ThemedText>
            <ThemedText type="default">
              Please take some photos to review your progress. You can do this by adding a self-report log and including
              a progress photo.
            </ThemedText>
          </View>
        )}
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
    paddingTop: Spacings.sm,
    position: "absolute",
    width: GRID_SIZE,
    height: GRID_SIZE,
  },
  controls: {
    marginTop: "auto",
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacings.sm,
    paddingHorizontal: Spacings.md,
  },
  button: {
    padding: Spacings.sm,
    marginHorizontal: Spacings.xs,
  },
  slider: {
    flex: 1,
    marginHorizontal: Spacings.sm,
  },
  picker: {
    width: 100,
    height: 44,
  },
});
