import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSubscriptions } from "../../hooks/useApi";
import { AppTopBar } from "../../components/ui/AppTopBar";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";

// TODO: Replace with real auth user ID after auth is connected
const MOCK_USER_ID = undefined;

export default function RentalsScreen() {
    const { contentPaddingBottom } = useTabBarSpacing();
    const { data: subscriptions, loading, error } = useSubscriptions(MOCK_USER_ID);

    return (
        <SafeAreaView className="flex-1 bg-gray-100" edges={["top", "left", "right"]}>
            <AppTopBar title="My Rentals" />

            <ScrollView className="flex-1 px-6 py-7" contentContainerStyle={{ paddingBottom: contentPaddingBottom }} showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                    <Text className="text-xl font-bold text-gray-900">Your Active Rentals</Text>
                    <Text className="mt-2 text-sm text-slate-500">Manage your enterprise furniture fleet.</Text>
                </View>

                {loading ? (
                    <View className="items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#6B8599" />
                        <Text className="mt-3 text-sm text-slate-400">Loading rentals...</Text>
                    </View>
                ) : error ? (
                    <View className="items-center justify-center py-16 px-4">
                        <MaterialIcons name="wifi-off" size={48} color="#CBD5E1" />
                        <Text className="mt-3 text-base font-semibold text-gray-700">Connection Error</Text>
                        <Text className="mt-1 text-sm text-slate-400 text-center">{error}</Text>
                    </View>
                ) : !subscriptions || subscriptions.length === 0 ? (
                    <View className="items-center justify-center py-16 px-4">
                        <View className="h-20 w-20 items-center justify-center rounded-full bg-white mb-4">
                            <MaterialIcons name="event-seat" size={40} color="#CBD5E1" />
                        </View>
                        <Text className="text-lg font-bold text-gray-900 mb-2">No Active Rentals</Text>
                        <Text className="text-sm text-slate-400 text-center mb-6">
                            Browse our catalog to find the perfect furniture for your workspace.
                        </Text>
                        <TouchableOpacity
                            className="rounded-xl bg-primary px-8 py-3.5"
                            onPress={() => router.push("/(tabs)/catalog")}
                        >
                            <Text className="text-sm font-semibold text-white">Browse Catalog</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {subscriptions.map((sub) => (
                            <View key={sub.id} className="relative mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5">
                                <View className="absolute right-5 top-5">
                                    <View className={`flex-row items-center rounded-full px-2 py-0.5 ${sub.status === 'active' ? 'bg-green-100' :
                                            sub.status === 'pending' ? 'bg-yellow-100' :
                                                'bg-gray-100'
                                        }`}>
                                        <View className={`mr-1.5 h-1.5 w-1.5 rounded-full ${sub.status === 'active' ? 'bg-green-500' :
                                                sub.status === 'pending' ? 'bg-yellow-500' :
                                                    'bg-gray-400'
                                            }`} />
                                        <Text className={`text-sm font-bold uppercase ${sub.status === 'active' ? 'text-green-700' :
                                                sub.status === 'pending' ? 'text-yellow-700' :
                                                    'text-gray-500'
                                            }`}>{sub.status}</Text>
                                    </View>
                                </View>

                                <View className="mb-5 flex-row items-start gap-4">
                                    <View className="h-14 w-14 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
                                        <MaterialIcons name="event-seat" size={28} color="#6B8599" />
                                    </View>
                                    <View className="pr-16">
                                        <Text className="text-lg font-bold leading-tight text-gray-900">
                                            {sub.bundles?.name ?? 'Furniture Rental'}
                                        </Text>
                                        <Text className="mt-1 text-sm font-bold uppercase tracking-wider text-slate-400">
                                            ID: #{sub.id.substring(0, 8).toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row gap-3">
                                    <View className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                        <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">Monthly Rate</Text>
                                        <Text className="mt-1 text-base font-bold text-gray-900">
                                            RM {sub.monthly_total ?? '—'}
                                        </Text>
                                    </View>
                                    <View className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                        <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">Ends On</Text>
                                        <Text className="mt-1 text-base font-bold text-gray-900">
                                            {sub.end_date ? new Date(sub.end_date).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' }) : '—'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {/* Support card */}
                <View className="mt-2 rounded-2xl bg-primary p-6">
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
