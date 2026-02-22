import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Product, useProducts } from "../../hooks/useApi";
import { AppTopBar, EmptyState, ErrorState, LoadingState } from "../../components/ui";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";
import { useCart } from "../../contexts/CartContext";
import { formatPrice, getLowestTieredPrice, normalizePricingTiers, toNumeric } from "../../lib/ui";

const categories = ["All", "Desks", "Chairs", "Storage", "Meeting", "Accessories"];

const styles = StyleSheet.create({
    inputText: {
        fontSize: 16,
        lineHeight: 20,
        paddingVertical: 0,
        includeFontPadding: false,
    },
});

export default function CatalogScreen() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [query, setQuery] = useState("");
    const { contentPaddingBottom } = useTabBarSpacing();
    const { addToCart } = useCart();

    const { data: products, loading, error } = useProducts(activeCategory, query);

    const handleAddToCart = (product: Product, monthlyPrice: number) => {
        const baseMonthlyPrice = toNumeric(product.monthly_price);
        const pricingTiers = normalizePricingTiers(product.pricing_tiers);

        addToCart({
            productId: product.id,
            name: product.name,
            category: product.category,
            imageUrl: product.image_url,
            baseMonthlyPrice,
            pricingMode: product.pricing_mode,
            pricingTiers,
            monthlyPrice,
            quantity: 1,
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
            <View className="border-b border-gray-100 bg-white/95 px-5 py-5">
                <AppTopBar title="Discover" containerClassName="px-0 py-0 border-b-0 bg-transparent" />

                <View className="mt-4 relative">
                    <View className="absolute inset-y-0 left-0 z-10 justify-center pl-3">
                        <MaterialIcons name="search" size={22} color="#94A3B8" />
                    </View>
                    <TextInput
                        className="h-14 rounded-xl border border-gray-100 bg-gray-50 pl-11 pr-4 text-gray-900"
                        placeholder="Search furniture..."
                        placeholderTextColor="#94A3B8"
                        value={query}
                        onChangeText={setQuery}
                        style={styles.inputText}
                    />
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: contentPaddingBottom }} showsVerticalScrollIndicator={false}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 py-5" contentContainerStyle={{ paddingRight: 20 }}>
                    <View className="flex-row gap-2">
                        {categories.map((category) => {
                            const selected = activeCategory === category;
                            return (
                                <TouchableOpacity
                                    key={category}
                                    className={`rounded-full border px-6 py-3 ${selected ? "border-primary bg-primary" : "border-gray-100 bg-white"
                                        }`}
                                    onPress={() => setActiveCategory(category)}
                                >
                                    <Text className={`text-sm font-semibold ${selected ? "text-white" : "text-slate-500"}`}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                {loading ? (
                    <LoadingState label="Loading furniture..." />
                ) : error ? (
                    <ErrorState title="Connection Error" description={error} />
                ) : !products || products.length === 0 ? (
                    <EmptyState
                        icon="inventory-2"
                        title="No Furniture Found"
                        description={query ? `No results for "${query}"` : "Check back soon for new arrivals."}
                    />
                ) : (
                    <View className="flex-row flex-wrap justify-between px-5 pb-2">
                        {products.map((product) => {
                            const baseMonthlyPrice = toNumeric(product.monthly_price);
                            const pricingTiers = normalizePricingTiers(product.pricing_tiers);
                            const lowestTieredPrice = getLowestTieredPrice(baseMonthlyPrice, pricingTiers);
                            const hasTieredDiscount =
                                product.pricing_mode === "tiered" &&
                                lowestTieredPrice < baseMonthlyPrice;
                            const listingMonthlyPrice = hasTieredDiscount ? lowestTieredPrice : baseMonthlyPrice;

                            return (
                                <View
                                    key={product.id}
                                    className="mb-4 w-[48%] rounded-2xl border border-gray-50 bg-white p-4"
                                >
                                    <TouchableOpacity
                                        onPress={() => router.push(`/product/${product.id}`)}
                                        activeOpacity={0.92}
                                    >
                                        <View className="relative mb-3 aspect-[4/5] overflow-hidden rounded-xl bg-gray-100">
                                            {product.image_url && (
                                                <Image source={{ uri: product.image_url }} className="h-full w-full" resizeMode="cover" />
                                            )}
                                        </View>

                                        <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                                            {product.name}
                                        </Text>
                                        <Text className="mt-1 text-sm text-slate-400">{product.category}</Text>
                                    </TouchableOpacity>

                                    <View className="mt-3 flex-row items-end justify-between">
                                        <View className="flex-row items-baseline">
                                            <Text className="text-lg font-bold text-primary">
                                                {hasTieredDiscount ? `From RM ${formatPrice(listingMonthlyPrice)}` : `RM ${formatPrice(listingMonthlyPrice)}`}
                                            </Text>
                                            <Text className="text-sm text-slate-400">/mo</Text>
                                        </View>
                                        <TouchableOpacity
                                            className="h-9 w-9 items-center justify-center rounded-full bg-primary"
                                            onPress={() => handleAddToCart(product, listingMonthlyPrice)}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Add ${product.name} to plan`}
                                        >
                                            <MaterialIcons name="add" size={18} color="#FFFFFF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
