import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProduct } from "../../hooks/useApi";
import { AppTopBar, ErrorState, LoadingState, StickyActionBar } from "../../components/ui";
import { useCart } from "../../contexts/CartContext";
import { formatPrice, normalizePricingTiers, resolveTieredMonthlyPrice, toNumeric } from "../../lib/ui";

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { addToCart, cartDurationMonths } = useCart();

    const { data: product, loading, error } = useProduct(id);

    if (loading) {
        return (
            <LoadingState label="Loading product..." className="flex-1 bg-white" />
        );
    }

    if (error || !product) {
        return (
            <ErrorState
                title="Product Not Found"
                actionLabel="Go Back"
                onActionPress={() => router.back()}
                icon="error-outline"
                className="flex-1 bg-white"
            />
        );
    }

    const baseMonthlyPrice = toNumeric(product.monthly_price);
    const pricingTiers = normalizePricingTiers(product.pricing_tiers);
    const hasTieredPricing =
        product.pricing_mode === "tiered" &&
        pricingTiers.length > 0;
    const effectiveMonthlyPrice = resolveTieredMonthlyPrice(
        baseMonthlyPrice,
        product.pricing_mode,
        pricingTiers,
        cartDurationMonths,
    );
    const totalPrice = effectiveMonthlyPrice * cartDurationMonths;
    const hasDiscount = effectiveMonthlyPrice < baseMonthlyPrice;

    const handleAddToPlan = () => {
        addToCart({
            productId: product.id,
            name: product.name,
            category: product.category,
            imageUrl: product.image_url,
            baseMonthlyPrice,
            pricingMode: product.pricing_mode,
            pricingTiers,
            monthlyPrice: effectiveMonthlyPrice,
            quantity: 1,
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
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

                    <View className="mb-8 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400">Order Duration</Text>
                        <Text className="mt-2 text-base font-semibold text-gray-900">{cartDurationMonths} months</Text>
                        <Text className="mt-2 text-sm text-slate-500">
                            Duration is controlled at cart level. One order = one duration. For different durations, place a separate order.
                        </Text>
                        {hasTieredPricing && (
                            <Text className="mt-2 text-sm text-primary">
                                Tiered pricing auto-applies based on your cart duration.
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

            <StickyActionBar>
                <View className="flex-row items-center gap-4">
                    <View>
                        <Text className="text-sm font-medium uppercase text-slate-400">Monthly</Text>
                        <Text className="text-2xl font-bold text-gray-900">RM {formatPrice(effectiveMonthlyPrice)}</Text>
                        <Text className="mt-2 text-sm font-medium uppercase text-slate-400">
                            Total ({cartDurationMonths} months)
                        </Text>
                        <Text className="text-xl font-bold text-gray-900">RM {formatPrice(totalPrice)}</Text>
                    </View>
                    <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-xl bg-primary py-4"
                        onPress={handleAddToPlan}
                    >
                        <Text className="text-base font-semibold text-white">Add to Plan</Text>
                        <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                </View>
            </StickyActionBar>
        </SafeAreaView>
    );
}
