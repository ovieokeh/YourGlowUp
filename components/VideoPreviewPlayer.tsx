import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useVideoPlayer, VideoView } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlexStyle, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  uri: string;
  width: FlexStyle["width"];
  height: FlexStyle["height"];
  onPlay?: (currentTime: number) => void;
  onPause?: (currentTimeInSeconds: number) => void;
  onComplete?: (totalPlayTimeInSeconds: number) => void;
};

export const VideoPreviewPlayer = ({ uri, width, height, onPlay, onPause, onComplete }: Props) => {
  const [thumbUri, setThumbUri] = useState<string | undefined>(undefined);

  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false);

  const [totalPlayTimeSeconds, setTotalPlayTimeSeconds] = useState(0);

  const playSessionStartPlayerTimeRef = useRef<number>(0);

  const hasCompletedRef = useRef<boolean>(false);

  const [currentPositionForUI, setCurrentPositionForUI] = useState(0);
  const [durationForUI, setDurationForUI] = useState(0);

  const player = useVideoPlayer(uri, (status) => {
    if (status) {
      const newDuration = status.duration > 0 ? status.duration / 1000 : 0;
      const newPosition = status.currentTime >= 0 ? status.currentTime / 1000 : 0;

      if (durationForUI !== newDuration) {
        setDurationForUI(newDuration);
      }
      setCurrentPositionForUI(newPosition);

      const isEffectivelyFinished = newDuration > 0 && newPosition >= newDuration - 0.1;

      if (isEffectivelyFinished && !hasCompletedRef.current) {
        let finalTotalTime = totalPlayTimeSeconds;
        if (isActuallyPlaying) {
          const lastSessionDuration = newDuration - playSessionStartPlayerTimeRef.current;
          if (lastSessionDuration > 0) {
            finalTotalTime += lastSessionDuration;
          }
        }
        setTotalPlayTimeSeconds(finalTotalTime);
        onComplete?.(finalTotalTime);
        hasCompletedRef.current = true;
        setIsActuallyPlaying(false);
      }
    }
  });

  useEffect(() => {
    let isMounted = true;
    VideoThumbnails.getThumbnailAsync(uri, { time: 1000, quality: Platform.OS === "ios" ? 0.3 : 0.8 })
      .then(({ uri: t }) => {
        if (isMounted) {
          setThumbUri(t);
        }
      })
      .catch((err) => console.warn("VideoThumbnails.getThumbnailAsync Error:", err));

    return () => {
      isMounted = false;
    };
  }, [uri]);

  useEffect(() => {
    const playingListener = player.addListener("playingChange", (event) => {
      setIsActuallyPlaying(event.isPlaying);

      if (event.isPlaying) {
        if (hasCompletedRef.current) {
          setTotalPlayTimeSeconds(0);
          hasCompletedRef.current = false;
        }
        playSessionStartPlayerTimeRef.current = player.currentTime;
        onPlay?.(player.currentTime);
      } else {
        if (!hasCompletedRef.current && player.duration > 0 && player.currentTime < player.duration - 0.05) {
          const sessionDuration = player.currentTime - playSessionStartPlayerTimeRef.current;
          if (sessionDuration > 0) {
            setTotalPlayTimeSeconds((prevTotal) => prevTotal + sessionDuration);
          }
        }
        onPause?.(player.currentTime);
      }
    });

    setIsActuallyPlaying(player.playing);
    if (player.playing) {
      playSessionStartPlayerTimeRef.current = player.currentTime;
    }

    return () => {
      playingListener.remove();
    };
  }, [player, onPlay, onPause]);

  const handlePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      if (hasCompletedRef.current || (durationForUI > 0 && currentPositionForUI >= durationForUI - 0.05)) {
        handleRestart();
      } else {
        player.play();
      }
    }
  };

  const handleRestart = () => {
    setTotalPlayTimeSeconds(0);
    playSessionStartPlayerTimeRef.current = 0;
    hasCompletedRef.current = false;
    setCurrentPositionForUI(0);
    player.seekBy(0);
    player.play();
  };

  const handleSeek = (seconds: number) => {
    const wasPlaying = player.playing;

    if (wasPlaying) {
      player.pause();
    }

    player.seekBy(seconds);
    setCurrentPositionForUI(seconds);

    if (durationForUI > 0 && seconds >= durationForUI - 0.05) {
      if (!hasCompletedRef.current) {
        let finalTotalTime = totalPlayTimeSeconds;

        onComplete?.(finalTotalTime);
        hasCompletedRef.current = true;
        setIsActuallyPlaying(false);
      }
    } else {
      hasCompletedRef.current = false;
    }
    playSessionStartPlayerTimeRef.current = seconds;

    if (wasPlaying) {
      player.play();
    }
  };

  const isVideoReady = durationForUI > 0 || player.status === "readyToPlay";
  const showLoader = !thumbUri && !isVideoReady;

  const showThumbnail = thumbUri && !isActuallyPlaying && (!isVideoReady || currentPositionForUI < 0.1);

  const isAtEndForButton =
    hasCompletedRef.current || (durationForUI > 0 && currentPositionForUI >= durationForUI - 0.05);

  const formatTime = (totalSeconds: number) => {
    const validSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(validSeconds / 60);
    const seconds = Math.floor(validSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <View style={[{ width, height }, styles.container]}>
      {showLoader ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#CCC" />
        </View>
      ) : (
        <>
          {showThumbnail && (
            <Image
              source={{ uri: thumbUri }}
              style={[StyleSheet.absoluteFillObject, { width, height }]}
              resizeMode="cover"
            />
          )}
          <VideoView
            player={player}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            style={[StyleSheet.absoluteFillObject, { width, height, opacity: isVideoReady ? 1 : 0 }]}
            nativeControls={false}
            contentFit="contain"
          />
        </>
      )}

      {isVideoReady && (
        <View style={styles.controlsOverlay}>
          <View style={styles.controlsContainer}>
            <Pressable onPress={isAtEndForButton ? handleRestart : handlePlayPause} style={styles.controlButton}>
              <MaterialIcons
                name={isAtEndForButton ? "replay" : isActuallyPlaying ? "pause" : "play-arrow"}
                size={32}
                color="white"
              />
            </Pressable>

            <Text style={styles.timeText}>{formatTime(currentPositionForUI)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={durationForUI > 0 ? durationForUI : 1}
              value={currentPositionForUI}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="rgba(255, 255, 255, 0.5)"
              thumbTintColor="#FFFFFF"
            />
            <Text style={styles.timeText}>{formatTime(durationForUI)}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  controlButton: {
    padding: 8,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: "white",
    fontSize: 12,
    minWidth: 40,
    textAlign: "center",
  },
});
