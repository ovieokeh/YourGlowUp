import Fuse from "fuse.js";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";

import { ExternalLink } from "@/components/ExternalLink";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedPicker } from "@/components/ThemedPicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useBadges } from "@/providers/BadgeContext";
import { useLocalSearchParams } from "expo-router";

// Type definitions for future extensibility
export interface AffiliateProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  affiliateLink: string;
  network: "amazon" | "shareasale" | "rakuten" | "custom";
}

// Simulated remote fetch (replace with Supabase or other remote logic)
const fetchAffiliateProducts = async (): Promise<AffiliateProduct[]> => {
  return [
    {
      id: "jawline-1",
      name: "Jawzrsize Pop 'N Go",
      description:
        "Resistance training device for jaw and facial muscles that helps tone the jawline and slim the face.",
      price: "$20.90",
      image: "https://m.media-amazon.com/images/I/61WTC4mWezL._AC_SX679_.jpg",
      category: "Jawline Tools",
      affiliateLink: "https://amzn.to/3YBs7d4",
      network: "amazon",
    },
    {
      id: "jawline-2",
      name: "Kitsch Stainless Steel Gua Sha Facial Tool",
      description:
        "With its sleek and stylish design, the Kitsch gua sha stainless steel adds a touch of modern elegance to your skincare collection. It’s not only functional but also a beautiful addition to any vanity.",
      price: "$11.99",
      image: "https://m.media-amazon.com/images/I/71ltgGuuNqL._SX679_.jpg",
      category: "Jawline Tools",
      affiliateLink: "https://amzn.to/4k8gNxe",
      network: "amazon",
    },
    {
      id: "jawline-3",
      name: "NuFACE MINI Starter Kit",
      description:
        "The NuFACE Mini gently stimulates the larger surface areas of your face and neck to help improve contour and tone, and improve the appearance of fine lines and wrinkles",
      price: "$193.97",
      image: "https://m.media-amazon.com/images/I/41-Pfv8THBL._SX679_.jpg",
      category: "Jawline Tools",
      affiliateLink: "https://amzn.to/4iWL7tU",
      network: "amazon",
    },
    {
      id: "jawline-4",
      name: "Chios Mastiha Tears Gum ",
      description:
        "Fresh Chios Mastiha Tears Gum Greek 100% Natural Mastic - Gathered From The Mastic Growers Of Chios Island. It comes from the mastic tree that only grows in the island of Chios and it is hand-cleaned piece by piece by mastic growers. Its unique properties are unique and recognized all around the world in the scientific community.",
      price: "$16.50",
      image: "https://m.media-amazon.com/images/I/71RNhTEXmwL._SY879_.jpg",
      category: "Jawline Tools",
      affiliateLink: "https://amzn.to/4mo26Z9",
      network: "amazon",
    },
    {
      id: "cleanser-1",
      name: "CeraVe Hydrating Facial Cleanser",
      description: "Gentle cleanser with ceramides and hyaluronic acid that cleanses without stripping moisture.",
      price: "$18.51",
      image: "https://m.media-amazon.com/images/I/51flyLJHWtL._SX679_.jpg",
      category: "Facial Care",
      affiliateLink: "https://amzn.to/4iVEOGJ",
      network: "amazon",
    },
    {
      id: "cleanser-2",
      name: "Cetaphil Gentle Skin Cleanser",
      description:
        "Soap-free, fragrance-free cleanser ideal for sensitive skin, helping to remove dirt while maintaining skin’s pH balance.",
      price: "$13.44",
      image: "https://m.media-amazon.com/images/I/414EGEsGvmL._SX300_SY300_QL70_FMwebp_.jpg",
      category: "Facial Care",
      affiliateLink: "https://amzn.to/4d7YJRK",
      network: "amazon",
    },
    {
      id: "moisturizer-1",
      name: "CeraVe Moisturizing Cream",
      description:
        "Rich, fragrance-free cream with ceramides and hyaluronic acid that deeply hydrates and restores the skin barrier.",
      price: "$16.99",
      image: "https://www.pixibeauty.com/cdn/shop/products/GlowTonic-250ml-MAY19_5.jpg?v=1744417559",
      category: "Moisturizers",
      affiliateLink: "https://www.amazon.com/dp/B07XP8K162",
      network: "amazon",
    },
    {
      id: "moisturizer-2",
      name: "L'Oreal Paris Collagen Daily Face Moisturizer",
      description:
        "Day and night face and chest moisturizer: provides skin with a daily dose of intense hydration that helps to fill in the appearance of lines and wrinkles and helps restore moisture for smoother, plumper skin",
      price: "$22.98",
      image: "https://m.media-amazon.com/images/I/71qa57UEBnL._SX679_.jpg",
      category: "Moisturizers",
      affiliateLink: "https://amzn.to/3EZzPaa",
      network: "amazon",
    },
    {
      id: "moisturizer-3",
      name: "Olay Smooth & Renew Retinol Face Moisturizer",
      description:
        "Popular anti-aging cream with peptides and niacinamide that hydrates to plump skin and minimize fine lines.",
      price: "$28.99",
      image: "https://m.media-amazon.com/images/I/61CbMBiV9BL._SX679_.jpg",
      category: "Moisturizers",
      affiliateLink: "https://amzn.to/436DScO",
      network: "amazon",
    },
    {
      id: "serum-1",
      name: "The Ordinary Niacinamide 10% + Zinc 1%",
      description:
        "High-strength niacinamide serum that reduces blemishes and visible pores while balancing oily skin.",
      price: "$8.99",
      image: "https://m.media-amazon.com/images/I/51cn3TDkaML._SX679_.jpg",
      category: "Serums",
      affiliateLink: "https://amzn.to/4kcW1wH",
      network: "amazon",
    },
    {
      id: "serum-2",
      name: "TruSkin Vitamin C Serum",
      description:
        "Brightening serum with vitamin C, vitamin E, and hyaluronic acid that targets dark spots and uneven tone for a radiant complexion.",
      price: "$18.68",
      image: "https://m.media-amazon.com/images/I/71S3iW6010L._SX679_.jpg",
      category: "Serums",
      affiliateLink: "https://amzn.to/42ODgtE",
      network: "amazon",
    },
    {
      id: "serum-3",
      name: "CeraVe Resurfacing Retinol Serum",
      description:
        "Encapsulated retinol serum with licorice root that fades post-acne marks, refines skin texture, and smooths fine lines.",
      price: "$18.68",
      image: "https://m.media-amazon.com/images/I/71zvPJqU7FL._SX679_.jpg",
      category: "Serums",
      affiliateLink: "https://amzn.to/4m56sUL",
      network: "amazon",
    },
    {
      id: "exfoliator-1",
      name: "Paula’s Choice SKIN PERFECTING 2% BHA Liquid Exfoliant",
      description:
        "Leave-on salicylic acid exfoliant that unclogs pores, smooths wrinkles, and evens skin tone for brighter, clearer skin.",
      price: "$35.00",
      image: "https://m.media-amazon.com/images/I/61zhzjgd2xL._SX522_.jpg",
      category: "Exfoliators",
      affiliateLink: "https://amzn.to/456lDXs",
      network: "amazon",
    },
    {
      id: "exfoliator-2",
      name: "The Ordinary AHA 30% + BHA 2% Peeling Solution",
      description:
        "Intense 10-minute at-home peel with alpha and beta hydroxy acids that resurfaces skin for improved texture and radiance.",
      price: "$9.50",
      image: "https://m.media-amazon.com/images/I/51i1m6pqEWL._SX522_.jpg",
      category: "Exfoliators",
      affiliateLink: "https://amzn.to/431kttJ",
      network: "amazon",
    },
    {
      id: "exfoliator-3",
      name: "Pixi Glow Tonic 5% Glycolic Exfoliating Toner",
      description:
        "Cult-favorite glycolic acid toner that gently exfoliates dead cells to reveal brighter, more even and glowing skin.",
      price: "$29.00",
      image: "https://m.media-amazon.com/images/I/61lw7881TNL._AC_SX679_.jpg",
      category: "Exfoliators",
      affiliateLink: "https://amzn.to/3GYFJZJ",
      network: "amazon",
    },
  ];
};

const sortOptions = [
  { label: "Low to High", value: "low" as const },
  { label: "High to Low", value: "high" as const },
];

export default function MarketplaceScreen() {
  const { q } = useLocalSearchParams();
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [query, setQuery] = useState((q as string) || "");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sort, setSort] = useState<"low" | "high">("low");

  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");

  const { awardBadge } = useBadges();

  useEffect(() => {
    awardBadge("explorer");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof q === "string") setQuery(q);
  }, [q]);

  useEffect(() => {
    fetchAffiliateProducts().then(setProducts);
  }, []);

  const fuse = useMemo(() => new Fuse(products, { keys: ["name", "description"] }), [products]);
  const filtered = useMemo(() => {
    let list = query ? fuse.search(query).map((r) => r.item) : [...products];
    if (categoryFilter !== "All") {
      list = list.filter((p) => p.category === categoryFilter);
    }
    list.sort((a, b) => {
      const aPrice = parseFloat(a.price.replace(/[^0-9.]/g, ""));
      const bPrice = parseFloat(b.price.replace(/[^0-9.]/g, ""));
      return sort === "low" ? aPrice - bPrice : bPrice - aPrice;
    });
    return list;
  }, [products, query, categoryFilter, sort, fuse]);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const groupedFilters = useMemo(() => {
    const filters = new Map<string, string[]>();
    filtered.forEach((product) => {
      if (!filters.has(product.category)) {
        filters.set(product.category, []);
      }
      filters.get(product.category)?.push(product.id);
    });
    return filters;
  }, [filtered]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={{ marginBottom: Spacings.md }}>
        Products to help you achieve your ideal glow up
      </ThemedText>

      <View style={styles.searchControls}>
        <View style={styles.searchRow}>
          <ThemedTextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Search products..."
            placeholderTextColor={textColor}
            value={query}
            onChangeText={setQuery}
          />
          <ThemedButton
            title=""
            disabled={!query}
            onPress={() => setQuery("")}
            style={styles.clearButton}
            icon="x.circle"
            variant="ghost"
          />
        </View>

        <View style={styles.filters}>
          <ThemedPicker
            items={["All", ...categories].map((cat) => ({ label: cat, value: cat }))}
            selectedValue={categoryFilter}
            onValueChange={(v) => setCategoryFilter(v)}
          />
          <ThemedPicker
            items={sortOptions.map((opt) => ({ label: opt.label, value: opt.value }))}
            selectedValue={sort}
            onValueChange={(v) => setSort(v)}
            style={styles.picker}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
        {groupedFilters.size > 0 ? (
          Array.from(groupedFilters.entries()).map(([category, items]) => (
            <View key={category} style={{ marginBottom: Spacings.lg }}>
              <ThemedText type="subtitle" style={{ marginBottom: Spacings.sm }}>
                {category}
              </ThemedText>
              <View style={styles.grid}>
                {items.map((itemId) => {
                  const product = products.find((p) => p.id === itemId);
                  if (!product) return null;
                  return (
                    <ExternalLink
                      key={product.id}
                      href={product.affiliateLink}
                      style={[
                        styles.card,
                        {
                          borderColor,
                        },
                      ]}
                    >
                      <View>
                        <Image source={{ uri: product.image }} style={styles.image} />
                        <ThemedText numberOfLines={2} style={styles.productName}>
                          {product.name}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.productPrice}>{product.price}</ThemedText>
                    </ExternalLink>
                  );
                })}
              </View>
            </View>
          ))
        ) : (
          <ThemedText type="default" style={{ textAlign: "center", marginTop: Spacings.md }}>
            No products found.
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacings.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadii.sm,
    padding: Spacings.sm,
    maxWidth: "90%",
  },
  searchControls: {
    gap: Spacings.sm,
    marginBottom: Spacings.md,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  clearButton: {
    position: "absolute",
    right: "-4%",
    bottom: "8%",
    paddingHorizontal: Spacings.sm,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacings.sm,
  },
  picker: {
    flex: 1,
    height: 44,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacings.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: BorderRadii.md,
    padding: Spacings.sm,
    width: "48%",
    marginBottom: Spacings.md,
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: BorderRadii.sm,
    resizeMode: "cover",
    marginBottom: Spacings.xs,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    opacity: 0.7,
  },
});
