import Slider from "@react-native-community/slider";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

import { MediaUploadLog } from "@/backend/shared";
import { Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
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
  mediaLogs: MediaUploadLog[];
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

export const ProgressReview: React.FC<Props> = ({ mediaLogs }) => {
  const background = useThemeColor({}, "background");
  const groupedMediaLogsByAltText = useMemo(() => {
    const grouped = mediaLogs.reduce((acc, log) => {
      const altText = log.media.altText || "No Alt Text";
      if (!acc[altText]) {
        acc[altText] = [];
      }
      acc[altText].push(log);
      return acc;
    }, {} as Record<string, MediaUploadLog[]>);
    return Object.entries(grouped).map(([key, value]) => ({
      label: key,
      photos: value,
    }));
  }, [mediaLogs]);
  const groupOptions = useMemo(
    () =>
      groupedMediaLogsByAltText.map((group) => ({
        label: group.label,
        value: group.label,
      })),
    [groupedMediaLogsByAltText]
  );
  const [selectedGroup, setSelectedGroup] = useState(groupOptions[0]?.value);
  const filteredGroups = useMemo(
    () => groupedMediaLogsByAltText.filter((group) => group.label === selectedGroup),
    [groupedMediaLogsByAltText, selectedGroup]
  );

  return (
    <View style={{ backgroundColor: background, width: "100%", gap: Spacings.md }}>
      <View style={{ flexDirection: "row", gap: Spacings.md }}>
        <ThemedPicker
          items={groupOptions}
          selectedValue={selectedGroup}
          onValueChange={(v) => setSelectedGroup(v)}
          style={styles.picker}
        />
      </View>
      <View style={{ gap: Spacings.md }}>
        {filteredGroups.map((group) => (
          <View key={group.label} style={{ gap: Spacings.sm }}>
            <ThemedText type="subtitle">{group.label}</ThemedText>
            <PhotoProgressScroll
              photos={group.photos.map((p) => ({
                uri: p.media.url,
                transform: p.meta?.transform,
              }))}
            />
          </View>
        ))}
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
