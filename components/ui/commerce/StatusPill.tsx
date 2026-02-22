import { Text, View, ViewProps } from "react-native";
import {
    formatBillingStatusLabel,
    statusBadgeClassName,
    statusDotClassName,
    statusTextClassName,
} from "../../../lib/ui/billingStatus";

type StatusPillProps = ViewProps & {
    status: string | null | undefined;
    label?: string;
    showDot?: boolean;
    uppercase?: boolean;
    className?: string;
};

export function StatusPill({
    status,
    label,
    showDot = true,
    uppercase = true,
    className = "",
    ...props
}: StatusPillProps) {
    const textLabel = label ?? formatBillingStatusLabel(status);

    return (
        <View
            className={`flex-row items-center rounded-full px-2 py-1 ${statusBadgeClassName(status)} ${className}`}
            {...props}
        >
            {showDot ? (
                <View className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusDotClassName(status)}`} />
            ) : null}
            <Text className={`text-xs font-semibold ${uppercase ? "uppercase" : ""} ${statusTextClassName(status)}`}>
                {textLabel}
            </Text>
        </View>
    );
}
