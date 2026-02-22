import { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    Pressable,
    View,
    ViewToken,
    Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";
import { LoadingState, StatePanel } from "../../components/ui";
import { useProducts, Product } from "../../hooks/useApi";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";
import { formatPrice, getLowestTieredPrice, normalizePricingTiers, toNumeric } from "../../lib/ui";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

function FeedVideo({ uri, isActive, isMuted, isPaused }: { uri: string; isActive: boolean; isMuted: boolean; isPaused: boolean }) {
    const player = useVideoPlayer({ uri }, (player) => {
        player.loop = true;
        player.muted = isMuted;
    });

    useEffect(() => {
        if (player) {
            player.muted = isMuted;
        }
    }, [isMuted, player]);

    useEffect(() => {
        if (isActive && !isPaused) {
            player.play();
            return;
        }

        player.pause();
    }, [isActive, isPaused, player]);

    return (
        <VideoView
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
            player={player}
            contentFit="cover"
            nativeControls={false}
            fullscreenOptions={{ enable: false }}
            allowsPictureInPicture={false}
        />
    );
}

function FeedItem({
    item,
    tabBarHeight,
    topInset,
    index,
    total,
    isActive,
    isMuted,
    onToggleMute,
}: {
    item: Product;
    tabBarHeight: number;
    topInset: number;
    index: number;
    total: number;
    isActive: boolean;
    isMuted: boolean;
    onToggleMute: () => void;
}) {
    const baseMonthlyPrice = toNumeric(item.monthly_price);
    const pricingTiers = normalizePricingTiers(item.pricing_tiers);
    const lowestTieredPrice = getLowestTieredPrice(baseMonthlyPrice, pricingTiers);
    const hasTieredDiscount =
        item.pricing_mode === "tiered" &&
        lowestTieredPrice < baseMonthlyPrice;
    const listingMonthlyPrice = hasTieredDiscount ? lowestTieredPrice : baseMonthlyPrice;

    const [isPaused, setIsPaused] = useState(false);
    const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);

    const handlePress = () => {
        onToggleMute();
        setShowVolumeIndicator(true);
        setTimeout(() => setShowVolumeIndicator(false), 1500);
    };

    return (
        <View style={{ height: SCREEN_HEIGHT }} className="relative bg-black">
            {item.video_url ? (
                <FeedVideo uri={item.video_url} isActive={isActive} isMuted={isMuted} isPaused={isPaused} />
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

            <Pressable
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                onPress={handlePress}
                onLongPress={() => setIsPaused(true)}
                onPressOut={() => setIsPaused(false)}
            />

            {showVolumeIndicator && (
                <View className="absolute left-1/2 top-1/2 -mt-8 -ml-8 h-16 w-16 items-center justify-center rounded-full bg-black/50">
                    <MaterialIcons name={isMuted ? "volume-off" : "volume-up"} size={32} color="white" />
                </View>
            )}

            {isPaused && (
                <View className="absolute left-1/2 top-1/2 -mt-8 -ml-8 h-16 w-16 items-center justify-center rounded-full bg-black/50">
                    <MaterialIcons name="pause" size={32} color="white" />
                </View>
            )}

            {/* Bottom gradient overlay */}
            <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.88)"]}
                    locations={[0.35, 0.55, 1]}
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                />
            </View>

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
                    {(index % total) + 1} / {total}
                </Text>
            </View>
        </View>
    );
}

export default function HomeFeedScreen() {
    const flatListRef = useRef<FlatList>(null);
    const insets = useSafeAreaInsets();
    const { tabBarHeight } = useTabBarSpacing();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);

    const { data: products, loading, error } = useProducts();
    const [feedData, setFeedData] = useState<Product[]>([]);

    useEffect(() => {
        if (products && products.length > 0) {
            // we initialize with 3 chunks: prev, current, next
            setFeedData([...products, ...products, ...products]);
            // Jump to the middle chunk on first mount
            setTimeout(() => {
                flatListRef.current?.scrollToOffset({
                    offset: products.length * SCREEN_HEIGHT,
                    animated: false,
                });
            }, 0);
        }
    }, [products]);

    const handleScroll = useCallback(
        (e: any) => {
            if (!products || products.length === 0) return;
            const offsetY = e.nativeEvent.contentOffset.y;
            const oneChunkHeight = products.length * SCREEN_HEIGHT;

            // If we scrolled past the middle chunk downwards, jump back 1 chunk
            if (offsetY >= oneChunkHeight * 2) {
                flatListRef.current?.scrollToOffset({
                    offset: offsetY - oneChunkHeight,
                    animated: false,
                });
            }
            // If we scroll into the first chunk upwards, jump forward 1 chunk
            else if (offsetY <= oneChunkHeight - SCREEN_HEIGHT) {
                flatListRef.current?.scrollToOffset({
                    offset: offsetY + oneChunkHeight,
                    animated: false,
                });
            }
        },
        [products]
    );

    const toggleMute = useCallback(() => {
        setIsMuted((muted) => !muted);
    }, []);

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
                isMuted={isMuted}
                onToggleMute={toggleMute}
            />
        ),
        [tabBarHeight, insets.top, products?.length, activeIndex, isMuted, toggleMute]
    );

    if (loading) {
        return (
            <LoadingState
                label="Loading feed..."
                className="flex-1 bg-black"
                indicatorColor="#FFFFFF"
                labelClassName="text-white/60"
            />
        );
    }

    if (error || !products || products.length === 0) {
        return (
            <StatePanel
                icon="explore"
                title="No Content Yet"
                description={error ? error : "New furniture drops coming soon. Stay tuned!"}
                className="flex-1 bg-black px-6"
                titleClassName="text-white"
                descriptionClassName="text-white/50 text-base"
                iconContainerClassName="bg-gray-900"
                iconColor="#475569"
            />
        );
    }

    return (
        <View className="flex-1 bg-black">
            <FlatList
                ref={flatListRef}
                data={feedData}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={SCREEN_HEIGHT}
                snapToAlignment="start"
                decelerationRate={Platform.OS === 'ios' ? 'normal' : 'fast'}
                disableIntervalMomentum={true}
                onScroll={handleScroll}
                scrollEventThrottle={16}
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
