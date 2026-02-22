import { Text, View, ViewProps } from "react-native";

type PriceSummaryRowProps = ViewProps & {
    label: string;
    value: string;
    valueTone?: "default" | "strong" | "primary";
    className?: string;
};

function valueClassName(valueTone: PriceSummaryRowProps["valueTone"]) {
    if (valueTone === "primary") return "text-sm font-bold text-primary";
    if (valueTone === "strong") return "text-sm font-semibold text-gray-900";
    return "text-sm font-medium text-slate-700";
}

export function PriceSummaryRow({
    label,
    value,
    valueTone = "default",
    className,
    ...props
}: PriceSummaryRowProps) {
    return (
        <View className={`flex-row items-center justify-between ${className ?? ""}`} {...props}>
            <Text className="text-sm text-slate-500">{label}</Text>
            <Text className={valueClassName(valueTone)}>{value}</Text>
        </View>
    );
}
