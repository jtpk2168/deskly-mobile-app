import { TextInput, View, Text, TextInputProps } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
    label: string;
    icon?: keyof typeof MaterialIcons.glyphMap;
    error?: string;
}

export function Input({ label, icon, error, className, ...props }: InputProps) {
    return (
        <View className={`space-y-2 ${className}`}>
            <Text className="block text-sm font-medium text-subtext-light ml-1">
                {label}
            </Text>
            <View className="relative">
                {icon && (
                    <View className="absolute inset-y-0 left-0 pl-3 z-10 flex items-center justify-center h-full pointer-events-none">
                        <MaterialIcons name={icon} size={20} color="#94A3B8" />
                    </View>
                )}
                <TextInput
                    className={`block w-full ${icon ? "pl-11" : "pl-4"} pr-4 py-4 border border-gray-200 rounded-xl bg-gray-50 text-text-light placeholder-gray-400 text-base`}
                    placeholderTextColor="#94A3B8"
                    {...props}
                />
            </View>
            {error && <Text className="text-red-500 text-sm ml-1">{error}</Text>}
        </View>
    );
}
