import { TabConfig } from "@/components/CenteredSwipeableTabs";
import { useAnimatedScrollHandler, useDerivedValue, useSharedValue } from "react-native-reanimated";

export const useCurrentScrollY = (activeIndex: number, tabs: TabConfig[]) => {
  const scrollYMap = useSharedValue<Record<string, number>>(Object.fromEntries(tabs.map((t) => [t.key, 0])));

  // when you scroll, just update the entry for the *current* tab
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      const key = tabs[activeIndex].key;
      scrollYMap.value = {
        ...scrollYMap.value,
        [key]: e.contentOffset.y,
      };
    },
  });

  // derive a SharedValue<number> for whatever tab is active right now
  const scrollY = useDerivedValue(() => {
    return scrollYMap.value[tabs[activeIndex].key] || 0;
  }, [activeIndex]);

  return { scrollY, scrollHandler };
};
