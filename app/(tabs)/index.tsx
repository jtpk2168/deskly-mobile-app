import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
    ViewToken,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ResizeMode, Video } from "expo-av";
import { useProducts, Product } from "../../hooks/useApi";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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

function FeedItem({
    item,
    tabBarHeight,
    topInset,
    index,
    total,
    isActive,
}: {
    item: Product;
    tabBarHeight: number;
    topInset: number;
    index: number;
    total: number;
    isActive: boolean;
}) {
    const baseMonthlyPrice = toNumeric(item.monthly_price);
    const pricingTiers = normalizePricingTiers(item.pricing_tiers);
    const lowestTieredPrice =
        pricingTiers.length > 0
            ? pricingTiers.reduce((minPrice, tier) => Math.min(minPrice, tier.monthly_price), baseMonthlyPrice)
            : baseMonthlyPrice;
    const hasTieredDiscount =
        item.pricing_mode === "tiered" &&
        lowestTieredPrice < baseMonthlyPrice;
    const listingMonthlyPrice = hasTieredDiscount ? lowestTieredPrice : baseMonthlyPrice;

    return (
        <View style={{ height: SCREEN_HEIGHT }} className="relative bg-black">
            {item.video_url ? (
                <Video
                    source={{ uri: item.video_url }}
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
                    shouldPlay={isActive}
                    isLooping
                    isMuted
                    resizeMode={ResizeMode.COVER}
                />
            ) : item.image_url ? (
                <Image
                    source={{ uri: item.image_url }}
                    className="absolute inset-0 h-full w-full"
                    resizeMode="cover"
                />
            ) : (
                <View className="absolute inset-0 h-full w-full items-center justify-center bg-gray-900">
                    <MaterialIcons name="image" size={64} color="#475569" />
                </View>
            )}

            {/* Bottom gradient overlay */}
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.88)"]}
                locations={[0.35, 0.55, 1]}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Content overlay */}
            <View
                className="absolute inset-x-0 bottom-0 px-5"
                style={{ paddingBottom: tabBarHeight + 24 }}
            >
                {/* Category pill */}
                {item.category && (
                    <View className="mb-4 flex-row">
                        <View className="rounded-full bg-white/20 px-3.5 py-1.5">
                            <Text className="text-sm font-semibold text-white">
                                {item.category}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Tagline */}
                <Text className="mb-3 text-3xl font-bold leading-tight text-white">
                    {hasTieredDiscount ? `From RM ${formatPrice(listingMonthlyPrice)}/mo! 🔥` : `Just RM ${formatPrice(listingMonthlyPrice)}/mo! 🔥`}
                </Text>

                {/* Product name */}
                <Text className="mb-1.5 text-lg font-semibold text-white/90">
                    {item.name}
                </Text>

                {/* Description as caption */}
                {item.description && (
                    <Text className="mb-6 text-base leading-relaxed text-white/70" numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                {/* Price badge + CTA row */}
                <View className="flex-row items-center gap-3">
                    <View className="rounded-xl bg-white/15 px-4 py-3">
                        <Text className="text-lg font-bold text-white">
                            {hasTieredDiscount ? `From RM ${formatPrice(listingMonthlyPrice)}` : `RM ${formatPrice(listingMonthlyPrice)}`}
                            <Text className="text-sm font-medium text-white/70">/mo</Text>
                        </Text>
                    </View>

                    <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-xl bg-primary py-4"
                        onPress={() => router.push(`/product/${item.id}`)}
                        activeOpacity={0.85}
                    >
                        <Text className="text-base font-semibold text-white">
                            View Details
                        </Text>
                        <MaterialIcons
                            name="arrow-forward"
                            size={18}
                            color="#FFFFFF"
                            style={{ marginLeft: 6 }}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Item counter */}
            <View
                className="absolute right-5 flex-row items-center rounded-full bg-black/40 px-3 py-1.5"
                style={{ top: topInset + 12 }}
            >
                <MaterialIcons name="swipe-vertical" size={14} color="rgba(255,255,255,0.7)" />
                <Text className="ml-1.5 text-sm font-semibold text-white/80">
                    {index + 1} / {total}
                </Text>
            </View>
        </View>
    );
}

export default function HomeFeedScreen() {
    const insets = useSafeAreaInsets();
    const { tabBarHeight } = useTabBarSpacing();
    const [activeIndex, setActiveIndex] = useState(0);

    const { data: products, loading, error } = useProducts();

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index != null) {
                setActiveIndex(viewableItems[0].index);
            }
        }
    ).current;

    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

    const renderItem = useCallback(
        ({ item, index }: { item: Product; index: number }) => (
            <FeedItem
                item={item}
                tabBarHeight={tabBarHeight}
                topInset={insets.top}
                index={index}
                total={products?.length ?? 0}
                isActive={index === activeIndex}
            />
        ),
        [tabBarHeight, insets.top, products?.length, activeIndex]
    );

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text className="mt-3 text-sm text-white/60">Loading feed...</Text>
            </View>
        );
    }

    if (error || !products || products.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-black px-6">
                <MaterialIcons name="explore" size={64} color="#475569" />
                <Text className="mt-4 text-xl font-bold text-white">No Content Yet</Text>
                <Text className="mt-2 text-center text-base text-white/50">
                    {error ? error : "New furniture drops coming soon. Stay tuned!"}
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={SCREEN_HEIGHT}
                decelerationRate="fast"
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(_, index) => ({
                    length: SCREEN_HEIGHT,
                    offset: SCREEN_HEIGHT * index,
                    index,
                })}
            />
        </View>
    );
}
