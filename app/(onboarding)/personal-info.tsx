import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { AppTopBar, Button, Input, StickyActionBar } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { collectMissingFieldLabels, getParamValue } from "../../lib/ui";

export default function PersonalInfoScreen() {
    const { user } = useAuth();
    const params = useLocalSearchParams<{
        full_name?: string | string[];
        job_title?: string | string[];
        phone_number?: string | string[];
        business_email?: string | string[];
        company_name?: string | string[];
        registration_number?: string | string[];
        address?: string | string[];
        office_city?: string | string[];
        office_zip_postal?: string | string[];
        delivery_address?: string | string[];
        delivery_city?: string | string[];
        delivery_zip_postal?: string | string[];
        industry?: string | string[];
        team_size?: string | string[];
    }>();

    const initialValues = useMemo(
        () => ({
            fullName: getParamValue(params.full_name),
            jobTitle: getParamValue(params.job_title),
            phoneNumber: getParamValue(params.phone_number),
            businessEmail: getParamValue(params.business_email),
        }),
        [params.business_email, params.full_name, params.job_title, params.phone_number]
    );

    const [fullName, setFullName] = useState(initialValues.fullName);
    const [jobTitle, setJobTitle] = useState(initialValues.jobTitle);
    const [phoneNumber, setPhoneNumber] = useState(initialValues.phoneNumber);
    const [businessEmail, setBusinessEmail] = useState(initialValues.businessEmail);

    useEffect(() => {
        if (!businessEmail.trim() && user?.email) {
            setBusinessEmail(user.email);
        }
    }, [businessEmail, user?.email]);

    const handleContinue = () => {
        if (!user) {
            Alert.alert("Sign In Required", "Please sign in before completing your profile.");
            router.push("/(auth)/login");
            return;
        }

        const missingPersonalFields = collectMissingFieldLabels([
            { label: "Full Name", value: fullName },
            { label: "Job Title", value: jobTitle },
            { label: "Phone Number", value: phoneNumber },
            { label: "Business Email", value: businessEmail },
        ]);

        if (missingPersonalFields.length > 0) {
            Alert.alert("Missing Information", "Please complete all fields before continuing.");
            return;
        }

        router.push({
            pathname: "/(onboarding)/company-details",
            params: {
                full_name: fullName.trim(),
                job_title: jobTitle.trim(),
                phone_number: phoneNumber.trim(),
                business_email: businessEmail.trim(),
                company_name: getParamValue(params.company_name),
                registration_number: getParamValue(params.registration_number),
                address: getParamValue(params.address),
                office_city: getParamValue(params.office_city),
                office_zip_postal: getParamValue(params.office_zip_postal),
                delivery_address: getParamValue(params.delivery_address),
                delivery_city: getParamValue(params.delivery_city),
                delivery_zip_postal: getParamValue(params.delivery_zip_postal),
                industry: getParamValue(params.industry),
                team_size: getParamValue(params.team_size),
            },
        });
    };

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
                        <Input
                            label="Full Name"
                            placeholder="e.g. Jane Doe"
                            icon="person-outline"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                        <Input
                            label="Job Title"
                            placeholder="e.g. Operations Manager"
                            icon="work-outline"
                            value={jobTitle}
                            onChangeText={setJobTitle}
                        />
                        <Input
                            label="Business Email"
                            placeholder="name@company.com"
                            icon="mail-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={businessEmail}
                            onChangeText={setBusinessEmail}
                        />
                        <Input
                            label="Phone Number"
                            placeholder="+1 (555) 000-0000"
                            icon="call"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <StickyActionBar className="bg-white" extraBottomPadding={0}>
                <Button label="Continue" onPress={handleContinue} />
            </StickyActionBar>
        </SafeAreaView>
    );
}
