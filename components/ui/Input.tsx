import { TextInput, View, Text, TextInputProps } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
    label?: string;
    icon?: keyof typeof MaterialIcons.glyphMap;
    error?: string;
}

export function Input({ label, icon, error, className, ...props }: InputProps) {
    return (
        <View className={className}>
            {label ? <Text className="mb-2 ml-1 text-base font-medium text-slate-600">{label}</Text> : null}
            <View className="relative">
                {icon && (
                    <View className="absolute inset-y-0 left-0 pl-3 z-10 flex items-center justify-center h-full pointer-events-none">
                        <MaterialIcons name={icon} size={20} color="#94A3B8" />
                    </View>
                )}
                <TextInput
                    className={`block w-full ${icon ? "pl-11" : "pl-4"} rounded-2xl border border-gray-200 bg-gray-50 py-4 pr-4 text-base text-slate-700 placeholder-gray-400`}
                    placeholderTextColor="#94A3B8"
                    {...props}
                />
            </View>
            {error ? <Text className="ml-1 mt-2 text-sm text-red-500">{error}</Text> : null}
        </View>
    );
}
