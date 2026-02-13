import { useMemo, useState } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { PRODUCTS } from "../../constants/mockData";
import { AppTopBar } from "../../components/ui/AppTopBar";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";

const categories = ["All", "Desks", "Chairs", "Storage", "Meeting"];

export default function CatalogScreen() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [query, setQuery] = useState("");
    const { contentPaddingBottom } = useTabBarSpacing();

    const filteredProducts = useMemo(() => {
        return PRODUCTS.filter((product) => {
            const byCategory = activeCategory === "All" || product.category === activeCategory;
            const byQuery = product.name.toLowerCase().includes(query.toLowerCase());
            return byCategory && byQuery;
        });
    }, [activeCategory, query]);

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
            <View className="border-b border-gray-100 bg-white/95 px-5 py-5">
                <AppTopBar title="Discover" containerClassName="px-0 py-0 border-b-0 bg-transparent" />

                <View className="mt-4 relative">
                    <View className="absolute inset-y-0 left-0 z-10 justify-center pl-3">
                        <MaterialIcons name="search" size={22} color="#94A3B8" />
                    </View>
                    <TextInput
                        className="rounded-xl border border-gray-100 bg-gray-50 py-4 pl-11 pr-4 text-base text-gray-900"
                        placeholder="Search furniture..."
                        placeholderTextColor="#94A3B8"
                        value={query}
                        onChangeText={setQuery}
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

                <View className="flex-row flex-wrap justify-between px-5 pb-2">
                    {filteredProducts.map((product) => (
                        <TouchableOpacity
                            key={product.id}
                            className="mb-4 w-[48%] rounded-2xl border border-gray-50 bg-white p-4"
                            onPress={() => router.push(`/product/${product.id}`)}
                            activeOpacity={0.92}
                        >
                            <View className="relative mb-3 aspect-[4/5] overflow-hidden rounded-xl bg-gray-100">
                                <View className="absolute left-2 top-2 z-10 rounded-md border border-gray-100 bg-white/90 px-2 py-0.5">
                                    <Text className="text-sm font-bold uppercase tracking-wide text-primary">
                                        {product.minMonths} Mo. Min
                                    </Text>
                                </View>
                                <Image source={{ uri: product.image }} className="h-full w-full" resizeMode="cover" />
                            </View>

                            <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                                {product.name}
                            </Text>
                            <Text className="mt-1 text-sm text-slate-400">{product.category}</Text>

                            <View className="mt-3 flex-row items-end justify-between">
                                <View className="flex-row items-baseline">
                                    <Text className="text-lg font-bold text-primary">${product.price}</Text>
                                    <Text className="text-sm text-slate-400">/mo</Text>
                                </View>
                                <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-full bg-primary">
                                    <MaterialIcons name="add" size={18} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
