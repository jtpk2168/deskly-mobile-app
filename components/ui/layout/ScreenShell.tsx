import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { AppTopBar } from "../primitives/AppTopBar";

type ScreenShellProps = {
    children: ReactNode;
    title?: string;
    onBackPress?: () => void;
    topBarRight?: ReactNode;
    topBarContainerClassName?: string;
    edges?: Edge[];
    backgroundClassName?: string;
    contentClassName?: string;
    scrollContentContainerStyle?: {
        paddingTop?: number;
        paddingBottom?: number;
        paddingHorizontal?: number;
    };
    stickyFooter?: ReactNode;
    stickyFooterClassName?: string;
    useScrollView?: boolean;
    showsVerticalScrollIndicator?: boolean;
};

export function ScreenShell({
    children,
    title,
    onBackPress,
    topBarRight,
    topBarContainerClassName,
    edges = ["top", "left", "right"],
    backgroundClassName = "bg-gray-50",
    contentClassName = "",
    scrollContentContainerStyle,
    stickyFooter,
    stickyFooterClassName,
    useScrollView = true,
    showsVerticalScrollIndicator = false,
}: ScreenShellProps) {
    return (
        <SafeAreaView className={`flex-1 ${backgroundClassName}`} edges={edges}>
            {title ? (
                <AppTopBar
                    title={title}
                    onBackPress={onBackPress}
                    right={topBarRight}
                    containerClassName={topBarContainerClassName}
                />
            ) : null}

            {useScrollView ? (
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={scrollContentContainerStyle}
                    showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                >
                    <View className={contentClassName}>{children}</View>
                </ScrollView>
            ) : (
                <View className={`flex-1 ${contentClassName}`}>{children}</View>
            )}

            {stickyFooter ? (
                <View className={`absolute bottom-0 left-0 right-0 ${stickyFooterClassName ?? ""}`}>
                    {stickyFooter}
                </View>
            ) : null}
        </SafeAreaView>
    );
}
