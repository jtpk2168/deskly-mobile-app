import { useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useProducts } from "../../hooks/useApi";
import { AppTopBar } from "../../components/ui/AppTopBar";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";

const categories = ["All", "Desks", "Chairs", "Storage", "Meeting", "Accessories"];

const styles = StyleSheet.create({
    inputText: {
        fontSize: 16,
        lineHeight: 20,
        paddingVertical: 0,
        includeFontPadding: false,
    },
});

function toNumeric(value: unknown) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatPrice(value: number) {
    return toNumeric(value).toFixed(2);
}

function normalizePricingTiers(input: { min_months: number; monthly_price: number }[] | null | undefined) {
    if (!Array.isArray(input)) return [];
    return input
        .map((tier) => ({
            min_months: Number(tier.min_months),
            monthly_price: Number(tier.monthly_price),
        }))
        .filter((tier) => Number.isInteger(tier.min_months) && tier.min_months >= 2 && Number.isFinite(tier.monthly_price) && tier.monthly_price > 0)
        .sort((a, b) => a.min_months - b.min_months);
}

export default function CatalogScreen() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [query, setQuery] = useState("");
    const { contentPaddingBottom } = useTabBarSpacing();

    const { data: products, loading, error } = useProducts(activeCategory, query);

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
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#6B8599" />
                        <Text className="mt-3 text-sm text-slate-400">Loading furniture...</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center py-20 px-6">
                        <MaterialIcons name="wifi-off" size={48} color="#CBD5E1" />
                        <Text className="mt-3 text-base font-semibold text-gray-700">Connection Error</Text>
                        <Text className="mt-1 text-sm text-slate-400 text-center">{error}</Text>
                    </View>
                ) : !products || products.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20 px-6">
                        <MaterialIcons name="inventory-2" size={48} color="#CBD5E1" />
                        <Text className="mt-3 text-base font-semibold text-gray-700">No Furniture Found</Text>
                        <Text className="mt-1 text-sm text-slate-400 text-center">
                            {query ? `No results for "${query}"` : "Check back soon for new arrivals."}
                        </Text>
                    </View>
                ) : (
                    <View className="flex-row flex-wrap justify-between px-5 pb-2">
                        {products.map((product) => {
                            const baseMonthlyPrice = toNumeric(product.monthly_price);
                            const pricingTiers = normalizePricingTiers(product.pricing_tiers);
                            const lowestTieredPrice =
                                pricingTiers.length > 0
                                    ? pricingTiers.reduce((minPrice, tier) => Math.min(minPrice, tier.monthly_price), baseMonthlyPrice)
                                    : baseMonthlyPrice;
                            const hasTieredDiscount =
                                product.pricing_mode === "tiered" &&
                                lowestTieredPrice < baseMonthlyPrice;
                            const listingMonthlyPrice = hasTieredDiscount ? lowestTieredPrice : baseMonthlyPrice;

                            return (
                                <TouchableOpacity
                                    key={product.id}
                                    className="mb-4 w-[48%] rounded-2xl border border-gray-50 bg-white p-4"
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

                                    <View className="mt-3 flex-row items-end justify-between">
                                        <View className="flex-row items-baseline">
                                            <Text className="text-lg font-bold text-primary">
                                                {hasTieredDiscount ? `From RM ${formatPrice(listingMonthlyPrice)}` : `RM ${formatPrice(listingMonthlyPrice)}`}
                                            </Text>
                                            <Text className="text-sm text-slate-400">/mo</Text>
                                        </View>
                                        <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-full bg-primary">
                                            <MaterialIcons name="add" size={18} color="#FFFFFF" />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
