import { Alert, Linking, View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import * as ExpoLinking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { AppTopBar, Checkbox, PriceSummaryRow, StickyActionBar } from "../../components/ui";
import { startBillingCheckout, useProfile, type Profile } from "../../hooks/useApi";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import {
    calculateSstBreakdown,
    collectMissingFieldLabels,
    formatCurrency,
    formatPercentLabel,
    hasText,
    normalizeBillingStatus,
    toErrorMessage,
    toNumeric,
} from "../../lib/ui";

const SST_RATE = 0.08;
const SST_RATE_PERCENT_LABEL = formatPercentLabel(SST_RATE * 100);

const COMPANY_PROFILE_FIELD_LABELS = [
    "Company Legal Name",
    "Registration Number",
    "HQ Office Address",
    "Office City",
    "Office Zip / Postal",
    "Delivery Address",
    "Delivery City",
    "Delivery Zip / Postal",
    "Industry",
    "Team Size",
];

const styles = StyleSheet.create({
    inputText: {
        fontSize: 16,
        lineHeight: 20,
        paddingVertical: 0,
        includeFontPadding: false,
    },
});

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

function createCheckoutIdempotencyKey(userId: string) {
    const randomPart = Math.random().toString(36).slice(2, 12);
    return `mob_${userId.slice(0, 8)}_${Date.now().toString(36)}_${randomPart}`;
}

function appendQueryParams(url: string, query: Record<string, string>) {
    const parsed = new URL(url);
    for (const [key, value] of Object.entries(query)) {
        parsed.searchParams.set(key, value);
    }
    return parsed.toString();
}

function readQueryParam(value: string | string[] | undefined) {
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
}

function getMissingProfileFields(profile: Profile | null, businessEmail?: string | null) {
    const missing = collectMissingFieldLabels([
        { label: "Full Name", value: profile?.full_name },
        { label: "Job Title", value: profile?.job_title },
        { label: "Phone Number", value: profile?.phone_number },
        { label: "Business Email", value: businessEmail ?? null },
    ]);
    const company = profile?.company ?? null;

    if (!company) {
        return [...missing, ...COMPANY_PROFILE_FIELD_LABELS];
    }

    const resolvedDeliveryAddress = hasText(company.delivery_address) ? company.delivery_address : company.address;
    const resolvedDeliveryCity = hasText(company.delivery_city) ? company.delivery_city : company.office_city;
    const resolvedDeliveryZipPostal = hasText(company.delivery_zip_postal) ? company.delivery_zip_postal : company.office_zip_postal;
    return [
        ...missing,
        ...collectMissingFieldLabels([
            { label: "Company Legal Name", value: company.company_name },
            { label: "Registration Number", value: company.registration_number },
            { label: "HQ Office Address", value: company.address },
            { label: "Office City", value: company.office_city },
            { label: "Office Zip / Postal", value: company.office_zip_postal },
            { label: "Delivery Address", value: resolvedDeliveryAddress },
            { label: "Delivery City", value: resolvedDeliveryCity },
            { label: "Delivery Zip / Postal", value: resolvedDeliveryZipPostal },
            { label: "Industry", value: company.industry },
            { label: "Team Size", value: company.team_size },
        ]),
    ];
}

export default function DeliveryCheckoutScreen() {
    const { user } = useAuth();
    const { data: profile, loading: profileLoading } = useProfile(user?.id);
    const { items: cartItems, cartDurationMonths, clearCart } = useCart();
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
    const [useDefaultDeliveryAddress, setUseDefaultDeliveryAddress] = useState(true);
    const [companyName, setCompanyName] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [city, setCity] = useState("");
    const [zipPostal, setZipPostal] = useState("");
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [checkoutFooterHeight, setCheckoutFooterHeight] = useState(280);
    const checkoutIdempotencyKeyRef = useRef<string | null>(null);

    const deliveryOptions = useMemo(() => buildDeliveryOptions(), []);
    const selectedDateIndex = Math.min(selectedDate, deliveryOptions.length - 1);
    const selectedDeliveryOption = deliveryOptions[selectedDateIndex];
    const monthlyTotalValue = toNumeric(monthlyTotal);
    const {
        subtotal: monthlySubtotalValue,
        sstAmount: monthlySstValue,
        total: estimatedMonthlyTotalValue,
    } = calculateSstBreakdown(monthlyTotalValue, SST_RATE);
    const isFromCartFlow = fromCart === "1" || fromCart === "true";
    const routeDurationMonths = (() => {
        const parsed = Number.parseInt(durationMonths ?? "", 10);
        if (!Number.isInteger(parsed) || parsed <= 0) return 12;
        return parsed;
    })();
    const rentalDurationMonths = isFromCartFlow ? cartDurationMonths : routeDurationMonths;
    const minimumTermMonths = Math.max(12, rentalDurationMonths);
    const missingProfileFields = useMemo(
        () => getMissingProfileFields(profile, user?.email ?? null),
        [profile, user?.email]
    );
    const isProfileIncomplete = missingProfileFields.length > 0;
    const defaultCompanyName = profile?.company?.company_name ?? "";
    const defaultStreetAddress = profile?.company?.delivery_address ?? profile?.company?.address ?? "";
    const defaultCity = profile?.company?.delivery_city ?? profile?.company?.office_city ?? "";
    const defaultZipPostal = profile?.company?.delivery_zip_postal ?? profile?.company?.office_zip_postal ?? "";

    useEffect(() => {
        if (!profile) return;

        if (useDefaultDeliveryAddress) {
            setCompanyName(defaultCompanyName);
            setStreetAddress(defaultStreetAddress);
            setCity(defaultCity);
            setZipPostal(defaultZipPostal);
        } else {
            setCompanyName((current) => (current.trim().length > 0 ? current : defaultCompanyName));
            setStreetAddress((current) => (current.trim().length > 0 ? current : defaultStreetAddress));
            setCity((current) => (current.trim().length > 0 ? current : defaultCity));
            setZipPostal((current) => (current.trim().length > 0 ? current : defaultZipPostal));
        }
        setFullName((current) => (current.trim().length > 0 ? current : profile.full_name ?? ""));
        setPhoneNumber((current) => (current.trim().length > 0 ? current : profile.phone_number ?? ""));
    }, [
        defaultCity,
        defaultCompanyName,
        defaultStreetAddress,
        defaultZipPostal,
        profile,
        useDefaultDeliveryAddress,
    ]);

    const cartItemsFingerprint = useMemo(
        () => JSON.stringify(cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            monthlyPrice: item.monthlyPrice,
            durationMonths: cartDurationMonths,
        }))),
        [cartDurationMonths, cartItems]
    );

    useEffect(() => {
        checkoutIdempotencyKeyRef.current = null;
    }, [
        companyName,
        streetAddress,
        city,
        zipPostal,
        fullName,
        phoneNumber,
        selectedDate,
        termsAccepted,
        minimumTermMonths,
        monthlyTotalValue,
        productName,
        cartItemsFingerprint,
    ]);

    const handleToggleUseDefaultDeliveryAddress = () => {
        setUseDefaultDeliveryAddress((previous) => {
            const nextValue = !previous;
            if (nextValue) {
                setCompanyName(defaultCompanyName);
                setStreetAddress(defaultStreetAddress);
                setCity(defaultCity);
                setZipPostal(defaultZipPostal);
            }
            return nextValue;
        });
    };

    const handleOpenProfileSetup = () => {
        router.push({
            pathname: "/(onboarding)/personal-info",
            params: {
                full_name: profile?.full_name ?? "",
                job_title: profile?.job_title ?? "",
                phone_number: profile?.phone_number ?? "",
                business_email: user?.email ?? "",
                company_name: profile?.company?.company_name ?? "",
                registration_number: profile?.company?.registration_number ?? "",
                address: profile?.company?.address ?? "",
                office_city: profile?.company?.office_city ?? "",
                office_zip_postal: profile?.company?.office_zip_postal ?? "",
                delivery_address: profile?.company?.delivery_address ?? "",
                delivery_city: profile?.company?.delivery_city ?? "",
                delivery_zip_postal: profile?.company?.delivery_zip_postal ?? "",
                industry: profile?.company?.industry ?? "",
                team_size: profile?.company?.team_size ?? "",
            },
        });
    };

    const handleProceedToPayment = async () => {
        if (!user) {
            Alert.alert("Sign In Required", "Please sign in to place an order.");
            router.push("/(auth)/login");
            return;
        }

        if (profileLoading) {
            Alert.alert("Please Wait", "Checking your profile details. Please try again.");
            return;
        }

        if (missingProfileFields.length > 0) {
            const message = `Complete your profile before placing an order. Missing: ${missingProfileFields.join(", ")}.`;
            Alert.alert("Complete Profile Required", message, [
                { text: "Complete Profile", onPress: handleOpenProfileSetup },
                { text: "Cancel", style: "cancel" },
            ]);
            return;
        }

        const requiredFields = [
            { label: "Company Name", value: companyName },
            { label: "Delivery Address", value: streetAddress },
            { label: "City", value: city },
            { label: "Zip / Postal", value: zipPostal },
            { label: "Full Name", value: fullName },
            { label: "Phone Number", value: phoneNumber },
        ];
        const missingFields = collectMissingFieldLabels(requiredFields);

        if (missingFields.length > 0) {
            const message = `Please complete all required fields: ${missingFields.join(", ")}.`;
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

        if (rentalDurationMonths < 12) {
            Alert.alert("12-Month Minimum", "Deskly subscriptions require a minimum 12-month commitment.");
            return;
        }

        setSubmitting(true);

        try {
            if (!checkoutIdempotencyKeyRef.current) {
                checkoutIdempotencyKeyRef.current = createCheckoutIdempotencyKey(user.id);
            }
            const startDate = selectedDeliveryOption.iso;
            const endDate = addMonths(new Date(startDate), minimumTermMonths).toISOString();
            const checkoutReturnBaseUrl = ExpoLinking.createURL("/");
            const checkoutSuccessUrl = appendQueryParams(checkoutReturnBaseUrl, {
                checkout_status: "success",
                source: "stripe_checkout",
            });
            const checkoutCancelUrl = appendQueryParams(checkoutReturnBaseUrl, {
                checkout_status: "cancel",
                source: "stripe_checkout",
            });
            const subscriptionItems = isFromCartFlow
                ? cartItems.map((item) => ({
                    product_id: item.productId,
                    product_name: item.name,
                    category: item.category ?? null,
                    monthly_price: item.monthlyPrice,
                    duration_months: minimumTermMonths,
                    quantity: item.quantity,
                }))
                : [{
                    product_name: productName ?? "Furniture Rental",
                    category: "General",
                    monthly_price: Number(monthlyTotalValue.toFixed(2)),
                    duration_months: minimumTermMonths,
                    quantity: 1,
                }];

            const checkout = await startBillingCheckout({
                user_id: user.id,
                idempotency_key: checkoutIdempotencyKeyRef.current,
                bundle_id: null,
                start_date: startDate,
                end_date: endDate,
                monthly_total: Number(monthlyTotalValue.toFixed(2)),
                product_name: productName ?? "Furniture Rental",
                minimum_term_months: minimumTermMonths,
                delivery_company_name: companyName.trim(),
                delivery_address: streetAddress.trim(),
                delivery_city: city.trim(),
                delivery_zip_postal: zipPostal.trim(),
                delivery_contact_name: fullName.trim(),
                delivery_contact_phone: phoneNumber.trim(),
                items: subscriptionItems,
                success_url: checkoutSuccessUrl,
                cancel_url: checkoutCancelUrl,
            });
            const created = checkout.subscription;
            const confirmationParams = {
                orderId: created.id,
                productName: productName ?? "Furniture Rental",
                monthlyTotal: String(created.monthly_total ?? monthlyTotalValue),
                subtotalAmount: String(checkout.tax_quote.subtotal),
                sstAmount: String(checkout.tax_quote.sst_amount),
                sstRatePercent: String(Number((checkout.tax_quote.sst_rate * 100).toFixed(2))),
                status: normalizeBillingStatus(created.status),
                durationMonths: String(minimumTermMonths),
                startDate: created.start_date ?? startDate,
                endDate: created.end_date ?? endDate,
            };

            if (checkout.checkout_url) {
                const canOpen = await Linking.canOpenURL(checkout.checkout_url);
                if (!canOpen) {
                    throw new Error("Unable to open Stripe checkout link on this device.");
                }

                const authSessionResult = await WebBrowser.openAuthSessionAsync(
                    checkout.checkout_url,
                    checkoutReturnBaseUrl,
                );

                if (authSessionResult.type === "success" && authSessionResult.url) {
                    const parsedReturnUrl = ExpoLinking.parse(authSessionResult.url);
                    const checkoutStatus = readQueryParam(parsedReturnUrl.queryParams?.checkout_status);

                    if (checkoutStatus === "success") {
                        if (isFromCartFlow) clearCart();
                        router.push({
                            pathname: "/checkout/confirmation",
                            params: confirmationParams,
                        });
                        return;
                    }

                    if (checkoutStatus === "cancel") {
                        Alert.alert("Checkout Cancelled", "Payment was cancelled. You can continue when ready.");
                        return;
                    }

                    Alert.alert("Checkout Pending", "Please check your rental status in My Rentals.");
                    return;
                }

                if (authSessionResult.type === "cancel" || authSessionResult.type === "dismiss") {
                    Alert.alert("Checkout Not Completed", "Stripe checkout was closed before payment was confirmed.");
                    return;
                }

                Alert.alert("Checkout Pending", "Please check your rental status in My Rentals.");
                return;
            }

            // Mock provider or fallback without hosted checkout URL.
            if (isFromCartFlow) clearCart();
            router.push({
                pathname: "/checkout/confirmation",
                params: confirmationParams,
            });
        } catch (error) {
            const message = toErrorMessage(error, "Failed to create order");
            if (
                message.includes("Previous checkout attempt failed") ||
                message.includes("idempotency key was already used")
            ) {
                checkoutIdempotencyKeyRef.current = null;
            }
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
                    <Text className="text-sm font-semibold text-primary">Delivery Details</Text>
                    <Text className="text-sm font-medium text-slate-400">Checkout</Text>
                    <Text className="text-sm font-medium text-slate-400">Confirmation</Text>
                </View>
                <View className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <View className="h-full w-1/3 rounded-full bg-primary" />
                </View>
            </View>

            <ScrollView
                className="flex-1 px-5 py-6"
                contentContainerStyle={{ paddingBottom: checkoutFooterHeight + 24 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-5">
                    <View className="mb-4 flex-row items-center">
                        <MaterialIcons name="location-on" size={20} color="#6B8599" />
                        <Text className="ml-2 text-base font-bold text-gray-900">Shipping Address</Text>
                    </View>
                    <Checkbox
                        checked={useDefaultDeliveryAddress}
                        onPress={handleToggleUseDefaultDeliveryAddress}
                        className="mb-4 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3"
                        label="Use Default Delivery Address"
                        description={
                            profileLoading
                                ? "Loading your saved delivery address..."
                                : "Use the delivery address from your profile. Uncheck to enter a one-time address for this order."
                        }
                    />
                    <View className="gap-4">
                        <View>
                            <Text className="mb-1 text-sm font-medium text-slate-600">Company Name</Text>
                            <TextInput
                                className={`h-12 w-full rounded-xl border border-gray-200 px-4 text-base ${useDefaultDeliveryAddress ? "bg-gray-100 text-slate-400" : "bg-gray-50 text-gray-900"}`}
                                placeholder="Acme Corp."
                                placeholderTextColor="#9CA3AF"
                                value={companyName}
                                onChangeText={setCompanyName}
                                style={styles.inputText}
                                editable={!useDefaultDeliveryAddress}
                            />
                        </View>
                        <View>
                            <Text className="mb-1 text-sm font-medium text-slate-600">Delivery Address</Text>
                            <TextInput
                                className={`h-12 w-full rounded-xl border border-gray-200 px-4 text-base ${useDefaultDeliveryAddress ? "bg-gray-100 text-slate-400" : "bg-gray-50 text-gray-900"}`}
                                placeholder="Street address, City, State, Zip"
                                placeholderTextColor="#9CA3AF"
                                value={streetAddress}
                                onChangeText={setStreetAddress}
                                style={styles.inputText}
                                editable={!useDefaultDeliveryAddress}
                            />
                        </View>
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Text className="mb-1 text-sm font-medium text-slate-600">City</Text>
                                <TextInput
                                    className={`h-12 w-full rounded-xl border border-gray-200 px-4 text-base ${useDefaultDeliveryAddress ? "bg-gray-100 text-slate-400" : "bg-gray-50 text-gray-900"}`}
                                    placeholder="San Francisco"
                                    placeholderTextColor="#9CA3AF"
                                    value={city}
                                    onChangeText={setCity}
                                    style={styles.inputText}
                                    editable={!useDefaultDeliveryAddress}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="mb-1 text-sm font-medium text-slate-600">Zip / Postal</Text>
                                <TextInput
                                    className={`h-12 w-full rounded-xl border border-gray-200 px-4 text-base ${useDefaultDeliveryAddress ? "bg-gray-100 text-slate-400" : "bg-gray-50 text-gray-900"}`}
                                    placeholder="94105"
                                    placeholderTextColor="#9CA3AF"
                                    value={zipPostal}
                                    onChangeText={setZipPostal}
                                    style={styles.inputText}
                                    editable={!useDefaultDeliveryAddress}
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
                    <Checkbox
                        checked={termsAccepted}
                        onPress={() => setTermsAccepted(!termsAccepted)}
                        label="Rental Agreement"
                        description="I agree to the Terms of Service and Rental Policy for office equipment rentals."
                    />
                </View>

                {!profileLoading && !!user && missingProfileFields.length > 0 && (
                    <View className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <Text className="text-sm font-semibold text-amber-800">Complete Profile Required</Text>
                        <Text className="mt-1 text-sm text-amber-700">
                            Missing: {missingProfileFields.join(", ")}
                        </Text>
                        <TouchableOpacity className="mt-3 self-start rounded-lg bg-amber-600 px-3 py-2" onPress={handleOpenProfileSetup}>
                            <Text className="text-sm font-semibold text-white">Complete Profile</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <StickyActionBar
                onLayout={(event) => {
                    const measuredHeight = Math.ceil(event.nativeEvent.layout.height);
                    if (measuredHeight > 0 && measuredHeight !== checkoutFooterHeight) {
                        setCheckoutFooterHeight(measuredHeight);
                    }
                }}
            >
                <View className="mb-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <View>
                        <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Billing Estimate</Text>
                        <Text className="mt-1 text-xs text-slate-500">
                            One order = one duration. For different durations, place a separate order.
                        </Text>
                        <View className="mt-2 gap-1.5">
                            <PriceSummaryRow label="Subtotal" value={formatCurrency(monthlySubtotalValue)} valueTone="strong" />
                            <PriceSummaryRow label={`SST (${SST_RATE_PERCENT_LABEL})`} value={formatCurrency(monthlySstValue)} valueTone="strong" />
                            <View className="mt-1 flex-row items-baseline justify-between border-t border-gray-200 pt-1.5">
                                <Text className="text-sm font-semibold text-gray-900">Estimated Monthly Total</Text>
                                <View className="flex-row items-baseline">
                                    <Text className="text-xl font-bold text-gray-900">{formatCurrency(estimatedMonthlyTotalValue)}</Text>
                                    <Text className="ml-1 text-sm text-slate-400">/mo</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <Text className="mt-2 text-sm font-medium text-slate-500" numberOfLines={2}>
                        {productName ?? "Furniture Rental"} ({rentalDurationMonths}m)
                    </Text>
                </View>

                <TouchableOpacity
                    disabled={submitting || profileLoading || isProfileIncomplete}
                    className="w-full flex-row items-center justify-center rounded-xl bg-primary py-4 disabled:opacity-60"
                    onPress={() => void handleProceedToPayment()}
                >
                    <Text className="text-base font-semibold text-white">
                        {submitting
                            ? "Submitting..."
                            : profileLoading
                                ? "Checking Profile..."
                                : isProfileIncomplete
                                    ? "Complete Profile to Continue"
                                    : "Proceed to Payment"}
                    </Text>
                    <MaterialIcons name="arrow-forward" size={18} color="white" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
            </StickyActionBar>
        </SafeAreaView>
    );
}
