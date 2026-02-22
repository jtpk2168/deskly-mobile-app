import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useSubscriptions } from "../../hooks/useApi";
import {
    AppTopBar,
    AuthRequiredState,
    EmptyState,
    ErrorState,
    LoadingState,
    StatusPill,
} from "../../components/ui";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../lib/ui";

export default function RentalsScreen() {
    const { user, isLoading: authLoading } = useAuth();
    const { contentPaddingBottom } = useTabBarSpacing();
    const { data: subscriptions, loading, error, refetch } = useSubscriptions(user?.id);

    useFocusEffect(
        useCallback(() => {
            if (user?.id) {
                void refetch();
            }
        }, [refetch, user?.id])
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100" edges={["top", "left", "right"]}>
            <AppTopBar title="My Rentals" />

            <ScrollView className="flex-1 px-6 py-7" contentContainerStyle={{ paddingBottom: contentPaddingBottom }} showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                    <Text className="text-xl font-bold text-gray-900">Your Active Rentals</Text>
                    <Text className="mt-2 text-sm text-slate-500">Order status is updated by admin and reflected here.</Text>
                </View>

                {authLoading || loading ? (
                    <LoadingState label="Loading rentals..." />
                ) : !user ? (
                    <AuthRequiredState
                        description="Sign in to view and manage your active rentals."
                        onActionPress={() => router.push("/(auth)/login")}
                    />
                ) : error ? (
                    <ErrorState title="Connection Error" description={error} />
                ) : !subscriptions || subscriptions.length === 0 ? (
                    <EmptyState
                        icon="event-seat"
                        title="No Active Rentals"
                        description="Browse our catalog to find the perfect furniture for your workspace."
                        actionLabel="Browse Catalog"
                        onActionPress={() => router.push("/(tabs)/catalog")}
                    />
                ) : (
                    <>
                        {subscriptions.map((sub) => {
                            return (
                                <TouchableOpacity
                                    key={sub.id}
                                    activeOpacity={0.9}
                                    className="relative mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5"
                                    onPress={() =>
                                        router.push({
                                            pathname: '/rentals/[id]',
                                            params: { id: sub.id },
                                        })
                                    }
                                >
                                <View className="absolute right-5 top-5 flex-row items-center">
                                    <StatusPill status={sub.status} className="py-0.5" />
                                    <MaterialIcons name="chevron-right" size={18} color="#94A3B8" style={{ marginLeft: 6 }} />
                                </View>

                                <View className="mb-5 pr-24">
                                    <Text className="text-lg font-bold leading-tight text-gray-900">
                                        {sub.bundles?.name ?? 'Furniture Rental'}
                                    </Text>
                                    <Text className="mt-1 text-sm font-bold uppercase tracking-wider text-slate-400">
                                        ID: #{sub.id.substring(0, 8).toUpperCase()}
                                    </Text>
                                </View>

                                <View className="flex-row gap-3">
                                    <View className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                        <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">Monthly Rate</Text>
                                        <Text className="mt-1 text-base font-bold text-gray-900">
                                            {formatCurrency(sub.monthly_total)}
                                        </Text>
                                    </View>
                                    <View className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                        <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">Ends On</Text>
                                        <Text className="mt-1 text-base font-bold text-gray-900">
                                            {sub.end_date ? new Date(sub.end_date).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' }) : '—'}
                                        </Text>
                                    </View>
                                </View>
                                </TouchableOpacity>
                            );
                        })}
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
