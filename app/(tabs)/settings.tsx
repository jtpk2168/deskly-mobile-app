import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { PRODUCTS } from "../../constants/mockData";
import { AppTopBar } from "../../components/ui/AppTopBar";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";

const PLAN_ITEMS = [
    { product: PRODUCTS[0], quantity: 2 },
    { product: PRODUCTS[1], quantity: 3 },
];

export default function PlanScreen() {
    const monthlyTotal = PLAN_ITEMS.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const { contentPaddingBottom, floatingBottom } = useTabBarSpacing({ contentExtra: 220 });

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
            <AppTopBar title="Your Rental Plan" />

            <ScrollView className="flex-1 px-5 py-7" contentContainerStyle={{ paddingBottom: contentPaddingBottom }} showsVerticalScrollIndicator={false}>
                <Text className="ml-1 text-sm font-bold uppercase tracking-widest text-slate-400">Selected Items</Text>
                <View className="mt-3 overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    {PLAN_ITEMS.map((item, index) => (
                        <View
                            key={item.product.id}
                            className={`flex-row items-center gap-4 p-5 ${index < PLAN_ITEMS.length - 1 ? "border-b border-gray-50" : ""
                                }`}
                        >
                            <View className="h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                                <Image source={{ uri: item.product.image }} className="h-full w-full" resizeMode="cover" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                                    {item.product.name}
                                </Text>
                                <Text className="mt-1 text-sm text-slate-400">Quantity: {item.quantity}</Text>
                                <TouchableOpacity>
                                    <Text className="mt-2 text-sm font-bold uppercase text-red-400">Remove</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="items-end">
                                <Text className="text-base font-bold text-primary">${item.product.price}</Text>
                                <Text className="text-sm uppercase text-slate-400">/mo</Text>
                            </View>
                        </View>
                    ))}
                    <View className="flex-row items-center justify-between bg-gray-50 p-5">
                        <Text className="text-sm text-slate-500">Subtotal (Monthly)</Text>
                        <Text className="text-base font-bold text-gray-900">${monthlyTotal}.00</Text>
                    </View>
                </View>

                <View className="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-sm font-bold text-gray-900">Subscription Term</Text>
                            <Text className="mt-1 text-sm text-slate-400">12-month standard contract</Text>
                        </View>
                        <View className="flex-row items-center rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5">
                            <MaterialIcons name="calendar-today" size={14} color="#6B8599" />
                            <Text className="ml-2 text-sm font-bold uppercase text-primary">12 Months</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View
                className="absolute left-0 right-0 border-t border-gray-100 bg-white/95 px-6 py-5"
                style={{ bottom: floatingBottom }}
            >
                <View className="mb-4 items-center">
                    <Text className="text-sm font-medium text-slate-400">Monthly Total</Text>
                    <View className="flex-row items-end">
                        <Text className="text-4xl font-bold tracking-tight text-gray-900">${monthlyTotal}</Text>
                        <Text className="mb-1 text-lg text-slate-300">.00</Text>
                    </View>
                    <Text className="mt-1 text-sm text-slate-400">
                        Annual contract value: ${(monthlyTotal * 12).toLocaleString()}.00
                    </Text>
                </View>

                <TouchableOpacity
                    className="flex-row items-center justify-center rounded-xl bg-primary py-4"
                    onPress={() => router.push("/checkout/delivery")}
                >
                    <Text className="text-base font-semibold text-white">Confirm Plan</Text>
                    <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
                <Text className="mt-3 text-center text-sm uppercase tracking-wider text-slate-400">
                    Secure B2B Subscription Agreement
                </Text>
            </View>
        </SafeAreaView>
    );
}
