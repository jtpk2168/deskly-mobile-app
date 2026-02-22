import { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type AppTopBarProps = {
    title: string;
    onBackPress?: () => void;
    right?: ReactNode;
    containerClassName?: string;
    leftContainerClassName?: string;
    rightContainerClassName?: string;
};

export function AppTopBar({
    title,
    onBackPress,
    right,
    containerClassName = "",
    leftContainerClassName = "",
    rightContainerClassName = "",
}: AppTopBarProps) {
    return (
        <View className={`border-b border-gray-100 bg-white/95 px-5 py-4 ${containerClassName}`}>
            <View className="flex-row items-center">
                <View className={`w-12 ${leftContainerClassName}`}>
                    {onBackPress ? (
                        <TouchableOpacity onPress={onBackPress} className="-ml-1 rounded-full p-2">
                            <MaterialIcons name="arrow-back" size={24} color="#94A3B8" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <Text className="flex-1 text-center text-xl font-semibold text-gray-900">{title}</Text>

                <View className={`w-12 items-end ${rightContainerClassName}`}>{right ?? <View />}</View>
            </View>
        </View>
    );
}
