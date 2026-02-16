import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { AppTopBar } from "../../components/ui/AppTopBar";

type DateCardProps = {
    day: string;
    date: string;
    month: string;
    isSelected: boolean;
    onPress: () => void;
};

const DateCard = ({ day, date, month, isSelected, onPress }: DateCardProps) => (
    <TouchableOpacity
        onPress={onPress}
        className={`w-24 h-28 rounded-xl border flex items-center justify-center mr-3 ${isSelected
            ? "border-primary bg-primary/10 dark:bg-primary/20"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            }`}
    >
        <Text className={`text-sm font-medium uppercase ${isSelected ? "text-primary" : "text-gray-400"}`}>
            {day}
        </Text>
        <Text className={`text-xl font-bold ${isSelected ? "text-primary" : "text-gray-700 dark:text-gray-200"}`}>
            {date}
        </Text>
        <Text className={`text-sm ${isSelected ? "text-primary" : "text-gray-400"}`}>
            {month}
        </Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    inputText: {
        fontSize: 16,
        lineHeight: 20,
        paddingVertical: 0,
        includeFontPadding: false,
    },
});

export default function DeliveryCheckoutScreen() {
    const [selectedDate, setSelectedDate] = useState(0);
    const [termsAccepted, setTermsAccepted] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark" edges={['top', 'left', 'right']}>
            <AppTopBar title="Delivery Details" onBackPress={() => router.back()} />

            <View className="px-6 py-4 bg-background-light dark:bg-background-dark">
                <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-semibold text-primary">Shipping</Text>
                    <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment</Text>
                    <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">Review</Text>
                </View>
                <View className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-row">
                    <View className="w-1/3 bg-primary h-full rounded-full" />
                </View>
            </View>

            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>

                <View className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <View className="flex-row items-center mb-4 space-x-2">
                        <MaterialIcons name="location-on" size={20} className="text-primary" color="#6B8296" />
                        <Text className="text-base font-semibold text-gray-900 dark:text-white">Shipping Address</Text>
                    </View>
                    <View className="space-y-4">
                        <View>
                            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</Text>
                            <TextInput
                                className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base text-gray-900 dark:text-white"
                                placeholder="Acme Corp."
                                placeholderTextColor="#9CA3AF"
                                style={styles.inputText}
                            />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</Text>
                            <TextInput
                                className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base text-gray-900 dark:text-white"
                                placeholder="123 Innovation Blvd, Suite 400"
                                placeholderTextColor="#9CA3AF"
                                style={styles.inputText}
                            />
                        </View>
                        <View className="flex-row space-x-4">
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</Text>
                                <TextInput
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base text-gray-900 dark:text-white"
                                    placeholder="San Francisco"
                                    placeholderTextColor="#9CA3AF"
                                    style={styles.inputText}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zip / Postal</Text>
                                <TextInput
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base text-gray-900 dark:text-white"
                                    placeholder="94105"
                                    placeholderTextColor="#9CA3AF"
                                    style={styles.inputText}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <View className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <View className="flex-row items-center mb-4 space-x-2">
                        <MaterialIcons name="person" size={20} className="text-primary" color="#6B8296" />
                        <Text className="text-base font-semibold text-gray-900 dark:text-white">Site Contact</Text>
                    </View>
                    <View className="space-y-4">
                        <View>
                            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</Text>
                            <TextInput
                                className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base text-gray-900 dark:text-white"
                                placeholder="Jane Doe"
                                placeholderTextColor="#9CA3AF"
                                style={styles.inputText}
                            />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</Text>
                            <View className="relative">
                                <TextInput
                                    className="w-full h-12 pl-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base text-gray-900 dark:text-white"
                                    placeholder="+1 (555) 987-6543"
                                    placeholderTextColor="#9CA3AF"
                                    style={styles.inputText}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <View className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <View className="flex-row items-center mb-4 space-x-2">
                        <MaterialIcons name="event" size={20} className="text-primary" color="#6B8296" />
                        <Text className="text-base font-semibold text-gray-900 dark:text-white">Schedule Delivery</Text>
                    </View>
                    <View className="space-y-4">
                        <View>
                            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Date</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <DateCard day="Today" date="24" month="Oct" isSelected={selectedDate === 0} onPress={() => setSelectedDate(0)} />
                                <DateCard day="Fri" date="25" month="Oct" isSelected={selectedDate === 1} onPress={() => setSelectedDate(1)} />
                                <DateCard day="Sat" date="26" month="Oct" isSelected={selectedDate === 2} onPress={() => setSelectedDate(2)} />
                                <DateCard day="Sun" date="27" month="Oct" isSelected={selectedDate === 3} onPress={() => setSelectedDate(3)} />
                            </ScrollView>
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Slot</Text>
                            <View className="flex-row items-center justify-between w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                <Text className="text-base text-gray-900 dark:text-white">09:00 AM - 12:00 PM (Morning)</Text>
                                <MaterialIcons name="expand-more" size={24} color="#9CA3AF" />
                            </View>
                        </View>
                    </View>
                </View>

                <View className="flex-row items-start space-x-3 mb-6">
                    <TouchableOpacity
                        onPress={() => setTermsAccepted(!termsAccepted)}
                        className={`w-5 h-5 rounded border items-center justify-center mt-0.5 ${termsAccepted ? "bg-primary border-primary" : "border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600"}`}
                    >
                        {termsAccepted && <MaterialIcons name="check" size={14} color="white" />}
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Rental Agreement</Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                            I agree to the <Text className="text-primary">Terms of Service</Text> and <Text className="text-primary">Delivery Policy</Text> regarding office equipment rentals.
                        </Text>
                    </View>
                </View>

            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 px-6 py-5 pb-8 shadow-lg z-50">
                <View className="flex-row justify-between items-end mb-4">
                    <View>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Monthly Total</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-2xl font-bold text-gray-900 dark:text-white">$1,249.00</Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">/mo</Text>
                        </View>
                    </View>
                    <Text className="text-sm text-primary font-medium">12 Items</Text>
                </View>
                <TouchableOpacity
                    className="w-full bg-primary py-3.5 rounded-xl flex-row items-center justify-center space-x-2 shadow-sm"
                    onPress={() => router.push('/checkout/confirmation')}
                >
                    <Text className="text-white font-medium text-lg">Proceed to Payment</Text>
                    <MaterialIcons name="arrow-forward" size={18} color="white" />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}
