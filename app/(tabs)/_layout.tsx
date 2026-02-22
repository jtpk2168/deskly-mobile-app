import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../contexts/CartContext';
import { FloatingCartTabButton } from '../../components/ui';

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const { itemCount } = useCart();
    const tabBarBottomPadding = Math.max(insets.bottom + 4, 14);
    const tabBarHeight = 64 + tabBarBottomPadding;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarStyle: {
                    position: 'absolute',
                    height: tabBarHeight,
                    paddingTop: 10,
                    paddingBottom: tabBarBottomPadding,
                    backgroundColor: 'rgba(255,255,255,0.96)',
                    borderTopColor: '#E2E8F0',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '700',
                },
                tabBarActiveTintColor: '#6B8599',
                tabBarInactiveTintColor: '#94A3B8',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home-variant-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="catalog"
                options={{
                    title: 'Discover',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="magnify" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Plan',
                    tabBarIcon: () => null,
                    tabBarButton: (props) => {
                        const selected = props.accessibilityState?.selected;
                        return (
                            <FloatingCartTabButton
                                selected={selected}
                                itemCount={itemCount}
                                onPress={props.onPress}
                                accessibilityState={props.accessibilityState}
                            />
                        );
                    },
                }}
            />
            <Tabs.Screen
                name="rentals"
                options={{
                    title: 'My Rentals',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="package-variant-closed" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
