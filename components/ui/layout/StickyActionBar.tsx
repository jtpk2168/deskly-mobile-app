import { ReactNode } from "react";
import { View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type StickyActionBarProps = ViewProps & {
    children: ReactNode;
    extraBottomPadding?: number;
    minBottomPadding?: number;
    bottomOffset?: number;
    className?: string;
};

export function StickyActionBar({
    children,
    extraBottomPadding = 8,
    minBottomPadding = 14,
    bottomOffset = 0,
    className,
    style,
    ...props
}: StickyActionBarProps) {
    const insets = useSafeAreaInsets();
    const paddingBottom = Math.max(minBottomPadding, insets.bottom + extraBottomPadding);

    return (
        <View
            className={`absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white/95 px-6 py-5 ${className ?? ""}`}
            style={[{ paddingBottom, bottom: bottomOffset }, style]}
            {...props}
        >
            {children}
        </View>
    );
}
