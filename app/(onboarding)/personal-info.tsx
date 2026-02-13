import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { AppTopBar } from "../../components/ui/AppTopBar";

export default function PersonalInfoScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <AppTopBar
                title="Profile Setup"
                onBackPress={() => router.back()}
                right={<Text className="text-sm font-semibold uppercase tracking-wider text-primary">Step 1 of 2</Text>}
                rightContainerClassName="w-24"
            />

            <View className="mb-8 px-6">
                <View className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <View className="h-full w-1/2 rounded-full bg-primary" />
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                    <View className="mb-10">
                        <Text className="text-3xl font-bold text-gray-900">Tell us about you</Text>
                        <Text className="mt-3 text-base text-slate-500">
                            We need a few details to customize your workspace experience.
                        </Text>
                    </View>

                    <View className="gap-6">
                        <Input label="Full Name" placeholder="e.g. Jane Doe" icon="person-outline" />
                        <Input label="Job Title" placeholder="e.g. Operations Manager" icon="work-outline" />
                        <Input
                            label="Business Email"
                            placeholder="name@company.com"
                            icon="mail-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Input label="Phone Number" placeholder="+1 (555) 000-0000" icon="call" keyboardType="phone-pad" />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-6 py-6">
                <Button label="Continue" onPress={() => router.push("/(onboarding)/company-details")} />
            </View>
        </SafeAreaView>
    );
}
