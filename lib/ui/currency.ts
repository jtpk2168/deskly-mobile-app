type FormatCurrencyOptions = {
    symbol?: string;
    precision?: number;
    emptyValue?: string;
};

type ContractTotalItem = {
    monthlyPrice: number;
    quantity: number;
};

export function toMoney(value: unknown, fallback = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Number(parsed.toFixed(2));
}

export function toNullableMoney(value: unknown) {
    if (value == null) return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;
    return Number(parsed.toFixed(2));
}

export function calculateSstBreakdown(subtotal: unknown, sstRate = 0.08) {
    const normalizedSubtotal = toMoney(subtotal);
    const normalizedRate = Number.isFinite(Number(sstRate)) && Number(sstRate) >= 0 ? Number(sstRate) : 0;
    const sstAmount = toMoney(normalizedSubtotal * normalizedRate);
    const total = toMoney(normalizedSubtotal + sstAmount);

    return {
        subtotal: normalizedSubtotal,
        sstAmount,
        total,
    };
}

export function calculateContractTotal(items: ContractTotalItem[], durationMonths: number) {
    const normalizedDuration = Number.isFinite(Number(durationMonths)) && Number(durationMonths) > 0
        ? Number(durationMonths)
        : 0;

    const total = items.reduce((sum, item) => {
        const monthlyPrice = toMoney(item.monthlyPrice);
        const quantity = Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0
            ? Number(item.quantity)
            : 0;
        return sum + (monthlyPrice * quantity * normalizedDuration);
    }, 0);

    return toMoney(total);
}

export function formatPercentLabel(value: unknown) {
    const normalized = toMoney(value, 0);
    return Number.isInteger(normalized) ? `${normalized.toFixed(0)}%` : `${normalized.toFixed(2)}%`;
}

export function formatCurrency(value: number | null | undefined, options: FormatCurrencyOptions = {}) {
    const symbol = options.symbol ?? "RM";
    const precision = options.precision ?? 2;
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        return options.emptyValue ?? `${symbol} —`;
    }

    return `${symbol} ${parsed.toFixed(precision)}`;
}

export function formatCurrencyWithCode(
    value: number | null | undefined,
    currencyCode: string | null | undefined,
    options: Omit<FormatCurrencyOptions, "symbol"> = {},
) {
    const precision = options.precision ?? 2;
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        return options.emptyValue ?? "—";
    }

    const normalizedCode = (currencyCode ?? "MYR").trim().toUpperCase();
    return `${normalizedCode} ${parsed.toFixed(precision)}`;
}
