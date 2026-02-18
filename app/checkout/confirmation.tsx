import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { AppTopBar } from "../../components/ui/AppTopBar";

const DEFAULT_SST_RATE_PERCENT = 8;

function toNumeric(value: unknown) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
    return `RM ${value.toFixed(2)}`;
}

function formatDate(value: string | undefined) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-MY", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function normalizeStatus(value: string | undefined) {
    const normalized = (value ?? "pending").trim().toLowerCase();
    if (!normalized) return "pending";
    return normalized;
}

function formatStatusLabel(status: string) {
    return status
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function statusBadgeClassName(status: string) {
    if (status === "active") return "bg-green-100";
    if (status === "pending") return "bg-yellow-100";
    if (status === "pending_payment") return "bg-amber-100";
    if (status === "payment_failed") return "bg-rose-100";
    if (status === "incomplete") return "bg-orange-100";
    if (status === "cancelled") return "bg-red-100";
    if (status === "completed") return "bg-blue-100";
    return "bg-gray-100";
}

function statusTextClassName(status: string) {
    if (status === "active") return "text-green-700";
    if (status === "pending") return "text-yellow-700";
    if (status === "pending_payment") return "text-amber-700";
    if (status === "payment_failed") return "text-rose-700";
    if (status === "incomplete") return "text-orange-700";
    if (status === "cancelled") return "text-red-700";
    if (status === "completed") return "text-blue-700";
    return "text-gray-600";
}

function statusDotClassName(status: string) {
    if (status === "active") return "bg-green-500";
    if (status === "pending") return "bg-yellow-500";
    if (status === "pending_payment") return "bg-amber-500";
    if (status === "payment_failed") return "bg-rose-500";
    if (status === "incomplete") return "bg-orange-500";
    if (status === "cancelled") return "bg-red-500";
    if (status === "completed") return "bg-blue-500";
    return "bg-gray-400";
}

export default function OrderConfirmationScreen() {
    const {
        orderId,
        productName,
        monthlyTotal,
        subtotalAmount,
        sstAmount,
        sstRatePercent,
        status,
        durationMonths,
        startDate,
        endDate,
    } = useLocalSearchParams<{
        orderId?: string;
        productName?: string;
        monthlyTotal?: string;
        subtotalAmount?: string;
        sstAmount?: string;
        sstRatePercent?: string;
        status?: string;
        durationMonths?: string;
        startDate?: string;
        endDate?: string;
    }>();

    const monthlyTotalValue = toNumeric(monthlyTotal);
    const providedSubtotalValue = toNumeric(subtotalAmount);
    const providedSstAmountValue = toNumeric(sstAmount);
    const requestedSstRatePercent = toNumeric(sstRatePercent);
    const effectiveSstRatePercent = requestedSstRatePercent > 0 ? requestedSstRatePercent : DEFAULT_SST_RATE_PERCENT;
    const computedFallbackSubtotal =
        monthlyTotalValue > 0
            ? Number((monthlyTotalValue / (1 + (effectiveSstRatePercent / 100))).toFixed(2))
            : 0;
    const monthlySubtotalValue = providedSubtotalValue > 0 ? providedSubtotalValue : computedFallbackSubtotal;
    const monthlySstValue =
        providedSstAmountValue > 0
            ? providedSstAmountValue
            : Number((monthlyTotalValue - monthlySubtotalValue).toFixed(2));
    const sstRateLabel = Number.isInteger(effectiveSstRatePercent)
        ? `${effectiveSstRatePercent.toFixed(0)}%`
        : `${effectiveSstRatePercent.toFixed(2)}%`;
    const orderCode = orderId ? `#${orderId.substring(0, 8).toUpperCase()}` : "—";
    const orderStatus = normalizeStatus(status);

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <AppTopBar title="Order Confirmation" onBackPress={() => router.back()} />

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
                <View className="w-full max-w-md self-center">
                    <View className="items-center mt-8 mb-8">
                        <View className="w-24 h-24 rounded-full bg-primary/15 items-center justify-center mb-6 ring-1 ring-primary/20 shadow-lg">
                            <MaterialIcons name="check-circle-outline" size={64} color="#6B8599" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Order Submitted</Text>
                        <Text className="text-gray-600 dark:text-gray-300 text-base text-center max-w-[280px] mb-8">
                            Your order <Text className="font-semibold text-gray-800 dark:text-gray-100">{orderCode}</Text> has been created successfully.
                        </Text>
                    </View>

                    <View className="w-full bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-10">
                        <View className="items-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-700 border-dashed">
                            <Text className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-1">Total Monthly Payment</Text>
                            <View className="flex-row items-baseline space-x-1">
                                <Text className="text-3xl font-bold text-primary">{formatCurrency(monthlyTotalValue)}</Text>
                                <Text className="text-sm text-gray-500 dark:text-gray-400">/mo</Text>
                            </View>
                            <View className="mt-3 w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-xs text-slate-500">Subtotal</Text>
                                    <Text className="text-xs font-semibold text-gray-900">{formatCurrency(monthlySubtotalValue)}</Text>
                                </View>
                                <View className="mt-1 flex-row items-center justify-between">
                                    <Text className="text-xs text-slate-500">SST ({sstRateLabel})</Text>
                                    <Text className="text-xs font-semibold text-gray-900">{formatCurrency(monthlySstValue)}</Text>
                                </View>
                            </View>
                            <Text className="mt-2 text-sm text-slate-500">{productName ?? "Furniture Rental"}</Text>
                        </View>

                        <View className="space-y-4">
                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center space-x-3">
                                    <View className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <MaterialIcons name="receipt-long" size={18} color="#9CA3AF" />
                                    </View>
                                    <Text className="text-base text-gray-600 dark:text-gray-300">Order ID</Text>
                                </View>
                                <Text className="text-base font-semibold text-gray-900 dark:text-white">{orderCode}</Text>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center space-x-3">
                                    <View className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <MaterialIcons name="info-outline" size={18} color="#9CA3AF" />
                                    </View>
                                    <Text className="text-base text-gray-600 dark:text-gray-300">Order Status</Text>
                                </View>
                                <View className={`flex-row items-center rounded-full px-2 py-1 ${statusBadgeClassName(orderStatus)}`}>
                                    <View className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusDotClassName(orderStatus)}`} />
                                    <Text className={`text-sm font-semibold ${statusTextClassName(orderStatus)}`}>
                                        {formatStatusLabel(orderStatus)}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center space-x-3">
                                    <View className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <MaterialIcons name="calendar-today" size={18} color="#9CA3AF" />
                                    </View>
                                    <Text className="text-base text-gray-600 dark:text-gray-300">Contract Duration</Text>
                                </View>
                                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                                    {durationMonths ? `${durationMonths} Months` : "—"}
                                </Text>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center space-x-3">
                                    <View className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <MaterialIcons name="event-available" size={18} color="#9CA3AF" />
                                    </View>
                                    <Text className="text-base text-gray-600 dark:text-gray-300">Start Date</Text>
                                </View>
                                <Text className="text-base font-semibold text-gray-900 dark:text-white">{formatDate(startDate)}</Text>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center space-x-3">
                                    <View className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <MaterialIcons name="event-busy" size={18} color="#9CA3AF" />
                                    </View>
                                    <Text className="text-base text-gray-600 dark:text-gray-300">End Date</Text>
                                </View>
                                <Text className="text-base font-semibold text-gray-900 dark:text-white">{formatDate(endDate)}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="w-full pb-8">
                        <TouchableOpacity
                            className="mb-3 w-full bg-primary py-4 px-4 rounded-xl shadow-lg shadow-blue-500/20 flex-row items-center justify-center space-x-2"
                            onPress={() => router.push('/(tabs)/rentals')}
                        >
                            <Text className="text-white text-base font-medium">View Order Status</Text>
                            <MaterialIcons name="arrow-forward" size={18} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-full bg-transparent py-4 px-4 rounded-xl border border-gray-200 dark:border-gray-700 items-center justify-center"
                            onPress={() => router.push('/(tabs)')}
                        >
                            <Text className="text-base text-gray-600 dark:text-gray-400 font-medium">Go to Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
