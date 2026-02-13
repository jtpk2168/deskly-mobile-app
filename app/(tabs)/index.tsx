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
import { Video, ResizeMode } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MockProduct, PRODUCTS } from "../../constants/mockData";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

function FeedItem({
    item,
    isActive,
    tabBarHeight,
    topInset,
    index,
    total,
}: {
    item: MockProduct;
    isActive: boolean;
    tabBarHeight: number;
    topInset: number;
    index: number;
    total: number;
}) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <View style={{ height: SCREEN_HEIGHT }} className="relative bg-black">
            {/* Poster image (shows while video loads) */}
            <Image
                source={{ uri: item.image }}
                className="absolute inset-0 h-full w-full"
                resizeMode="cover"
            />

            {/* Video player */}
            <Video
                source={{ uri: item.video }}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                resizeMode={ResizeMode.COVER}
                shouldPlay={isActive}
                isLooping
                isMuted
                onLoadStart={() => setIsLoading(true)}
                onLoad={() => setIsLoading(false)}
            />

            {/* Loading spinner */}
            {isLoading && isActive && (
                <View className="absolute inset-0 items-center justify-center">
                    <ActivityIndicator size="large" color="rgba(255,255,255,0.6)" />
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
                <View className="mb-4 flex-row">
                    <View className="rounded-full bg-white/20 px-3.5 py-1.5">
                        <Text className="text-sm font-semibold text-white">
                            {item.category}
                        </Text>
                    </View>
                </View>

                {/* Tagline — the big attention-grabbing text */}
                <Text className="mb-3 text-3xl font-bold leading-tight text-white">
                    {item.tagline}
                </Text>

                {/* Product name */}
                <Text className="mb-1.5 text-lg font-semibold text-white/90">
                    {item.name}
                </Text>

                {/* Video caption */}
                <Text className="mb-6 text-base leading-relaxed text-white/70" numberOfLines={2}>
                    {item.videoCaption}
                </Text>

                {/* Price badge + CTA row */}
                <View className="flex-row items-center gap-3">
                    {/* Price badge */}
                    <View className="rounded-xl bg-white/15 px-4 py-3">
                        <Text className="text-lg font-bold text-white">
                            RM {item.price}
                            <Text className="text-sm font-medium text-white/70">/mo</Text>
                        </Text>
                    </View>

                    {/* CTA Button */}
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

            {/* Item counter — top right */}
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

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index != null) {
                setActiveIndex(viewableItems[0].index);
            }
        }
    ).current;

    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

    const renderItem = useCallback(
        ({ item, index }: { item: MockProduct; index: number }) => (
            <FeedItem
                item={item}
                isActive={index === activeIndex}
                tabBarHeight={tabBarHeight}
                topInset={insets.top}
                index={index}
                total={PRODUCTS.length}
            />
        ),
        [tabBarHeight, insets.top, activeIndex]
    );

    return (
        <View className="flex-1 bg-black">
            <FlatList
                data={PRODUCTS}
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
