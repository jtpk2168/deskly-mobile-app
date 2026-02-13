import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useProfile } from "../../hooks/useApi";
import { AppTopBar } from "../../components/ui/AppTopBar";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";

// TODO: Replace with real auth user ID after auth is connected
const MOCK_USER_ID = undefined;

export default function ProfileScreen() {
    const { contentPaddingBottom } = useTabBarSpacing({ contentExtra: 34 });
    const { data: profile, loading, error } = useProfile(MOCK_USER_ID);

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
            <AppTopBar title="My Profile" />

            <ScrollView className="flex-1 px-6 py-7" contentContainerStyle={{ paddingBottom: contentPaddingBottom }} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#6B8599" />
                        <Text className="mt-3 text-sm text-slate-400">Loading profile...</Text>
                    </View>
                ) : error || !profile ? (
                    <View className="items-center py-16 px-4">
                        <View className="h-24 w-24 items-center justify-center rounded-full bg-gray-100 mb-4">
                            <MaterialIcons name="person-outline" size={48} color="#CBD5E1" />
                        </View>
                        <Text className="text-xl font-bold text-gray-900 mb-2">No Profile Yet</Text>
                        <Text className="text-sm text-slate-400 text-center mb-6">
                            Complete your profile setup to unlock full access to the catalog.
                        </Text>
                        <TouchableOpacity
                            className="rounded-xl bg-primary px-8 py-3.5"
                            onPress={() => router.push("/(onboarding)/personal-info")}
                        >
                            <Text className="text-sm font-semibold text-white">Complete Profile</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View className="mb-2 items-center">
                            <View className="relative mb-3">
                                <View className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gray-200 items-center justify-center">
                                    <Text className="text-2xl font-bold text-primary">
                                        {(profile.full_name ?? '?').charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <TouchableOpacity className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-primary p-1.5">
                                    <MaterialIcons name="edit" size={12} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-xl font-bold text-gray-900">{profile.full_name ?? 'Unknown'}</Text>
                            <Text className="text-sm font-medium uppercase tracking-wider text-slate-400">
                                {profile.job_title ?? 'No title'}{profile.company ? ` @ ${profile.company.company_name}` : ''}
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
                                <Field label="Full Name" value={profile.full_name ?? '—'} />
                                <Field label="Job Title" value={profile.job_title ?? '—'} />
                                <Field label="Phone Number" value={profile.phone_number ?? '—'} />
                            </View>
                        </View>

                        {profile.company && (
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
                                            <Text className="font-bold text-primary">
                                                {profile.company.company_name.substring(0, 2).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">Company</Text>
                                            <Text className="text-base font-semibold text-gray-800">{profile.company.company_name}</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row gap-4">
                                        <View className="flex-1">
                                            <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">Team Size</Text>
                                            <Text className="text-base font-semibold text-gray-800">{profile.company.team_size ?? '—'}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">Industry</Text>
                                            <Text className="text-base font-semibold text-gray-800">{profile.company.industry ?? '—'}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity className="mt-6 rounded-xl border border-primary py-4">
                            <Text className="text-center text-sm font-bold uppercase tracking-widest text-primary">Edit Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.replace("/(auth)/login")} className="mt-2 py-4">
                            <Text className="text-center text-sm font-bold uppercase tracking-widest text-red-400">Log Out</Text>
                        </TouchableOpacity>
                    </>
                )}
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
