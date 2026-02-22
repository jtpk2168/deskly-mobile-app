export function hasText(value: string | null | undefined): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

export function toErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message.trim().length > 0) return error.message;
    return fallback;
}

type DateDisplayOptions = {
    locale?: string;
    fallback?: string;
    options?: Intl.DateTimeFormatOptions;
};

type MissingField = {
    label: string;
    value: string | null | undefined;
};

export function formatDateDisplay(value: string | null | undefined, config: DateDisplayOptions = {}) {
    const fallback = config.fallback ?? "—";
    if (!value) return fallback;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;

    return date.toLocaleDateString(
        config.locale ?? "en-MY",
        config.options ?? {
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
    );
}

export function collectMissingFieldLabels(fields: MissingField[]) {
    return fields
        .filter((field) => !hasText(field.value))
        .map((field) => field.label);
}

export function toNull(value: string) {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function getParamValue(value?: string | string[]) {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
}
