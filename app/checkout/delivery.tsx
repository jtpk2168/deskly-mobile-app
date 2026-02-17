import { Alert, View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { AppTopBar } from "../../components/ui/AppTopBar";
import { createSubscription } from "../../hooks/useApi";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";

const styles = StyleSheet.create({
    inputText: {
        fontSize: 16,
        lineHeight: 20,
        paddingVertical: 0,
        includeFontPadding: false,
    },
});

function toNumeric(value: unknown) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
    return `RM ${value.toFixed(2)}`;
}

function formatDayLabel(date: Date, offset: number) {
    if (offset === 0) return "Today";
    return date.toLocaleDateString("en-US", { weekday: "short" });
}

function addMonths(date: Date, months: number) {
    const nextDate = new Date(date);
    nextDate.setMonth(nextDate.getMonth() + months);
    return nextDate;
}

function buildDeliveryOptions() {
    return Array.from({ length: 4 }).map((_, offset) => {
        const date = new Date();
        date.setDate(date.getDate() + offset);
        return {
            day: formatDayLabel(date, offset),
            date: String(date.getDate()),
            month: date.toLocaleDateString("en-US", { month: "short" }),
            iso: date.toISOString(),
        };
    });
}

function formatDeliveryOptionLabel(option: { day: string; date: string; month: string }) {
    return `${option.day}, ${option.month} ${option.date}`;
}

export default function DeliveryCheckoutScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { items: cartItems, clearCart } = useCart();
    const {
        productName,
        monthlyTotal,
        durationMonths,
        fromCart,
    } = useLocalSearchParams<{
        productName?: string;
        monthlyTotal?: string;
        durationMonths?: string;
        fromCart?: string;
    }>();

    const [selectedDate, setSelectedDate] = useState(0);
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [city, setCity] = useState("");
    const [zipPostal, setZipPostal] = useState("");
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const deliveryOptions = useMemo(() => buildDeliveryOptions(), []);
    const selectedDateIndex = Math.min(selectedDate, deliveryOptions.length - 1);
    const selectedDeliveryOption = deliveryOptions[selectedDateIndex];
    const monthlyTotalValue = toNumeric(monthlyTotal);
    const rentalDurationMonths = (() => {
        const parsed = Number.parseInt(durationMonths ?? "", 10);
        if (!Number.isInteger(parsed) || parsed <= 0) return 12;
        return parsed;
    })();
    const isFromCartFlow = fromCart === "1" || fromCart === "true";

    const handleProceedToPayment = async () => {
        setSubmitError(null);

        if (!user) {
            Alert.alert("Sign In Required", "Please sign in to place an order.");
            router.push("/(auth)/login");
            return;
        }

        const requiredFields = [
            { label: "Company Name", value: companyName },
            { label: "Street Address", value: streetAddress },
            { label: "City", value: city },
            { label: "Zip / Postal", value: zipPostal },
            { label: "Full Name", value: fullName },
            { label: "Phone Number", value: phoneNumber },
        ];

        const missingFields = requiredFields
            .filter((field) => field.value.trim().length === 0)
            .map((field) => field.label);

        if (missingFields.length > 0) {
            const message = `Please complete all required fields: ${missingFields.join(", ")}.`;
            setSubmitError(message);
            Alert.alert("Required Fields", message);
            return;
        }

        if (!termsAccepted) {
            Alert.alert("Agreement Required", "Please accept the rental agreement before continuing.");
            return;
        }

        if (monthlyTotalValue <= 0) {
            Alert.alert("Invalid Price", "Unable to proceed because the monthly total is invalid.");
            return;
        }

        setSubmitting(true);

        try {
            const startDate = selectedDeliveryOption.iso;
            const endDate = addMonths(new Date(startDate), rentalDurationMonths).toISOString();
            const subscriptionItems = isFromCartFlow
                ? cartItems.map((item) => ({
                    product_id: item.productId,
                    product_name: item.name,
                    category: item.category ?? null,
                    monthly_price: item.monthlyPrice,
                    duration_months: item.durationMonths,
                    quantity: item.quantity,
                }))
                : [];

            const created = await createSubscription({
                user_id: user.id,
                bundle_id: null,
                start_date: startDate,
                end_date: endDate,
                monthly_total: Number(monthlyTotalValue.toFixed(2)),
                items: subscriptionItems,
            });

            if (isFromCartFlow) {
                clearCart();
            }

            router.push({
                pathname: "/checkout/confirmation",
                params: {
                    orderId: created.id,
                    productName: productName ?? "Furniture Rental",
                    monthlyTotal: String(created.monthly_total ?? monthlyTotalValue),
                    status: created.status ?? "pending",
                    durationMonths: String(rentalDurationMonths),
                    startDate: created.start_date ?? startDate,
                    endDate: created.end_date ?? endDate,
                },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create order";
            setSubmitError(message);
            Alert.alert("Order Failed", message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
            <AppTopBar title="Delivery Details" onBackPress={() => router.back()} />

            <View className="border-b border-gray-100 bg-white px-6 py-4">
                <View className="mb-2 flex-row justify-between">
                    <Text className="text-sm font-semibold text-primary">Shipping</Text>
                    <Text className="text-sm font-medium text-slate-400">Payment</Text>
                    <Text className="text-sm font-medium text-slate-400">Review</Text>
                </View>
                <View className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <View className="h-full w-1/3 rounded-full bg-primary" />
                </View>
            </View>

            <ScrollView className="flex-1 px-5 py-6" contentContainerStyle={{ paddingBottom: 190 + insets.bottom }} showsVerticalScrollIndicator={false}>
                <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-5">
                    <View className="mb-4 flex-row items-center">
                        <MaterialIcons name="location-on" size={20} color="#6B8599" />
                        <Text className="ml-2 text-base font-bold text-gray-900">Shipping Address</Text>
                    </View>
                    <View className="gap-4">
                        <View>
                            <Text className="mb-1 text-sm font-medium text-slate-600">Company Name</Text>
                            <TextInput
                                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-900"
                                placeholder="Acme Corp."
                                placeholderTextColor="#9CA3AF"
                                value={companyName}
                                onChangeText={setCompanyName}
                                style={styles.inputText}
                            />
                        </View>
                        <View>
                            <Text className="mb-1 text-sm font-medium text-slate-600">Street Address</Text>
                            <TextInput
                                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-900"
                                placeholder="123 Innovation Blvd, Suite 400"
                                placeholderTextColor="#9CA3AF"
                                value={streetAddress}
                                onChangeText={setStreetAddress}
                                style={styles.inputText}
                            />
                        </View>
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Text className="mb-1 text-sm font-medium text-slate-600">City</Text>
                                <TextInput
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-900"
                                    placeholder="San Francisco"
                                    placeholderTextColor="#9CA3AF"
                                    value={city}
                                    onChangeText={setCity}
                                    style={styles.inputText}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="mb-1 text-sm font-medium text-slate-600">Zip / Postal</Text>
                                <TextInput
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-900"
                                    placeholder="94105"
                                    placeholderTextColor="#9CA3AF"
                                    value={zipPostal}
                                    onChangeText={setZipPostal}
                                    style={styles.inputText}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-5">
                    <View className="mb-4 flex-row items-center">
                        <MaterialIcons name="person" size={20} color="#6B8599" />
                        <Text className="ml-2 text-base font-bold text-gray-900">Site Contact</Text>
                    </View>
                    <View className="gap-4">
                        <View>
                            <Text className="mb-1 text-sm font-medium text-slate-600">Full Name</Text>
                            <TextInput
                                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-900"
                                placeholder="Jane Doe"
                                placeholderTextColor="#9CA3AF"
                                value={fullName}
                                onChangeText={setFullName}
                                style={styles.inputText}
                            />
                        </View>
                        <View>
                            <Text className="mb-1 text-sm font-medium text-slate-600">Phone Number</Text>
                            <TextInput
                                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-900"
                                placeholder="+1 (555) 987-6543"
                                placeholderTextColor="#9CA3AF"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                style={styles.inputText}
                            />
                        </View>
                    </View>
                </View>

                <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-5">
                    <View className="mb-4 flex-row items-center">
                        <MaterialIcons name="event" size={20} color="#6B8599" />
                        <Text className="ml-2 text-base font-bold text-gray-900">Schedule Delivery</Text>
                    </View>
                    <View className="gap-4">
                        <View>
                            <Text className="mb-2 text-sm font-medium text-slate-600">Delivery Date</Text>
                            <TouchableOpacity
                                onPress={() => setIsDateDropdownOpen((previous) => !previous)}
                                className="h-12 w-full flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4"
                            >
                                <Text className="text-base text-gray-900">
                                    {formatDeliveryOptionLabel(selectedDeliveryOption)}
                                </Text>
                                <MaterialIcons
                                    name={isDateDropdownOpen ? "expand-less" : "expand-more"}
                                    size={24}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                            {isDateDropdownOpen && (
                                <View className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white">
                                    {deliveryOptions.map((option, index) => (
                                        <TouchableOpacity
                                            key={option.iso}
                                            onPress={() => {
                                                setSelectedDate(index);
                                                setIsDateDropdownOpen(false);
                                            }}
                                            className={`px-4 py-3 ${selectedDate === index ? "bg-primary/10" : "bg-white"} ${index < deliveryOptions.length - 1 ? "border-b border-gray-100" : ""}`}
                                        >
                                            <Text className={`text-sm font-medium ${selectedDate === index ? "text-primary" : "text-gray-700"}`}>
                                                {formatDeliveryOptionLabel(option)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                        <View>
                            <Text className="mb-1 text-sm font-medium text-slate-600">Time Slot</Text>
                            <View className="h-12 w-full flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4">
                                <Text className="text-base text-gray-900">09:00 AM - 12:00 PM (Morning)</Text>
                                <MaterialIcons name="expand-more" size={24} color="#9CA3AF" />
                            </View>
                        </View>
                    </View>
                </View>

                <View className="mb-6 rounded-2xl border border-gray-100 bg-white p-4">
                    <View className="flex-row items-start">
                    <TouchableOpacity
                        onPress={() => setTermsAccepted(!termsAccepted)}
                        className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${termsAccepted ? "border-primary bg-primary" : "border-gray-300 bg-white"}`}
                    >
                        {termsAccepted && <MaterialIcons name="check" size={14} color="white" />}
                    </TouchableOpacity>
                        <View className="ml-3 flex-1">
                            <Text className="text-sm font-semibold text-gray-900">Rental Agreement</Text>
                            <Text className="text-sm text-slate-500">
                                I agree to the <Text className="text-primary">Terms of Service</Text> and <Text className="text-primary">Rental Policy</Text> for office equipment rentals.
                            </Text>
                        </View>
                    </View>
                </View>

                {submitError && (
                    <View className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                        <Text className="text-sm text-red-700">{submitError}</Text>
                    </View>
                )}
            </ScrollView>

            <View
                className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white/95 px-6 py-5"
                style={{ paddingBottom: Math.max(14, insets.bottom + 8) }}
            >
                <View className="mb-4 flex-row items-end justify-between">
                    <View>
                        <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Total</Text>
                        <View className="mt-1 flex-row items-baseline">
                            <Text className="text-3xl font-bold text-gray-900">{formatCurrency(monthlyTotalValue)}</Text>
                            <Text className="ml-1 text-base text-slate-400">/mo</Text>
                        </View>
                    </View>
                    <Text className="max-w-[46%] text-right text-sm font-medium text-slate-500" numberOfLines={2}>
                        {productName ?? "Furniture Rental"} ({rentalDurationMonths}m)
                    </Text>
                </View>

                <TouchableOpacity
                    disabled={submitting}
                    className="w-full flex-row items-center justify-center rounded-xl bg-primary py-4 disabled:opacity-60"
                    onPress={() => void handleProceedToPayment()}
                >
                    <Text className="text-base font-semibold text-white">
                        {submitting ? "Submitting..." : "Proceed to Payment"}
                    </Text>
                    <MaterialIcons name="arrow-forward" size={18} color="white" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
