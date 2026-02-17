import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../contexts/CartContext';

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
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityState={props.accessibilityState}
                                onPress={props.onPress}
                                activeOpacity={0.9}
                                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', top: -12 }}
                            >
                                <View className={`${selected ? 'bg-primary' : 'bg-slate-900'} relative h-14 w-14 items-center justify-center rounded-full shadow-sm`}>
                                    <MaterialCommunityIcons name="shopping-outline" size={24} color="#FFFFFF" />
                                    {itemCount > 0 && (
                                        <View className="absolute -right-1 -top-1 min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1">
                                            <Text className="text-[10px] font-bold text-white">
                                                {itemCount > 99 ? '99+' : itemCount}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
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
