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
      name: "Jawzrsize Jaw, Face, and Neck Exerciser",
      description:
        "Resistance training device for jaw and facial muscles that helps tone the jawline and slim the face.",
      price: "$29.95",
      image: "",
      category: "Jawline Tools",
      affiliateLink: "https://www.amazon.com/dp/B07B...",
      network: "amazon",
    },
    {
      id: "jawline-2",
      name: "Jade Roller & Gua Sha Set",
      description:
        "Natural jade roller and gua sha tools that reduce puffiness and improve circulation for a glowing complexion.",
      price: "$17.99",
      image: "",
      category: "Jawline Tools",
      affiliateLink: "https://www.amazon.com/dp/B07...",
      network: "amazon",
    },
    {
      id: "jawline-3",
      name: "NuFACE Mini Facial Toning Device",
      description:
        "At-home microcurrent device that gently lifts and contours the face and jawline for a firmer appearance.",
      price: "$209.00",
      image: "",
      category: "Jawline Tools",
      affiliateLink: "https://www.amazon.com/dp/B00LVFWZ38",
      network: "amazon",
    },
    {
      id: "cleanser-1",
      name: "CeraVe Hydrating Facial Cleanser",
      description: "Gentle cleanser with ceramides and hyaluronic acid that cleanses without stripping moisture.",
      price: "$14.99",
      image: "",
      category: "Facial Care",
      affiliateLink: "https://www.amazon.com/dp/B01MSSDEPK",
      network: "amazon",
    },
    {
      id: "cleanser-2",
      name: "Cetaphil Gentle Skin Cleanser",
      description:
        "Soap-free, fragrance-free cleanser ideal for sensitive skin, helping to remove dirt while maintaining skin’s pH balance.",
      price: "$12.99",
      image: "",
      category: "Facial Care",
      affiliateLink: "https://www.amazon.com/dp/B001ET76CY",
      network: "amazon",
    },
    {
      id: "cleanser-3",
      name: "La Roche-Posay Toleriane Hydrating Gentle Cleanser",
      description:
        "Creamy facial cleanser with ceramides and niacinamide that gently cleanses and soothes dry, sensitive skin.",
      price: "$15.99",
      image: "",
      category: "Facial Care",
      affiliateLink: "https://www.amazon.com/dp/B01NCI8B02",
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
      name: "Neutrogena Hydro Boost Water Gel",
      description:
        "Oil-free gel moisturizer with hyaluronic acid that provides intense hydration and a dewy, refreshed glow.",
      price: "$19.99",
      image: "",
      category: "Moisturizers",
      affiliateLink: "https://www.amazon.com/dp/B00NR1YQK4",
      network: "amazon",
    },
    {
      id: "moisturizer-3",
      name: "Olay Regenerist Micro-Sculpting Cream",
      description:
        "Popular anti-aging cream with peptides and niacinamide that hydrates to plump skin and minimize fine lines.",
      price: "$28.99",
      image: "",
      category: "Moisturizers",
      affiliateLink: "https://www.amazon.com/dp/B0039OHE3A",
      network: "amazon",
    },
    {
      id: "serum-1",
      name: "The Ordinary Niacinamide 10% + Zinc 1%",
      description:
        "High-strength niacinamide serum that reduces blemishes and visible pores while balancing oily skin.",
      price: "$6.00",
      image: "https://media.ulta.com/i/ulta/2551167",
      category: "Serums",
      affiliateLink: "https://www.amazon.com/dp/B01MDTVZTZ",
      network: "amazon",
    },
    {
      id: "serum-2",
      name: "TruSkin Vitamin C Serum",
      description:
        "Brightening serum with vitamin C, vitamin E, and hyaluronic acid that targets dark spots and uneven tone for a radiant complexion.",
      price: "$21.99",
      image: "",
      category: "Serums",
      affiliateLink: "https://www.amazon.com/dp/B01M4MCUAF",
      network: "amazon",
    },
    {
      id: "serum-3",
      name: "CeraVe Resurfacing Retinol Serum",
      description:
        "Encapsulated retinol serum with licorice root that fades post-acne marks, refines skin texture, and smooths fine lines.",
      price: "$21.99",
      image: "https://media.ulta.com/i/ulta/2556947",
      category: "Serums",
      affiliateLink: "https://www.amazon.com/dp/B07VWSN95S",
      network: "amazon",
    },
    {
      id: "exfoliator-1",
      name: "Paula’s Choice SKIN PERFECTING 2% BHA Liquid Exfoliant",
      description:
        "Leave-on salicylic acid exfoliant that unclogs pores, smooths wrinkles, and evens skin tone for brighter, clearer skin.",
      price: "$35.00",
      image: "https://static.thcdn.com/productimg/original/11174178-5605201471599659.jpg",
      category: "Exfoliators",
      affiliateLink: "https://www.amazon.com/dp/B00949CTQQ",
      network: "amazon",
    },
    {
      id: "exfoliator-2",
      name: "The Ordinary AHA 30% + BHA 2% Peeling Solution",
      description:
        "Intense 10-minute at-home peel with alpha and beta hydroxy acids that resurfaces skin for improved texture and radiance.",
      price: "$9.50",
      image: "https://media.ulta.com/i/ulta/2551153",
      category: "Exfoliators",
      affiliateLink: "https://www.amazon.com/dp/B0872ZHB3Y",
      network: "amazon",
    },
    {
      id: "exfoliator-3",
      name: "Pixi Glow Tonic 5% Glycolic Exfoliating Toner",
      description:
        "Cult-favorite glycolic acid toner that gently exfoliates dead cells to reveal brighter, more even and glowing skin.",
      price: "$29.00",
      image: "https://www.pixibeauty.com/cdn/shop/products/GlowTonic-250ml-MAY19_5.jpg?v=1744417559",
      category: "Exfoliators",
      affiliateLink: "https://www.amazon.com/dp/B00KH6QX08",
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
    flexDirection: "column",
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
    bottom: "30%",
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
