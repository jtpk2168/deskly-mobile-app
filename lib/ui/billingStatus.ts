export type BillingStatus =
    | "active"
    | "pending_payment"
    | "payment_failed"
    | "cancelled"
    | "completed"
    | "unknown";

const BILLING_STATUS_ALIASES: Record<string, BillingStatus> = {
    pending: "pending_payment",
    incomplete: "pending_payment",
};

const BILLING_STATUS_BADGE_CLASSNAME: Record<BillingStatus, string> = {
    active: "bg-green-100",
    pending_payment: "bg-amber-100",
    payment_failed: "bg-rose-100",
    cancelled: "bg-red-100",
    completed: "bg-blue-100",
    unknown: "bg-gray-100",
};

const BILLING_STATUS_DOT_CLASSNAME: Record<BillingStatus, string> = {
    active: "bg-green-500",
    pending_payment: "bg-amber-500",
    payment_failed: "bg-rose-500",
    cancelled: "bg-red-500",
    completed: "bg-blue-500",
    unknown: "bg-gray-400",
};

const BILLING_STATUS_TEXT_CLASSNAME: Record<BillingStatus, string> = {
    active: "text-green-700",
    pending_payment: "text-amber-700",
    payment_failed: "text-rose-700",
    cancelled: "text-red-700",
    completed: "text-blue-700",
    unknown: "text-gray-600",
};

export type InvoiceStatus =
    | "paid"
    | "open"
    | "draft"
    | "payment_failed"
    | "void"
    | "uncollectible"
    | "unknown";

const INVOICE_STATUS_BADGE_CLASSNAME: Record<InvoiceStatus, string> = {
    paid: "bg-green-100",
    open: "bg-amber-100",
    draft: "bg-slate-100",
    payment_failed: "bg-rose-100",
    void: "bg-red-100",
    uncollectible: "bg-red-100",
    unknown: "bg-gray-100",
};

const INVOICE_STATUS_TEXT_CLASSNAME: Record<InvoiceStatus, string> = {
    paid: "text-green-700",
    open: "text-amber-700",
    draft: "text-slate-700",
    payment_failed: "text-rose-700",
    void: "text-red-700",
    uncollectible: "text-red-700",
    unknown: "text-gray-600",
};

export function normalizeBillingStatus(status: string | null | undefined): BillingStatus {
    const normalized = (status ?? "").trim().toLowerCase();

    if (!normalized) return "pending_payment";
    if (normalized in BILLING_STATUS_ALIASES) {
        return BILLING_STATUS_ALIASES[normalized];
    }
    if (normalized === "active") return "active";
    if (normalized === "pending_payment") return "pending_payment";
    if (normalized === "payment_failed") return "payment_failed";
    if (normalized === "cancelled") return "cancelled";
    if (normalized === "completed") return "completed";

    return "unknown";
}

export function formatStatusLabel(value: string) {
    return value
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function formatBillingStatusLabel(status: string | null | undefined) {
    const normalized = normalizeBillingStatus(status);
    if (normalized === "unknown") return formatStatusLabel((status ?? "unknown").trim() || "unknown");
    return formatStatusLabel(normalized);
}

export function statusBadgeClassName(status: string | null | undefined) {
    return BILLING_STATUS_BADGE_CLASSNAME[normalizeBillingStatus(status)];
}

export function statusDotClassName(status: string | null | undefined) {
    return BILLING_STATUS_DOT_CLASSNAME[normalizeBillingStatus(status)];
}

export function statusTextClassName(status: string | null | undefined) {
    return BILLING_STATUS_TEXT_CLASSNAME[normalizeBillingStatus(status)];
}

export function normalizeInvoiceStatus(status: string | null | undefined): InvoiceStatus {
    const normalized = (status ?? "").trim().toLowerCase();

    if (!normalized) return "unknown";
    if (normalized === "paid") return "paid";
    if (normalized === "open") return "open";
    if (normalized === "draft") return "draft";
    if (normalized === "payment_failed") return "payment_failed";
    if (normalized === "void") return "void";
    if (normalized === "uncollectible") return "uncollectible";

    return "unknown";
}

export function invoiceBadgeClassName(status: string | null | undefined) {
    return INVOICE_STATUS_BADGE_CLASSNAME[normalizeInvoiceStatus(status)];
}

export function invoiceTextClassName(status: string | null | undefined) {
    return INVOICE_STATUS_TEXT_CLASSNAME[normalizeInvoiceStatus(status)];
}
