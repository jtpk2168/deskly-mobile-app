import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AppTopBar, EmptyState, PriceSummaryRow, StickyActionBar } from "../../components/ui";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";
import { useCart } from "../../contexts/CartContext";
import { calculateContractTotal, calculateSstBreakdown, formatCurrency, formatPercentLabel } from "../../lib/ui";

const DURATION_OPTIONS = [12, 24];
const SST_RATE = 0.08;
const SST_RATE_PERCENT_LABEL = formatPercentLabel(SST_RATE * 100);

export default function PlanScreen() {
    const { contentPaddingBottom, floatingBottom } = useTabBarSpacing({ contentExtra: 140 });
    const {
        items,
        itemCount,
        monthlyTotal,
        cartDurationMonths,
        setCartDuration,
        updateQuantity,
        removeFromCart,
        clearCart,
    } = useCart();

    const checkoutDurationMonths = cartDurationMonths;
    const contractTotal = calculateContractTotal(
        items.map((item) => ({ monthlyPrice: item.monthlyPrice, quantity: item.quantity })),
        checkoutDurationMonths,
    );
    const { subtotal: monthlySubtotal, sstAmount: monthlySst, total: monthlyTotalWithSst } = calculateSstBreakdown(monthlyTotal, SST_RATE);

    const handleConfirmPlan = () => {
        if (itemCount === 0) return;

        router.push({
            pathname: "/checkout/delivery",
            params: {
                productName: `${itemCount} ${itemCount === 1 ? "item" : "items"} in plan`,
                monthlyTotal: String(monthlyTotal),
                durationMonths: String(checkoutDurationMonths),
                fromCart: "1",
            },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
            <AppTopBar title="Your Rental Plan" />

            <ScrollView className="flex-1 px-5 py-7" contentContainerStyle={{ paddingBottom: contentPaddingBottom }} showsVerticalScrollIndicator={false}>
                {items.length === 0 ? (
                    <EmptyState
                        icon="shopping-cart"
                        title="Your Cart is Empty"
                        description="Browse our catalog and add furniture to build your custom rental plan."
                        actionLabel="Browse Catalog"
                        onActionPress={() => router.push("/(tabs)/catalog")}
                    />
                ) : (
                    <>
                        <View className="mb-3 rounded-2xl border border-gray-100 bg-white p-4">
                            <View className="mb-2 flex-row items-center justify-between">
                                <Text className="text-xs uppercase tracking-wider text-slate-400">Order Duration</Text>
                                <Text className="text-xs font-semibold uppercase tracking-wider text-primary">
                                    {checkoutDurationMonths} months
                                </Text>
                            </View>
                            <View className="flex-row gap-2">
                                {DURATION_OPTIONS.map((months) => {
                                    const selected = checkoutDurationMonths === months;
                                    return (
                                        <TouchableOpacity
                                            key={months}
                                            className={`flex-1 items-center rounded-lg py-2 ${selected ? "bg-primary" : "bg-gray-50"}`}
                                            onPress={() => setCartDuration(months)}
                                        >
                                            <Text className={`text-sm font-bold ${selected ? "text-white" : "text-slate-500"}`}>
                                                {months}M
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            <Text className="mt-3 text-xs text-slate-500">
                                One order = one duration. For different durations, place a separate order.
                            </Text>
                        </View>

                        <View className="space-y-3">
                            {items.map((item) => (
                                <View key={item.id} className="rounded-2xl border border-gray-100 bg-white p-4">
                                    <View className="flex-row items-start">
                                        <View className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                                            {item.imageUrl ? (
                                                <Image source={{ uri: item.imageUrl }} className="h-full w-full" resizeMode="cover" />
                                            ) : (
                                                <View className="h-full w-full items-center justify-center">
                                                    <MaterialIcons name="event-seat" size={26} color="#94A3B8" />
                                                </View>
                                            )}
                                        </View>
                                        <View className="ml-3 flex-1">
                                            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                                                {item.name}
                                            </Text>
                                            <Text className="mt-1 text-sm text-slate-400">{item.category ?? "Furniture"}</Text>
                                            <Text className="mt-2 text-sm font-semibold text-primary">
                                                {formatCurrency(item.monthlyPrice)} /mo
                                            </Text>
                                            <Text className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                                                {checkoutDurationMonths} months
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => removeFromCart(item.id)}
                                            className="rounded-full p-2"
                                            accessibilityRole="button"
                                            accessibilityLabel={`Remove ${item.name}`}
                                        >
                                            <MaterialIcons name="delete-outline" size={20} color="#94A3B8" />
                                        </TouchableOpacity>
                                    </View>

                                    <View className="mt-4 flex-row items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                                        <Text className="text-xs uppercase tracking-wider text-slate-400">Quantity</Text>
                                        <View className="flex-row items-center">
                                            <TouchableOpacity
                                                className="h-8 w-8 items-center justify-center rounded-full bg-white"
                                                onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            >
                                                <MaterialIcons name="remove" size={16} color="#6B8599" />
                                            </TouchableOpacity>
                                            <Text className="mx-3 text-sm font-bold text-gray-900">{item.quantity}</Text>
                                            <TouchableOpacity
                                                className="h-8 w-8 items-center justify-center rounded-full bg-white"
                                                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <MaterialIcons name="add" size={16} color="#6B8599" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {items.length > 0 && (
                    <View className="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-sm font-semibold text-gray-900">Plan Summary</Text>
                        </View>
                        <Text className="mt-1 text-sm text-slate-600">
                            Monthly billing uses one shared duration for all items in this order.
                        </Text>

                        <View className="mt-4 space-y-2">
                            {items.map((item) => {
                                const lineMonthlyTotal = item.monthlyPrice * item.quantity;
                                return (
                                    <View key={`${item.id}-summary`} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                                        <View className="flex-row items-start justify-between">
                                            <View className="pr-3">
                                                <Text className="text-sm font-semibold text-gray-900">{item.name}</Text>
                                                <Text className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                                                    {item.quantity} x {formatCurrency(item.monthlyPrice)} /mo
                                                </Text>
                                                <Text className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                                                    {checkoutDurationMonths} months
                                                </Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-[11px] uppercase tracking-wider text-slate-500">Line Total</Text>
                                                <Text className="text-sm font-semibold text-gray-900">{formatCurrency(lineMonthlyTotal)} /mo</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        <View className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                            <PriceSummaryRow label="Monthly Subtotal" value={`${formatCurrency(monthlySubtotal)} /mo`} valueTone="strong" />
                        </View>

                        <View className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                            <PriceSummaryRow label={`SST (${SST_RATE_PERCENT_LABEL})`} value={`${formatCurrency(monthlySst)} /mo`} valueTone="strong" />
                        </View>

                        <View className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                            <PriceSummaryRow label="Estimated Monthly Total" value={`${formatCurrency(monthlyTotalWithSst)} /mo`} valueTone="primary" />
                        </View>

                        <View className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                            <PriceSummaryRow label="Estimated Contract Value" value={formatCurrency(contractTotal)} valueTone="strong" />
                        </View>
                    </View>
                )}
            </ScrollView>

            <StickyActionBar bottomOffset={floatingBottom}>
                <TouchableOpacity
                    className={`flex-row items-center justify-center rounded-xl py-4 ${itemCount > 0 ? "bg-primary" : "bg-gray-200"}`}
                    disabled={itemCount === 0}
                    onPress={handleConfirmPlan}
                >
                    <Text className={`text-base font-semibold ${itemCount > 0 ? "text-white" : "text-slate-400"}`}>Confirm Plan</Text>
                    <MaterialIcons name="arrow-forward" size={18} color={itemCount > 0 ? "#FFFFFF" : "#94A3B8"} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
                {itemCount > 0 && (
                    <TouchableOpacity onPress={clearCart} className="mt-3 items-center">
                        <Text className="text-sm font-medium text-slate-400">Clear Plan</Text>
                    </TouchableOpacity>
                )}
            </StickyActionBar>
        </SafeAreaView>
    );
}
