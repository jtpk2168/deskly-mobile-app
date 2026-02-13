import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AppTopBar } from "../../components/ui/AppTopBar";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";

export default function PlanScreen() {
    const { contentPaddingBottom, floatingBottom } = useTabBarSpacing({ contentExtra: 220 });

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
            <AppTopBar title="Your Rental Plan" />

            <ScrollView className="flex-1 px-5 py-7" contentContainerStyle={{ paddingBottom: contentPaddingBottom }} showsVerticalScrollIndicator={false}>
                {/* Empty plan state */}
                <View className="items-center justify-center py-16 px-4">
                    <View className="h-20 w-20 items-center justify-center rounded-full bg-white mb-4">
                        <MaterialIcons name="shopping-cart" size={40} color="#CBD5E1" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900 mb-2">Your Plan is Empty</Text>
                    <Text className="text-sm text-slate-400 text-center mb-6">
                        Browse our catalog and add furniture to build your custom rental plan.
                    </Text>
                    <TouchableOpacity
                        className="rounded-xl bg-primary px-8 py-3.5"
                        onPress={() => router.push("/(tabs)/catalog")}
                    >
                        <Text className="text-sm font-semibold text-white">Browse Catalog</Text>
                    </TouchableOpacity>
                </View>

                {/* Subscription info */}
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

            {/* Bottom CTA */}
            <View
                className="absolute left-0 right-0 border-t border-gray-100 bg-white/95 px-6 py-5"
                style={{ bottom: floatingBottom }}
            >
                <View className="mb-4 items-center">
                    <Text className="text-sm font-medium text-slate-400">Monthly Total</Text>
                    <View className="flex-row items-end">
                        <Text className="text-4xl font-bold tracking-tight text-gray-900">RM 0</Text>
                        <Text className="mb-1 text-lg text-slate-300">.00</Text>
                    </View>
                    <Text className="mt-1 text-sm text-slate-400">Add items from catalog to get started</Text>
                </View>

                <TouchableOpacity
                    className="flex-row items-center justify-center rounded-xl bg-gray-200 py-4"
                    disabled
                >
                    <Text className="text-base font-semibold text-slate-400">Confirm Plan</Text>
                    <MaterialIcons name="arrow-forward" size={18} color="#94A3B8" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
                <Text className="mt-3 text-center text-sm uppercase tracking-wider text-slate-400">
                    Secure B2B Subscription Agreement
                </Text>
            </View>
        </SafeAreaView>
    );
}
