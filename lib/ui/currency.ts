type FormatCurrencyOptions = {
    symbol?: string;
    precision?: number;
    emptyValue?: string;
};

export function toMoney(value: unknown, fallback = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Number(parsed.toFixed(2));
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
