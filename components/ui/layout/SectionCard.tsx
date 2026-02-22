import { ReactNode } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, View, ViewProps } from "react-native";

type SectionCardProps = ViewProps & {
    title?: string;
    subtitle?: string;
    icon?: keyof typeof MaterialIcons.glyphMap;
    headerRight?: ReactNode;
    contentClassName?: string;
    className?: string;
};

export function SectionCard({
    title,
    subtitle,
    icon,
    headerRight,
    children,
    className = "",
    contentClassName = "",
    ...props
}: SectionCardProps) {
    const hasHeader = Boolean(title || subtitle || icon || headerRight);

    return (
        <View className={`rounded-2xl border border-gray-100 bg-white p-5 ${className}`} {...props}>
            {hasHeader ? (
                <View className="mb-4 flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                        <View className="flex-row items-center">
                            {icon ? (
                                <View className="mr-2 h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                                    <MaterialIcons name={icon} size={16} color="#6B8599" />
                                </View>
                            ) : null}
                            {title ? <Text className="text-base font-bold text-gray-900">{title}</Text> : null}
                        </View>
                        {subtitle ? <Text className="mt-1 text-sm text-slate-500">{subtitle}</Text> : null}
                    </View>
                    {headerRight ? <View>{headerRight}</View> : null}
                </View>
            ) : null}

            <View className={contentClassName}>{children}</View>
        </View>
    );
}
