import { ActivityIndicator, Alert, Image, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { AppTopBar } from "../../components/ui/AppTopBar";
import { useSubscription } from "../../hooks/useApi";

const DEFAULT_SST_RATE_PERCENT = 8;

function formatCurrency(value: number | null) {
    if (value == null) return "RM —";
    return `RM ${Number(value).toFixed(2)}`;
}

function formatCurrencyWithCode(value: number | null, currency: string | null | undefined) {
    if (value == null) return "—";
    const normalizedCurrency = (currency ?? "myr").trim().toUpperCase();
    return `${normalizedCurrency} ${Number(value).toFixed(2)}`;
}

function formatDate(value: string | null) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-MY", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
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
    const normalizedStatus = normalizeBillingStatus(status);
    if (normalizedStatus === "active") return "bg-green-100";
    if (normalizedStatus === "pending_payment") return "bg-amber-100";
    if (normalizedStatus === "payment_failed") return "bg-rose-100";
    if (normalizedStatus === "cancelled") return "bg-red-100";
    if (normalizedStatus === "completed") return "bg-blue-100";
    return "bg-gray-100";
}

function statusTextClassName(status: string) {
    const normalizedStatus = normalizeBillingStatus(status);
    if (normalizedStatus === "active") return "text-green-700";
    if (normalizedStatus === "pending_payment") return "text-amber-700";
    if (normalizedStatus === "payment_failed") return "text-rose-700";
    if (normalizedStatus === "cancelled") return "text-red-700";
    if (normalizedStatus === "completed") return "text-blue-700";
    return "text-gray-600";
}

function statusDotClassName(status: string) {
    const normalizedStatus = normalizeBillingStatus(status);
    if (normalizedStatus === "active") return "bg-green-500";
    if (normalizedStatus === "pending_payment") return "bg-amber-500";
    if (normalizedStatus === "payment_failed") return "bg-rose-500";
    if (normalizedStatus === "cancelled") return "bg-red-500";
    if (normalizedStatus === "completed") return "bg-blue-500";
    return "bg-gray-400";
}

function invoiceBadgeClassName(status: string) {
    if (status === "paid") return "bg-green-100";
    if (status === "open") return "bg-amber-100";
    if (status === "draft") return "bg-slate-100";
    if (status === "payment_failed") return "bg-rose-100";
    if (status === "void" || status === "uncollectible") return "bg-red-100";
    return "bg-gray-100";
}

function invoiceTextClassName(status: string) {
    if (status === "paid") return "text-green-700";
    if (status === "open") return "text-amber-700";
    if (status === "draft") return "text-slate-700";
    if (status === "payment_failed") return "text-rose-700";
    if (status === "void" || status === "uncollectible") return "text-red-700";
    return "text-gray-600";
}

function parsePositiveInteger(value: number | null | undefined) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) return 0;
    return parsed;
}

function normalizeMoney(value: unknown) {
    if (value == null) return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;
    return Number(parsed.toFixed(2));
}

function hasText(value: string | null | undefined): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function composeAddress(
    line1: string | null | undefined,
    city: string | null | undefined,
    zipPostal: string | null | undefined
) {
    const parts: string[] = [];
    const normalizedLine1 = hasText(line1) ? line1.trim() : null;
    const normalizedCity = hasText(city) ? city.trim() : null;
    const normalizedZipPostal = hasText(zipPostal) ? zipPostal.trim() : null;

    if (normalizedLine1) parts.push(normalizedLine1);
    const locality = [normalizedCity, normalizedZipPostal].filter(Boolean).join(" ");
    if (locality) parts.push(locality);

    return parts.length > 0 ? parts.join(", ") : null;
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <Text className="text-sm font-medium text-slate-500">{label}</Text>
            <Text className="text-sm font-semibold text-gray-900">{value}</Text>
        </View>
    );
}

export default function RentalOrderDetailsScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const orderId = typeof id === "string" ? id : "";
    const { data: subscription, loading, error, refetch } = useSubscription(orderId);
    const orderItems = subscription?.subscription_items ?? [];
    const invoiceRows = subscription?.billing_invoices ?? [];
    const totalItemCount = orderItems.reduce((sum, item) => sum + (parsePositiveInteger(item.quantity) || 1), 0);
    const deliveryAddress = composeAddress(
        subscription?.delivery_address,
        subscription?.delivery_city,
        subscription?.delivery_zip_postal
    );
    const deliveryContactName = hasText(subscription?.delivery_contact_name) ? subscription.delivery_contact_name : null;
    const deliveryContactPhone = hasText(subscription?.delivery_contact_phone) ? subscription.delivery_contact_phone : null;
    const deliveryContact = deliveryContactName && deliveryContactPhone
        ? `${deliveryContactName} • ${deliveryContactPhone}`
        : deliveryContactName ?? deliveryContactPhone;
    const monthlyTotal = normalizeMoney(subscription?.monthly_total);
    const explicitSubtotal = normalizeMoney(subscription?.subtotal_amount);
    const explicitTax = normalizeMoney(subscription?.tax_amount);
    const derivedTax = explicitSubtotal != null && monthlyTotal != null
        ? normalizeMoney(monthlyTotal - explicitSubtotal)
        : null;
    const resolvedTax = explicitTax ?? (derivedTax != null && derivedTax >= 0 ? derivedTax : null);
    const resolvedSubtotal = explicitSubtotal
        ?? (resolvedTax != null && monthlyTotal != null ? normalizeMoney(monthlyTotal - resolvedTax) : null);
    const computedSstRatePercent = resolvedSubtotal != null && resolvedSubtotal > 0 && resolvedTax != null
        ? Number(((resolvedTax / resolvedSubtotal) * 100).toFixed(2))
        : DEFAULT_SST_RATE_PERCENT;
    const sstRateLabel = Number.isInteger(computedSstRatePercent)
        ? `${computedSstRatePercent.toFixed(0)}%`
        : `${computedSstRatePercent.toFixed(2)}%`;
    const subscriptionStatus = normalizeBillingStatus(subscription?.status);

    const handleOpenInvoice = async (url: string | null) => {
        if (!url) {
            Alert.alert("Invoice Unavailable", "No invoice link is available yet for this billing cycle.");
            return;
        }
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
            Alert.alert("Open Invoice Failed", "Unable to open the invoice link on this device.");
            return;
        }
        await Linking.openURL(url);
    };

    if (!orderId) {
        return (
            <SafeAreaView className="flex-1 bg-gray-100" edges={["top", "left", "right"]}>
                <AppTopBar title="Order Details" onBackPress={() => router.back()} />
                <View className="flex-1 items-center justify-center px-6">
                    <MaterialIcons name="error-outline" size={48} color="#CBD5E1" />
                    <Text className="mt-3 text-base font-semibold text-gray-700">Invalid Order</Text>
                    <TouchableOpacity className="mt-4 rounded-xl bg-primary px-6 py-3" onPress={() => router.push("/(tabs)/rentals")}>
                        <Text className="text-sm font-semibold text-white">Back to My Rentals</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100" edges={["top", "left", "right"]}>
            <AppTopBar title="Order Details" onBackPress={() => router.back()} />

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6B8599" />
                    <Text className="mt-3 text-sm text-slate-400">Loading order details...</Text>
                </View>
            ) : error || !subscription ? (
                <View className="flex-1 items-center justify-center px-6">
                    <MaterialIcons name="wifi-off" size={48} color="#CBD5E1" />
                    <Text className="mt-3 text-base font-semibold text-gray-700">Unable to Load Order</Text>
                    <Text className="mt-1 text-center text-sm text-slate-400">{error ?? "Order not found"}</Text>
                    <TouchableOpacity className="mt-4 rounded-xl bg-primary px-6 py-3" onPress={() => void refetch()}>
                        <Text className="text-sm font-semibold text-white">Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView className="flex-1 px-6 py-7" contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
                    <View className="rounded-2xl border border-gray-100 bg-white p-5">
                        <View className="flex-row items-start justify-between">
                            <View className="pr-4">
                                <Text className="text-xl font-bold text-gray-900">
                                    {subscription.bundles?.name ?? "Furniture Rental"}
                                </Text>
                                <Text className="mt-1 text-sm font-bold uppercase tracking-wider text-slate-400">
                                    ID: #{subscription.id.substring(0, 8).toUpperCase()}
                                </Text>
                            </View>
                            <View className={`flex-row items-center rounded-full px-2 py-1 ${statusBadgeClassName(subscriptionStatus)}`}>
                                <View className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusDotClassName(subscriptionStatus)}`} />
                                <Text className={`text-sm font-semibold uppercase ${statusTextClassName(subscriptionStatus)}`}>
                                    {formatStatusLabel(subscriptionStatus)}
                                </Text>
                            </View>
                        </View>

                        {subscription.bundles?.description ? (
                            <Text className="mt-3 text-sm text-slate-500">{subscription.bundles.description}</Text>
                        ) : (
                            <Text className="mt-3 text-sm text-slate-500">
                                Status is maintained by admin and reflected here automatically.
                            </Text>
                        )}

                        <View className="mt-5 space-y-3">
                            <DetailRow label="Monthly Subtotal" value={formatCurrency(resolvedSubtotal)} />
                            <DetailRow label={`Tax (SST ${sstRateLabel})`} value={formatCurrency(resolvedTax)} />
                            <DetailRow label="Monthly Total" value={formatCurrency(monthlyTotal)} />
                            <DetailRow label="Items in Order" value={String(totalItemCount)} />
                            <DetailRow label="Order Status" value={formatStatusLabel(subscriptionStatus)} />
                            <DetailRow label="Start Date" value={formatDate(subscription.start_date)} />
                            <DetailRow label="Commitment End" value={formatDate(subscription.end_date)} />
                            <DetailRow label="Created On" value={formatDate(subscription.created_at)} />
                        </View>

                        {deliveryAddress && (
                            <View className="mt-5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                                <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">Delivery Address</Text>
                                <Text className="mt-2 text-sm leading-6 text-gray-900">{deliveryAddress}</Text>
                                {deliveryContact && (
                                    <Text className="mt-1 text-sm text-slate-500">Contact: {deliveryContact}</Text>
                                )}
                            </View>
                        )}

                        <View className="mt-6">
                            <Text className="text-base font-semibold text-gray-900">Invoices</Text>
                            <Text className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                                {invoiceRows.length} {invoiceRows.length === 1 ? "invoice" : "invoices"}
                            </Text>

                            {invoiceRows.length === 0 ? (
                                <View className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                                    <Text className="text-sm text-slate-500">No mirrored invoices yet. First invoice appears after Stripe generates it.</Text>
                                </View>
                            ) : (
                                <View className="mt-3 space-y-2">
                                    {invoiceRows.map((invoice) => {
                                        const invoiceCode = invoice.invoice_number?.trim() || invoice.provider_invoice_id.slice(0, 12).toUpperCase();
                                        const invoiceUrl = invoice.hosted_invoice_url ?? invoice.invoice_pdf;
                                        return (
                                            <View key={invoice.id} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                                                <View className="flex-row items-start justify-between gap-3">
                                                    <View className="flex-1">
                                                        <Text className="text-sm font-semibold text-gray-900">{invoiceCode}</Text>
                                                        <Text className="mt-1 text-xs text-slate-500">
                                                            Period: {formatDate(invoice.period_start_at)} - {formatDate(invoice.period_end_at)}
                                                        </Text>
                                                        <Text className="mt-1 text-xs text-slate-500">
                                                            Due: {formatDate(invoice.due_date)}
                                                        </Text>
                                                    </View>
                                                    <View className={`rounded-full px-2 py-1 ${invoiceBadgeClassName(invoice.status)}`}>
                                                        <Text className={`text-xs font-semibold uppercase ${invoiceTextClassName(invoice.status)}`}>
                                                            {formatStatusLabel(invoice.status)}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View className="mt-3 flex-row items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2">
                                                    <Text className="text-xs font-medium uppercase tracking-wider text-slate-400">Total</Text>
                                                    <Text className="text-sm font-semibold text-gray-900">
                                                        {formatCurrencyWithCode(invoice.total_amount, invoice.currency)}
                                                    </Text>
                                                </View>
                                                <View className="mt-2 flex-row items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2">
                                                    <Text className="text-xs font-medium uppercase tracking-wider text-slate-400">{`Tax (SST ${sstRateLabel})`}</Text>
                                                    <Text className="text-sm font-semibold text-gray-900">
                                                        {formatCurrencyWithCode(invoice.tax_amount, invoice.currency)}
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    className="mt-3 flex-row items-center self-start rounded-lg border border-primary/30 bg-white px-3 py-2"
                                                    onPress={() => void handleOpenInvoice(invoiceUrl)}
                                                >
                                                    <MaterialIcons name="receipt-long" size={16} color="#6B8599" />
                                                    <Text className="ml-1.5 text-xs font-semibold text-primary">Open Invoice</Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </View>

                        <View className="mt-6">
                            <Text className="text-base font-semibold text-gray-900">Item Listing</Text>
                            <Text className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                                {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
                            </Text>

                            {orderItems.length === 0 ? (
                                <View className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                                    <Text className="text-sm text-slate-500">No item details captured for this order.</Text>
                                </View>
                            ) : (
                                <View className="mt-3 space-y-2">
                                    {orderItems.map((item, index) => {
                                        const itemName = item.product_name?.trim() || item.category?.trim() || `Item ${index + 1}`;
                                        const quantity = parsePositiveInteger(item.quantity) || 1;
                                        const unitMonthly = item.monthly_price;
                                        const lineMonthly = unitMonthly == null ? null : unitMonthly * quantity;
                                        const durationLabel = item.duration_months ? `${item.duration_months} months` : null;
                                        const categoryLabel = item.category?.trim() || "General";

                                        return (
                                            <View
                                                key={`${itemName}-${index}`}
                                                className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                                            >
                                                <View className="flex-row items-start justify-between">
                                                    <View className="flex-1 flex-row pr-3">
                                                        <View className="h-12 w-12 overflow-hidden rounded-lg border border-gray-100 bg-white">
                                                            {item.image_url ? (
                                                                <Image source={{ uri: item.image_url }} className="h-full w-full" resizeMode="cover" />
                                                            ) : (
                                                                <View className="h-full w-full items-center justify-center">
                                                                    <MaterialIcons name="event-seat" size={18} color="#94A3B8" />
                                                                </View>
                                                            )}
                                                        </View>
                                                        <View className="ml-3 flex-1">
                                                            <Text className="text-sm font-semibold text-gray-900">{itemName}</Text>
                                                            <Text className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                                                                {categoryLabel}
                                                                {durationLabel ? ` • ${durationLabel}` : ""}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Text className="text-sm font-semibold text-gray-900">x {quantity}</Text>
                                                </View>

                                                <View className="mt-3 flex-row items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2">
                                                    <Text className="text-xs font-medium uppercase tracking-wider text-slate-400">Line Monthly</Text>
                                                    <Text className="text-sm font-semibold text-primary">
                                                        {lineMonthly == null ? "RM —" : `${formatCurrency(lineMonthly)}/mo`}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        className="mt-4 flex-row items-center justify-center rounded-xl bg-primary py-4"
                        onPress={() => router.push("/(tabs)/rentals")}
                    >
                        <Text className="text-base font-semibold text-white">Back to My Rentals</Text>
                        <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
