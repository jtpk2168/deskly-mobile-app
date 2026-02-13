import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AppTopBar } from "../../components/ui/AppTopBar";

// Mock Map Image (using the one from mockup or similar)
const MAP_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuC0y-d5IgsQG7VlGGOs_1XWOHQb2MBXWHGZF_ti_Jimv9_mhO6JnlMINlHVV4AQWzMHJRyCQD_vOWllswabfhpdxRzLLotcXIsgd4n7B__44fVuKZiUfjQb_2iHyvdR9b-Eg0bg01lsly3QjWCat__xt0k2ZeimpPfsPhluV4Q9k8EBK63SP2p2odu-6LqKTAYnPd4aH6E74C2nxrW7w7iYy96z9MnzIUTNnMfo2uksPaQR4HyvF_r9OCEFXJRGwbDOq-NgCIUiCUE";

export default function OrderConfirmationScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <AppTopBar title="Order Confirmation" onBackPress={() => router.back()} />

            <View className="w-full max-w-md flex-1 justify-between self-center p-6">

                {/* Status & Header */}
                <View className="flex-1 items-center justify-center mt-8 mb-8">
                    <View className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-6 ring-1 ring-primary/20 shadow-lg shadow-blue-500/10">
                        <MaterialIcons name="check-circle-outline" size={64} className="text-primary" color="#3B82F6" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Subscription Activated</Text>
                    <Text className="text-gray-600 dark:text-gray-300 text-base text-center max-w-[280px]">
                        Your office setup order <Text className="font-semibold text-gray-800 dark:text-gray-100">#8842</Text> has been successfully confirmed.
                    </Text>
                </View>

                {/* Order Summary Card */}
                <View className="w-full bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-10">
                    {/* Header of Card */}
                    <View className="items-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-700 border-dashed">
                        <Text className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-1">Total Monthly Payment</Text>
                        <View className="flex-row items-baseline space-x-1">
                            <Text className="text-3xl font-bold text-primary">$450.00</Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">/mo</Text>
                        </View>
                    </View>

                    {/* Details Grid */}
                    <View className="space-y-4">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center space-x-3">
                                <View className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <MaterialIcons name="calendar-today" size={18} className="text-gray-500 dark:text-gray-400" color="#9CA3AF" />
                                </View>
                                <Text className="text-base text-gray-600 dark:text-gray-300">Contract Duration</Text>
                            </View>
                            <Text className="text-base font-semibold text-gray-900 dark:text-white">12 Months</Text>
                        </View>

                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center space-x-3">
                                <View className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <MaterialIcons name="local-shipping" size={18} className="text-gray-500 dark:text-gray-400" color="#9CA3AF" />
                                </View>
                                <Text className="text-base text-gray-600 dark:text-gray-300">Est. Delivery</Text>
                            </View>
                            <Text className="text-base font-semibold text-gray-900 dark:text-white">Oct 24, 2023</Text>
                        </View>

                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center space-x-3">
                                <View className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <MaterialIcons name="receipt-long" size={18} className="text-gray-500 dark:text-gray-400" color="#9CA3AF" />
                                </View>
                                <Text className="text-base text-gray-600 dark:text-gray-300">Next Billing</Text>
                            </View>
                            <Text className="text-base font-semibold text-gray-900 dark:text-white">Nov 24, 2023</Text>
                        </View>
                    </View>

                    {/* Mini Map Preview */}
                    <View className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 border-dashed">
                        <View className="relative w-full h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <Image
                                source={{ uri: MAP_IMAGE }}
                                className="w-full h-full opacity-60 dark:opacity-40"
                                resizeMode="cover"
                            />
                            <View className="absolute inset-0 bg-white/40 dark:bg-black/40" />
                            <View className="absolute bottom-2 left-3 flex-row items-center space-x-2">
                                <View className="bg-primary px-2 py-0.5 rounded-full shadow-sm">
                                    <Text className="text-white text-sm font-bold uppercase tracking-wide">Preparing</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="w-full space-y-3 pb-8">
                    <TouchableOpacity className="w-full bg-primary py-4 px-4 rounded-xl shadow-lg shadow-blue-500/20 flex-row items-center justify-center space-x-2">
                        <Text className="text-white text-base font-medium">Track Delivery</Text>
                        <MaterialIcons name="arrow-forward" size={18} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-full bg-transparent py-4 px-4 rounded-xl border border-gray-200 dark:border-gray-700 items-center justify-center"
                        onPress={() => router.push('/(tabs)')}
                    >
                        <Text className="text-base text-gray-600 dark:text-gray-400 font-medium">Go to Dashboard</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
}
