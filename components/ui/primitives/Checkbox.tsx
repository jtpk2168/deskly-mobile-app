import { MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, TouchableOpacityProps, View } from "react-native";

type CheckboxProps = TouchableOpacityProps & {
    checked: boolean;
    label?: string;
    description?: string;
    className?: string;
};

export function Checkbox({
    checked,
    label,
    description,
    className,
    disabled,
    ...props
}: CheckboxProps) {
    return (
        <TouchableOpacity
            className={`flex-row items-start ${disabled ? "opacity-50" : ""} ${className ?? ""}`}
            disabled={disabled}
            {...props}
        >
            <View
                className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${
                    checked ? "border-primary bg-primary" : "border-gray-300 bg-white"
                }`}
            >
                {checked ? <MaterialIcons name="check" size={14} color="#FFFFFF" /> : null}
            </View>
            {(label || description) ? (
                <View className="ml-3 flex-1">
                    {label ? <Text className="text-sm font-semibold text-gray-900">{label}</Text> : null}
                    {description ? <Text className="mt-0.5 text-sm text-slate-500">{description}</Text> : null}
                </View>
            ) : null}
        </TouchableOpacity>
    );
}
