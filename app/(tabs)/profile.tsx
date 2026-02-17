import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useProfile } from "../../hooks/useApi";
import { AppTopBar } from "../../components/ui/AppTopBar";
import { useTabBarSpacing } from "../../lib/tabBarSpacing";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
    const { user, isLoading: authLoading } = useAuth();
    const { contentPaddingBottom } = useTabBarSpacing({ contentExtra: 34 });
    const { data: profile, loading, error, refetch } = useProfile(user?.id);
    const isProfileMissing = Boolean(error?.toLowerCase().includes("profile not found")) || (!error && !profile);
    const company = profile?.company ?? null;

    useFocusEffect(
        useCallback(() => {
            if (user?.id) {
                void refetch();
            }
        }, [refetch, user?.id])
    );

    const handleLogout = async () => {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
            Alert.alert("Logout Failed", signOutError.message);
            return;
        }
        router.replace("/(auth)/login");
    };

    const handleOpenProfileSetup = () => {
        router.push({
            pathname: "/(onboarding)/personal-info",
            params: {
                full_name: profile?.full_name ?? "",
                job_title: profile?.job_title ?? "",
                phone_number: profile?.phone_number ?? "",
                business_email: user?.email ?? "",
                company_name: company?.company_name ?? "",
                registration_number: company?.registration_number ?? "",
                address: company?.address ?? "",
                office_city: company?.office_city ?? "",
                office_zip_postal: company?.office_zip_postal ?? "",
                delivery_address: company?.delivery_address ?? "",
                delivery_city: company?.delivery_city ?? "",
                delivery_zip_postal: company?.delivery_zip_postal ?? "",
                industry: company?.industry ?? "",
                team_size: company?.team_size ?? "",
            },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
            <AppTopBar title="My Profile" />

            <ScrollView className="flex-1 px-6 pt-2 pb-7" contentContainerStyle={{ paddingBottom: contentPaddingBottom }} showsVerticalScrollIndicator={false}>
                {authLoading || loading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#6B8599" />
                        <Text className="mt-3 text-sm text-slate-400">Loading profile...</Text>
                    </View>
                ) : !user ? (
                    <View className="items-center py-16 px-4">
                        <View className="h-24 w-24 items-center justify-center rounded-full bg-gray-100 mb-4">
                            <MaterialIcons name="lock-outline" size={48} color="#CBD5E1" />
                        </View>
                        <Text className="text-xl font-bold text-gray-900 mb-2">Sign In Required</Text>
                        <Text className="text-sm text-slate-400 text-center mb-6">
                            Sign in to manage your personal and company profile details.
                        </Text>
                        <TouchableOpacity
                            className="rounded-xl bg-primary px-8 py-3.5"
                            onPress={() => router.push("/(auth)/login")}
                        >
                            <Text className="text-sm font-semibold text-white">Go to Login</Text>
                        </TouchableOpacity>
                    </View>
                ) : error && !isProfileMissing ? (
                    <View className="items-center py-16 px-4">
                        <View className="h-24 w-24 items-center justify-center rounded-full bg-gray-100 mb-4">
                            <MaterialIcons name="wifi-off" size={48} color="#CBD5E1" />
                        </View>
                        <Text className="text-xl font-bold text-gray-900 mb-2">Couldn&apos;t Load Profile</Text>
                        <Text className="text-sm text-slate-400 text-center mb-6">{error}</Text>
                        <TouchableOpacity
                            className="rounded-xl bg-primary px-8 py-3.5"
                            onPress={() => void refetch()}
                        >
                            <Text className="text-sm font-semibold text-white">Try Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : isProfileMissing ? (
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
                            onPress={handleOpenProfileSetup}
                        >
                            <Text className="text-sm font-semibold text-white">Complete Profile</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                            <View className="flex-row items-center border-b border-gray-100 px-5 py-4">
                                <View className="h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                    <MaterialIcons name="person" size={18} color="#6B8599" />
                                </View>
                                <Text className="ml-3 text-base font-bold text-gray-900">Personal Information</Text>
                            </View>
                            <View className="gap-4 p-5">
                                <Field label="Full Name" value={profile?.full_name ?? "—"} />
                                <Divider />
                                <Field label="Job Title" value={profile?.job_title ?? "—"} />
                                <Divider />
                                <Field label="Phone Number" value={profile?.phone_number ?? "—"} />
                            </View>
                        </View>

                        {company && (
                            <View className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                <View className="flex-row items-center border-b border-gray-100 px-5 py-4">
                                    <View className="h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                        <MaterialIcons name="business" size={18} color="#6B8599" />
                                    </View>
                                    <Text className="ml-3 text-base font-bold text-gray-900">Company Information</Text>
                                </View>
                                <View className="gap-4 p-5">
                                    <Field label="Company Name" value={company.company_name} />
                                    <Divider />
                                    <Field label="Registration Number" value={company.registration_number ?? "—"} />
                                    <Divider />
                                    <Field label="Industry" value={company.industry ?? "—"} />
                                    <Divider />
                                    <Field label="Team Size" value={company.team_size ?? "—"} />
                                    <Divider />
                                    <Field label="HQ Office Address" value={company.address ?? "—"} />
                                    <Divider />
                                    <Field label="Office City" value={company.office_city ?? "—"} />
                                    <Divider />
                                    <Field label="Office Zip / Postal" value={company.office_zip_postal ?? "—"} />
                                    <Divider />
                                    <Field label="Delivery Address" value={company.delivery_address ?? "—"} />
                                    <Divider />
                                    <Field label="Delivery City" value={company.delivery_city ?? "—"} />
                                    <Divider />
                                    <Field label="Delivery Zip / Postal" value={company.delivery_zip_postal ?? "—"} />
                                </View>
                            </View>
                        )}

                        <TouchableOpacity className="mt-6 rounded-xl border border-primary py-4" onPress={handleOpenProfileSetup}>
                            <Text className="text-center text-base font-semibold text-primary">Edit Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleLogout} className="mt-3 py-3">
                            <Text className="text-center text-base font-semibold text-red-400">Log Out</Text>
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
            <Text className="mb-1 text-xs font-medium text-slate-500">{label}</Text>
            <Text className="text-[17px] font-semibold text-gray-900">{value}</Text>
        </View>
    );
}

function Divider() {
    return <View className="h-px bg-gray-100" />;
}
