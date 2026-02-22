import { View, ViewProps } from "react-native";

type DividerProps = ViewProps & {
    className?: string;
};

export function Divider({ className, ...props }: DividerProps) {
    return <View className={`h-px bg-gray-100 ${className ?? ""}`} {...props} />;
}
