import { Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import Slider from "@react-native-community/slider";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect } from "react";
import { View } from "react-native";
import { ThemedButton } from "./ThemedButton";
import { ThemedText } from "./ThemedText";

type Props = {
  uri: string;
  autoPlay?: boolean;
  onPlay?: (currentTime: number) => void;
  onPause?: (currentTimeInSeconds: number) => void;
  onComplete?: (totalPlayTimeInSeconds: number) => void;
};

export const AudioPlayer = ({ uri, autoPlay, onPlay, onPause, onComplete }: Props) => {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const text = useThemeColor({}, "text");
  const accent = useThemeColor({}, "accent");
  const tint = useThemeColor({}, "tint");

  useEffect(() => {
    if (autoPlay) {
      player.play();
      onPlay?.(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, uri]);

  useEffect(() => {
    if (status.didJustFinish) {
      onComplete?.(status.duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleSeek = (value: number) => {
    player.seekTo(value);
  };

  const renderDurationString = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  return (
    <View style={{ gap: Spacings.lg }}>
      <Slider
        style={{ flex: 1 }}
        minimumValue={0}
        maximumValue={player.duration > 0 ? player.duration : 0}
        value={status.currentTime}
        onSlidingComplete={handleSeek}
        minimumTrackTintColor={accent}
        maximumTrackTintColor={text}
        thumbTintColor={tint}
      />

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacings.sm }}>
        <ThemedText type="caption">{renderDurationString(status.currentTime)}</ThemedText>
        <ThemedText type="caption">{renderDurationString(status.duration)}</ThemedText>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: Spacings.sm, marginHorizontal: "auto" }}>
        <ThemedButton
          variant="ghost"
          icon={status.didJustFinish ? "arrow.trianglehead.clockwise" : status.playing ? "pause.circle" : "play.circle"}
          iconSize={36}
          onPress={() => {
            if (status.didJustFinish) {
              player.seekTo(0);
              player.play();
              onPlay?.(0);
            } else if (status.playing) {
              player.pause();
              onPause?.(player.currentTime);
            } else {
              player.play();
              onPlay?.(player.currentTime);
            }
          }}
        />
      </View>
    </View>
  );
};
