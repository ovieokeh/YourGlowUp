import Slider from "@react-native-community/slider";
import { useVideoPlayer, VideoView } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useEffect } from "react";
import { FlexStyle, View } from "react-native";

import { Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useEvent, useEventListener } from "expo";
import { Image } from "expo-image";
import { ThemedButton } from "./ThemedButton";
import { ThemedText } from "./ThemedText";

type Props = {
  uri: string;
  width: FlexStyle["width"];
  height: FlexStyle["height"];
  autoPlay?: boolean;
  onPlay?: (currentTime: number) => void;
  onPause?: (currentTimeInSeconds: number) => void;
  onComplete?: (totalPlayTimeInSeconds: number) => void;
};

export const VideoPreviewPlayer = ({ uri, width, height, autoPlay, onPlay, onPause, onComplete }: Props) => {
  const [thumbnail, setThumbnail] = React.useState<string | null>(null);
  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(uri, {
          time: 0,
          quality: 1,
        });
        setThumbnail(thumbnailUri);
      } catch (error) {
        console.error("Error generating thumbnail:", error);
      }
    };
    generateThumbnail();
  }, [uri]);

  const [elapsedTime, setElapsedTime] = React.useState(0);
  const player = useVideoPlayer(uri);
  const playerStatus = useEvent(player, "playingChange", { isPlaying: player.playing });
  const playerUpdates = useEvent(player, "statusChange", { status: player.status });
  useEventListener(player, "timeUpdate", (payload) => {
    setElapsedTime(payload.currentTime);
  });

  useEffect(() => {
    if (autoPlay) {
      player.play();
      onPlay?.(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, uri]);

  useEffect(() => {
    if (elapsedTime === player.duration) {
      onComplete?.(elapsedTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedTime, player.duration]);

  const text = useThemeColor({}, "text");
  const accent = useThemeColor({}, "accent");
  const tint = useThemeColor({}, "tint");

  const handleSeek = (value: number) => {
    player.seekBy(value);
  };

  const formatTime = (totalSeconds: number) => {
    const validSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(validSeconds / 60);
    const seconds = Math.floor(validSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <View style={[{ gap: Spacings.md }]}>
      {playerUpdates.status === "loading" ? (
        thumbnail ? (
          <Image source={{ uri: thumbnail }} style={{ width, height }} contentFit="cover" />
        ) : (
          <View style={{ width, height, borderRadius: 8 }}>
            <ThemedText type="caption" style={{ textAlign: "center" }}>
              Loading...
            </ThemedText>
          </View>
        )
      ) : (
        <VideoView style={{ width, height }} player={player} allowsFullscreen allowsPictureInPicture />
      )}

      <Slider
        style={{ flex: 1 }}
        minimumValue={0}
        maximumValue={player.duration > 0 ? player.duration : 0}
        value={elapsedTime ?? 0}
        onSlidingComplete={handleSeek}
        minimumTrackTintColor={accent}
        maximumTrackTintColor={text}
        thumbTintColor={tint}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: Spacings.sm }}>
        <ThemedText type="caption">{formatTime(player.currentTime)}</ThemedText>
        <ThemedText type="caption">{formatTime(player.duration)}</ThemedText>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: Spacings.sm, marginHorizontal: "auto" }}>
        <ThemedButton
          variant="ghost"
          icon={
            playerUpdates.status === "idle"
              ? "arrow.trianglehead.clockwise"
              : playerStatus.isPlaying
              ? "pause.circle"
              : playerUpdates.status === "readyToPlay"
              ? "play.circle"
              : "hourglass"
          }
          iconSize={36}
          onPress={() => {
            if (playerUpdates.status === "idle") {
              player.seekBy(0);
              player.play();
              onPlay?.(0);
            } else if (playerStatus.isPlaying) {
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
