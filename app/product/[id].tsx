import { useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getProductById, PRODUCTS } from "../../constants/mockData";
import { AppTopBar } from "../../components/ui/AppTopBar";

const DURATION_OPTIONS = [6, 12, 24];

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [selectedDuration, setSelectedDuration] = useState(12);

    const product = useMemo(() => getProductById(id) ?? PRODUCTS[0], [id]);

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
                    <Image source={{ uri: product.image }} className="h-full w-full" resizeMode="cover" />
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
                                <Text className="text-2xl font-bold text-primary">${product.price}</Text>
                                <Text className="text-sm text-slate-400">/mo</Text>
                            </View>
                        </View>

                        <View className="mt-1 flex-row items-center">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <MaterialIcons
                                    key={index}
                                    name={index < Math.floor(product.rating) ? "star" : "star-border"}
                                    size={16}
                                    color="#FACC15"
                                />
                            ))}
                            <Text className="ml-2 text-sm font-medium text-slate-400">
                                {product.rating} ({product.reviews} reviews)
                            </Text>
                        </View>
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

                    <View className="mb-8">
                        <Text className="mb-3 text-lg font-bold text-gray-900">Overview</Text>
                        <Text className="text-base leading-relaxed text-slate-500">{product.description}</Text>
                    </View>
                </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white/95 px-6 py-6">
                <View className="flex-row items-center gap-4">
                    <View>
                        <Text className="text-sm font-medium uppercase text-slate-400">Monthly</Text>
                        <Text className="text-2xl font-bold text-gray-900">${product.price}.00</Text>
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
