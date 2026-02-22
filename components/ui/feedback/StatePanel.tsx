import { ReactNode } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View, ViewProps } from "react-native";

type StatePanelProps = ViewProps & {
    icon?: keyof typeof MaterialIcons.glyphMap;
    title: string;
    description?: string;
    actionLabel?: string;
    onActionPress?: () => void;
    headerSlot?: ReactNode;
    className?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    actionClassName?: string;
    actionLabelClassName?: string;
    iconContainerClassName?: string;
    iconColor?: string;
};

export function StatePanel({
    icon,
    title,
    description,
    actionLabel,
    onActionPress,
    headerSlot,
    className,
    titleClassName,
    descriptionClassName,
    actionClassName,
    actionLabelClassName,
    iconContainerClassName,
    iconColor = "#CBD5E1",
    ...props
}: StatePanelProps) {
    return (
        <View className={`items-center justify-center px-4 py-16 ${className ?? ""}`} {...props}>
            {headerSlot ? (
                <View className="mb-4">{headerSlot}</View>
            ) : icon ? (
                <View className={`mb-4 h-24 w-24 items-center justify-center rounded-full bg-gray-100 ${iconContainerClassName ?? ""}`}>
                    <MaterialIcons name={icon} size={48} color={iconColor} />
                </View>
            ) : null}

            <Text className={`mb-2 text-center text-xl font-bold text-gray-900 ${titleClassName ?? ""}`}>{title}</Text>

            {description ? (
                <Text className={`mb-6 text-center text-sm text-slate-400 ${descriptionClassName ?? ""}`}>{description}</Text>
            ) : null}

            {(actionLabel && onActionPress) ? (
                <TouchableOpacity className={`rounded-xl bg-primary px-8 py-3.5 ${actionClassName ?? ""}`} onPress={onActionPress}>
                    <Text className={`text-sm font-semibold text-white ${actionLabelClassName ?? ""}`}>{actionLabel}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}
