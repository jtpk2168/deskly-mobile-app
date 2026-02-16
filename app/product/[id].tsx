import { useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useProduct } from "../../hooks/useApi";
import { AppTopBar } from "../../components/ui/AppTopBar";

const DURATION_OPTIONS = [6, 12, 24];

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

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [selectedDuration, setSelectedDuration] = useState(12);

    const { data: product, loading, error } = useProduct(id);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#6B8599" />
                <Text className="mt-3 text-sm text-slate-400">Loading product...</Text>
            </View>
        );
    }

    if (error || !product) {
        return (
            <View className="flex-1 items-center justify-center bg-white px-6">
                <MaterialIcons name="error-outline" size={48} color="#CBD5E1" />
                <Text className="mt-3 text-base font-semibold text-gray-700">Product Not Found</Text>
                <TouchableOpacity className="mt-4 rounded-xl bg-primary px-6 py-3" onPress={() => router.back()}>
                    <Text className="text-sm font-semibold text-white">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const baseMonthlyPrice = toNumeric(product.monthly_price);
    const pricingTiers = normalizePricingTiers(product.pricing_tiers);
    const hasTieredPricing =
        product.pricing_mode === "tiered" &&
        pricingTiers.length > 0;
    const applicableTier = hasTieredPricing
        ? [...pricingTiers].reverse().find((tier) => selectedDuration >= tier.min_months) ?? null
        : null;
    const effectiveMonthlyPrice = applicableTier ? applicableTier.monthly_price : baseMonthlyPrice;
    const totalPrice = effectiveMonthlyPrice * selectedDuration;
    const hasDiscount = effectiveMonthlyPrice < baseMonthlyPrice;

    return (
        <View className="flex-1 bg-white">
            <AppTopBar
                title="Product Details"
                onBackPress={() => router.back()}
                right={
                    <View className="flex-row gap-2">
                        <TouchableOpacity className="rounded-full p-1">
                            <MaterialIcons name="share" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                        <TouchableOpacity className="rounded-full p-1">
                            <MaterialIcons name="favorite-border" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                }
                rightContainerClassName="w-20"
            />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
                <View className="relative h-[45vh] min-h-[360px] overflow-hidden bg-gray-100">
                    {product.image_url ? (
                        <Image source={{ uri: product.image_url }} className="h-full w-full" resizeMode="cover" />
                    ) : (
                        <View className="h-full w-full items-center justify-center">
                            <MaterialIcons name="image" size={64} color="#CBD5E1" />
                        </View>
                    )}
                    <View className="absolute bottom-0 left-0 h-24 w-full bg-white/70" />
                </View>

                <View className="-mt-6 rounded-t-[32px] bg-white px-6 pt-8">
                    <View className="mb-6">
                        <View className="mb-2 flex-row justify-between">
                            <View className="mr-3 flex-1">
                                <Text className="mb-1 text-sm font-semibold uppercase tracking-wider text-primary">Premium Series</Text>
                                <Text className="text-3xl font-bold leading-tight text-gray-900">{product.name}</Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-2xl font-bold text-primary">RM {formatPrice(effectiveMonthlyPrice)}</Text>
                                <Text className="text-sm text-slate-400">/mo</Text>
                                {hasTieredPricing && (
                                    <Text className="mt-1 text-right text-xs text-slate-500">
                                        {pricingTiers.map((tier) => `${tier.min_months}+m RM ${formatPrice(tier.monthly_price)}`).join(" | ")}
                                    </Text>
                                )}
                                {hasDiscount && (
                                    <Text className="mt-1 text-xs text-slate-400 line-through">
                                        Base RM {formatPrice(baseMonthlyPrice)}/mo
                                    </Text>
                                )}
                            </View>
                        </View>

                        {product.category && (
                            <View className="mt-1 flex-row items-center">
                                <View className="rounded-full bg-primary/10 px-3 py-1">
                                    <Text className="text-sm font-medium text-primary">{product.category}</Text>
                                </View>
                                <Text className="ml-2 text-sm text-slate-400">
                                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="mb-8">
                        <Text className="mb-3 ml-1 text-sm font-medium text-slate-500">Rental Duration</Text>
                        <View className="flex-row rounded-xl border border-gray-100 bg-gray-50 p-1">
                            {DURATION_OPTIONS.map((duration) => {
                                const selected = selectedDuration === duration;
                                return (
                                    <TouchableOpacity
                                        key={duration}
                                        className={`flex-1 rounded-lg py-3 ${selected ? "bg-primary" : "bg-transparent"}`}
                                        onPress={() => setSelectedDuration(duration)}
                                    >
                                        <Text className={`text-center text-sm font-semibold ${selected ? "text-white" : "text-slate-500"}`}>
                                            {duration} Months
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <Text className="mt-3 text-center text-sm text-slate-400">
                            Includes maintenance and professional installation.
                        </Text>
                        {hasTieredPricing && (
                            <Text className="mt-1 text-center text-sm text-primary">
                                Tiered pricing auto-applies based on selected rental duration.
                            </Text>
                        )}
                    </View>

                    <View className="mb-8 flex-row items-center rounded-xl border border-primary/20 bg-primary/10 p-4">
                        <View className="rounded-full bg-primary p-1">
                            <MaterialIcons name="check" size={12} color="#FFFFFF" />
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="text-sm font-bold text-primary">White Glove Service</Text>
                            <Text className="mt-1 text-sm text-primary-dark">
                                Delivery, installation, and setup included for your enterprise team.
                            </Text>
                        </View>
                    </View>

                    {product.description && (
                        <View className="mb-8">
                            <Text className="mb-3 text-lg font-bold text-gray-900">Overview</Text>
                            <Text className="text-base leading-relaxed text-slate-500">{product.description}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white/95 px-6 py-6">
                <View className="flex-row items-center gap-4">
                    <View>
                        <Text className="text-sm font-medium uppercase text-slate-400">Monthly</Text>
                        <Text className="text-2xl font-bold text-gray-900">RM {formatPrice(effectiveMonthlyPrice)}</Text>
                        <Text className="mt-2 text-sm font-medium uppercase text-slate-400">
                            Total ({selectedDuration} months)
                        </Text>
                        <Text className="text-xl font-bold text-gray-900">RM {formatPrice(totalPrice)}</Text>
                    </View>
                    <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-xl bg-primary py-4"
                        onPress={() => router.push("/checkout/delivery")}
                    >
                        <Text className="text-base font-semibold text-white">Add to Plan</Text>
                        <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
