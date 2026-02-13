import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const DEFAULT_CONTENT_EXTRA = 24;
const DEFAULT_FLOATING_EXTRA = 8;

type UseTabBarSpacingOptions = {
    contentExtra?: number;
    floatingExtra?: number;
};

export function useTabBarSpacing(options: UseTabBarSpacingOptions = {}) {
    const tabBarHeight = useBottomTabBarHeight();
    const contentExtra = options.contentExtra ?? DEFAULT_CONTENT_EXTRA;
    const floatingExtra = options.floatingExtra ?? DEFAULT_FLOATING_EXTRA;

    return {
        tabBarHeight,
        contentPaddingBottom: tabBarHeight + contentExtra,
        floatingBottom: tabBarHeight + floatingExtra,
    };
}
