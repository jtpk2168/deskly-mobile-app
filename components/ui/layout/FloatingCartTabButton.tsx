import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, TouchableOpacityProps, View } from "react-native";

type FloatingCartTabButtonProps = {
    selected?: boolean;
    itemCount: number;
    onPress?: TouchableOpacityProps["onPress"];
    accessibilityState?: {
        selected?: boolean;
    };
};

export function FloatingCartTabButton({
    selected,
    itemCount,
    onPress,
    accessibilityState,
}: FloatingCartTabButtonProps) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={accessibilityState}
            onPress={onPress}
            activeOpacity={0.9}
            style={{ flex: 1, justifyContent: "center", alignItems: "center", top: -12 }}
        >
            <View className={`${selected ? "bg-primary" : "bg-slate-900"} relative h-14 w-14 items-center justify-center rounded-full shadow-sm`}>
                <MaterialCommunityIcons name="shopping-outline" size={24} color="#FFFFFF" />
                {itemCount > 0 && (
                    <View className="absolute -right-1 -top-1 min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1">
                        <Text className="text-[10px] font-bold text-white">
                            {itemCount > 99 ? "99+" : itemCount}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}
