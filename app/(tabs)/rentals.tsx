import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useSubscriptions } from "../../hooks/useApi";
import { AppTopBar } from "../../components/ui/AppTopBar";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";
import { useAuth } from "../../contexts/AuthContext";

function formatCurrency(value: number | null) {
    if (value == null) return "RM —";
    return `RM ${Number(value).toFixed(2)}`;
}

function formatStatusLabel(status: string) {
    return status
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function normalizeBillingStatus(value: string | null | undefined) {
    const normalized = (value ?? "pending_payment").trim().toLowerCase();
    if (!normalized) return "pending_payment";
    if (normalized === "pending" || normalized === "incomplete") return "pending_payment";
    return normalized;
}

function statusBadgeClassName(status: string) {
    if (status === "active") return "bg-green-100";
    if (status === "pending_payment") return "bg-amber-100";
    if (status === "payment_failed") return "bg-rose-100";
    if (status === "cancelled") return "bg-red-100";
    if (status === "completed") return "bg-blue-100";
    return "bg-gray-100";
}

function statusDotClassName(status: string) {
    if (status === "active") return "bg-green-500";
    if (status === "pending_payment") return "bg-amber-500";
    if (status === "payment_failed") return "bg-rose-500";
    if (status === "cancelled") return "bg-red-500";
    if (status === "completed") return "bg-blue-500";
    return "bg-gray-400";
}

function statusTextClassName(status: string) {
    if (status === "active") return "text-green-700";
    if (status === "pending_payment") return "text-amber-700";
    if (status === "payment_failed") return "text-rose-700";
    if (status === "cancelled") return "text-red-700";
    if (status === "completed") return "text-blue-700";
    return "text-gray-500";
}

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
                    <View className="items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#6B8599" />
                        <Text className="mt-3 text-sm text-slate-400">Loading rentals...</Text>
                    </View>
                ) : !user ? (
                    <View className="items-center justify-center py-16 px-4">
                        <View className="h-20 w-20 items-center justify-center rounded-full bg-white mb-4">
                            <MaterialIcons name="lock-outline" size={40} color="#CBD5E1" />
                        </View>
                        <Text className="text-lg font-bold text-gray-900 mb-2">Sign In Required</Text>
                        <Text className="text-sm text-slate-400 text-center mb-6">
                            Sign in to view and manage your active rentals.
                        </Text>
                        <TouchableOpacity
                            className="rounded-xl bg-primary px-8 py-3.5"
                            onPress={() => router.push("/(auth)/login")}
                        >
                            <Text className="text-sm font-semibold text-white">Go to Login</Text>
                        </TouchableOpacity>
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
                        {subscriptions.map((sub) => {
                            const normalizedStatus = normalizeBillingStatus(sub.status);
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
                                    <View className={`flex-row items-center rounded-full px-2 py-0.5 ${statusBadgeClassName(normalizedStatus)}`}>
                                        <View className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusDotClassName(normalizedStatus)}`} />
                                        <Text className={`text-xs font-bold uppercase ${statusTextClassName(normalizedStatus)}`}>
                                            {formatStatusLabel(normalizedStatus)}
                                        </Text>
                                    </View>
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
