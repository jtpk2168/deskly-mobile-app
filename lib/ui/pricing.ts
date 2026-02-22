export type PricingTier = {
    min_months: number;
    monthly_price: number;
};

type PricingMode = "fixed" | "tiered";

export function toNumeric(value: unknown, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatPrice(value: number) {
    return toNumeric(value).toFixed(2);
}

export function normalizePricingTiers(input: PricingTier[] | null | undefined) {
    if (!Array.isArray(input)) return [];

    return input
        .map((tier) => ({
            min_months: Number(tier.min_months),
            monthly_price: Number(tier.monthly_price),
        }))
        .filter(
            (tier) =>
                Number.isInteger(tier.min_months)
                && tier.min_months >= 2
                && Number.isFinite(tier.monthly_price)
                && tier.monthly_price > 0
        )
        .sort((a, b) => a.min_months - b.min_months);
}

export function normalizePricingMode(value: unknown): PricingMode {
    return value === "tiered" ? "tiered" : "fixed";
}

export function getLowestTieredPrice(baseMonthlyPrice: number, pricingTiers: PricingTier[]) {
    const normalizedBase = toNumeric(baseMonthlyPrice);
    if (pricingTiers.length === 0) return normalizedBase;

    return pricingTiers.reduce(
        (lowest, tier) => Math.min(lowest, tier.monthly_price),
        normalizedBase,
    );
}

export function resolveTieredMonthlyPrice(
    baseMonthlyPrice: number,
    pricingMode: "fixed" | "tiered" | string | null | undefined,
    pricingTiers: PricingTier[],
    durationMonths: number,
) {
    const normalizedBase = toNumeric(baseMonthlyPrice);

    if (pricingMode !== "tiered" || pricingTiers.length === 0) {
        return normalizedBase;
    }

    const matchedTier =
        [...pricingTiers]
            .reverse()
            .find((tier) => durationMonths >= tier.min_months) ?? null;

    return toNumeric(matchedTier?.monthly_price ?? normalizedBase);
}

export function resolveListingMonthlyPrice(
    baseMonthlyPrice: number,
    pricingMode: "fixed" | "tiered" | string | null | undefined,
    pricingTiers: PricingTier[],
) {
    const normalizedBase = toNumeric(baseMonthlyPrice);
    const lowestTieredPrice = getLowestTieredPrice(normalizedBase, pricingTiers);
    const hasTieredDiscount = pricingMode === "tiered" && lowestTieredPrice < normalizedBase;
    const listingMonthlyPrice = hasTieredDiscount ? lowestTieredPrice : normalizedBase;

    return {
        baseMonthlyPrice: normalizedBase,
        listingMonthlyPrice,
        hasTieredDiscount,
    };
}
