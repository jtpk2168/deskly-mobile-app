import { Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
    variant?: "primary" | "secondary" | "outline";
    label: string;
    loading?: boolean;
}

export function Button({ variant = "primary", label, loading, className, ...props }: ButtonProps) {
    const baseStyles = "flex items-center justify-center py-4 px-5 rounded-xl";
    const variants = {
        primary: "bg-primary border border-transparent shadow-sm active:bg-primary-dark",
        secondary: "bg-surface-light border border-gray-200 active:bg-gray-50",
        outline: "bg-transparent border border-primary active:bg-primary/10",
    };

    const textStyles = {
        primary: "text-white font-semibold text-base",
        secondary: "text-text-light font-medium text-base",
        outline: "text-primary font-medium text-base",
    };
    const isDisabled = Boolean(loading || props.disabled);

    return (
        <TouchableOpacity
            className={`${baseStyles} ${variants[variant]} ${className ?? ""} ${isDisabled ? "opacity-50" : ""}`}
            disabled={isDisabled}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === "primary" ? "white" : "#6B8599"} />
            ) : (
                <Text className={textStyles[variant]}>{label}</Text>
            )}
        </TouchableOpacity>
    );
}
