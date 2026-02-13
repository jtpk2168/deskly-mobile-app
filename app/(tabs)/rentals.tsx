import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { AppTopBar } from "../../components/ui/AppTopBar";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";

export default function RentalsScreen() {
    const { contentPaddingBottom } = useTabBarSpacing();

    return (
        <SafeAreaView className="flex-1 bg-gray-100" edges={["top", "left", "right"]}>
            <AppTopBar title="My Rentals" />

            <ScrollView className="flex-1 px-6 py-7" contentContainerStyle={{ paddingBottom: contentPaddingBottom }} showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                    <Text className="text-xl font-bold text-gray-900">Your Active Rentals</Text>
                    <Text className="mt-2 text-sm text-slate-500">Manage your enterprise furniture fleet.</Text>
                </View>

                <View className="relative mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5">
                    <View className="absolute right-5 top-5">
                        <View className="flex-row items-center rounded-full bg-green-100 px-2 py-0.5">
                            <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                            <Text className="text-sm font-bold uppercase text-green-700">Active</Text>
                        </View>
                    </View>

                    <View className="mb-5 flex-row items-start gap-4">
                        <View className="h-14 w-14 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
                            <MaterialIcons name="event-seat" size={28} color="#6B8599" />
                        </View>
                        <View className="pr-16">
                            <Text className="text-lg font-bold leading-tight text-gray-900">Executive Suite Upgrade</Text>
                            <Text className="mt-1 text-sm font-bold uppercase tracking-wider text-slate-400">
                                ID: #DSK-8921-X
                            </Text>
                        </View>
                    </View>

                    <View className="mb-6 flex-row gap-3">
                        <View className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">Monthly Rate</Text>
                            <Text className="mt-1 text-base font-bold text-gray-900">$450.00</Text>
                        </View>
                        <View className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">Ends On</Text>
                            <Text className="mt-1 text-base font-bold text-gray-900">Dec 2026</Text>
                        </View>
                    </View>

                    <View>
                        <View className="mb-2 flex-row justify-between">
                            <Text className="text-sm font-bold uppercase tracking-wider text-slate-400">Contract Progress</Text>
                            <Text className="text-sm font-bold uppercase tracking-wider text-primary">8 Months Left</Text>
                        </View>
                        <View className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <View className="h-full w-1/3 rounded-full bg-primary" />
                        </View>
                    </View>
                </View>

                <View className="rounded-2xl bg-primary p-6">
                    <View className="flex-row items-start justify-between">
                        <View>
                            <Text className="text-lg font-bold text-white">Need Assistance?</Text>
                            <Text className="mt-2 max-w-[220px] text-sm text-white/80">
                                Our enterprise support team is ready to help with scale-ups or office moves.
                            </Text>
                        </View>
                        <View className="rounded-full bg-white/20 p-2">
                            <MaterialIcons name="support-agent" size={20} color="#FFFFFF" />
                        </View>
                    </View>
                    <View className="mt-6 flex-row gap-3">
                        <TouchableOpacity className="flex-1 rounded-xl bg-white py-3.5">
                            <Text className="text-center text-sm font-bold text-primary">Live Chat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 rounded-xl border border-white/30 bg-primary-dark py-3.5">
                            <Text className="text-center text-sm font-bold text-white">Call Support</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
