import { ActivityIndicator, Text, View, ViewProps } from "react-native";

type LoadingStateProps = ViewProps & {
    label?: string;
    className?: string;
    labelClassName?: string;
    indicatorColor?: string;
};

export function LoadingState({
    label = "Loading...",
    className = "",
    labelClassName = "",
    indicatorColor = "#6B8599",
    ...props
}: LoadingStateProps) {
    return (
        <View className={`items-center justify-center py-20 ${className}`} {...props}>
            <ActivityIndicator size="large" color={indicatorColor} />
            <Text className={`mt-3 text-sm text-slate-400 ${labelClassName}`}>{label}</Text>
        </View>
    );
}
