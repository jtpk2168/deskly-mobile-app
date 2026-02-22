export function hasText(value: string | null | undefined): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

export function toNull(value: string) {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function getParamValue(value?: string | string[]) {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
}
