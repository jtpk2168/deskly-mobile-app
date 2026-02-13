import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AppTopBar } from "../../components/ui/AppTopBar";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";

export default function ProfileScreen() {
    const { contentPaddingBottom } = useTabBarSpacing({ contentExtra: 34 });

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
            <AppTopBar title="My Profile" />

            <ScrollView className="flex-1 px-6 py-7" contentContainerStyle={{ paddingBottom: contentPaddingBottom }} showsVerticalScrollIndicator={false}>
                <View className="mb-2 items-center">
                    <View className="relative mb-3">
                        <View className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gray-200">
                            <Image
                                source={{
                                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5hn3b1c-Kglp8gmOZ4ud-FRon_Zcf08kK1zZazlpsIsIcOtipX41kAkFkEoqbfMLfckiKs0JFGGET-fBeUp4ALM6iMH6NaPcRqOJTCg7pBXcXO8VkP3nf-zPsy7KvItGJ30JEnRSmYyECETw1avPwUVfmTM9EJW6QGL6aGQ73t4xa71EdjTEqDGEoVCTa0UT9wqrcgK7M_d4eNoevH0xEgQ2REwAXp9d3uuysWIVlYTabL7R-UUQnoQF86H6Sz6NC9sL7RbwWGSE",
                                }}
                                className="h-full w-full"
                                resizeMode="cover"
                            />
                        </View>
                        <TouchableOpacity className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-primary p-1.5">
                            <MaterialIcons name="edit" size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-xl font-bold text-gray-900">Sarah Jenkins</Text>
                    <Text className="text-sm font-medium uppercase tracking-wider text-slate-400">
                        Facilities Manager @ TechFlow
                    </Text>
                </View>

                <View className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    <View className="flex-row items-center border-b border-gray-50 px-5 py-4">
                        <View className="rounded-lg bg-primary/10 p-2">
                            <MaterialIcons name="person" size={18} color="#6B8599" />
                        </View>
                        <Text className="ml-3 text-base font-bold text-gray-900">Personal Information</Text>
                    </View>
                    <View className="gap-5 p-5">
                        <Field label="Full Name" value="Sarah Jenkins" />
                        <Field label="Job Title" value="Facilities Manager" />
                        <Field label="Email Address" value="sarah.j@techflow.io" />
                        <Field label="Phone Number" value="+1 (555) 012-3456" />
                    </View>
                </View>

                <View className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    <View className="flex-row items-center border-b border-gray-50 px-5 py-4">
                        <View className="rounded-lg bg-primary/10 p-2">
                            <MaterialIcons name="business" size={18} color="#6B8599" />
                        </View>
                        <Text className="ml-3 text-base font-bold text-gray-900">Company Information</Text>
                    </View>
                    <View className="gap-5 p-5">
                        <View className="flex-row items-center gap-4">
                            <View className="h-12 w-12 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
                                <Text className="font-bold text-primary">TF</Text>
                            </View>
                            <View>
                                <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">Company</Text>
                                <Text className="text-base font-semibold text-gray-800">TechFlow Solutions</Text>
                            </View>
                        </View>
                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">Team Size</Text>
                                <Text className="text-base font-semibold text-gray-800">50-100</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">Industry</Text>
                                <Text className="text-base font-semibold text-gray-800">Software Development</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity className="mt-6 rounded-xl border border-primary py-4">
                    <Text className="text-center text-sm font-bold uppercase tracking-widest text-primary">Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace("/(auth)/login")} className="mt-2 py-4">
                    <Text className="text-center text-sm font-bold uppercase tracking-widest text-red-400">Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <View>
            <Text className="mb-1 text-sm font-bold uppercase tracking-widest text-slate-400">{label}</Text>
            <Text className="text-base font-semibold text-gray-800">{value}</Text>
        </View>
    );
}
