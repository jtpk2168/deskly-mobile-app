import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { AppTopBar, Button, Checkbox, Input, StickyActionBar } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { upsertProfile, useProfile } from "../../hooks/useApi";
import { getParamValue, toNull } from "../../lib/ui";

function isDeliverySameAsOfficeAddress(company: {
    address: string | null;
    office_city: string | null;
    office_zip_postal: string | null;
    delivery_address: string | null;
    delivery_city: string | null;
    delivery_zip_postal: string | null;
}) {
    const normalizedOfficeAddress = (company.address ?? "").trim();
    const normalizedOfficeCity = (company.office_city ?? "").trim();
    const normalizedOfficeZipPostal = (company.office_zip_postal ?? "").trim();
    const normalizedDeliveryAddress = (company.delivery_address ?? "").trim();
    const normalizedDeliveryCity = (company.delivery_city ?? "").trim();
    const normalizedDeliveryZipPostal = (company.delivery_zip_postal ?? "").trim();

    if (!normalizedDeliveryAddress && !normalizedDeliveryCity && !normalizedDeliveryZipPostal) {
        return normalizedOfficeAddress.length > 0 && normalizedOfficeCity.length > 0 && normalizedOfficeZipPostal.length > 0;
    }

    return (
        normalizedDeliveryAddress === normalizedOfficeAddress &&
        normalizedDeliveryCity === normalizedOfficeCity &&
        normalizedDeliveryZipPostal === normalizedOfficeZipPostal
    );
}

const styles = StyleSheet.create({
    multilineInput: {
        fontSize: 16,
        lineHeight: 22,
        paddingVertical: 0,
        includeFontPadding: false,
    },
});

export default function CompanyDetailsScreen() {
    const { user } = useAuth();
    const { data: profile } = useProfile(user?.id);
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

    const initialCompanyValues = useMemo(
        () => ({
            companyName: getParamValue(params.company_name).trim(),
            registrationNumber: getParamValue(params.registration_number).trim(),
            address: getParamValue(params.address).trim(),
            officeCity: getParamValue(params.office_city).trim(),
            officeZipPostal: getParamValue(params.office_zip_postal).trim(),
            deliveryAddress: getParamValue(params.delivery_address).trim(),
            deliveryCity: getParamValue(params.delivery_city).trim(),
            deliveryZipPostal: getParamValue(params.delivery_zip_postal).trim(),
            industry: getParamValue(params.industry).trim(),
            teamSize: getParamValue(params.team_size).trim(),
        }),
        [
            params.address,
            params.company_name,
            params.delivery_address,
            params.delivery_city,
            params.delivery_zip_postal,
            params.industry,
            params.office_city,
            params.office_zip_postal,
            params.registration_number,
            params.team_size,
        ]
    );

    const initialSameAsCompanyAddress = useMemo(() => {
        const noDeliveryValues =
            !initialCompanyValues.deliveryAddress &&
            !initialCompanyValues.deliveryCity &&
            !initialCompanyValues.deliveryZipPostal;

        if (noDeliveryValues) return true;

        return (
            initialCompanyValues.deliveryAddress === initialCompanyValues.address &&
            initialCompanyValues.deliveryCity === initialCompanyValues.officeCity &&
            initialCompanyValues.deliveryZipPostal === initialCompanyValues.officeZipPostal
        );
    }, [
        initialCompanyValues.address,
        initialCompanyValues.deliveryAddress,
        initialCompanyValues.deliveryCity,
        initialCompanyValues.deliveryZipPostal,
        initialCompanyValues.officeCity,
        initialCompanyValues.officeZipPostal,
    ]);

    const [companyName, setCompanyName] = useState(initialCompanyValues.companyName);
    const [registrationNumber, setRegistrationNumber] = useState(initialCompanyValues.registrationNumber);
    const [address, setAddress] = useState(initialCompanyValues.address);
    const [officeCity, setOfficeCity] = useState(initialCompanyValues.officeCity);
    const [officeZipPostal, setOfficeZipPostal] = useState(initialCompanyValues.officeZipPostal);
    const [deliveryAddress, setDeliveryAddress] = useState(
        initialCompanyValues.deliveryAddress || (initialSameAsCompanyAddress ? initialCompanyValues.address : "")
    );
    const [deliveryCity, setDeliveryCity] = useState(
        initialCompanyValues.deliveryCity || (initialSameAsCompanyAddress ? initialCompanyValues.officeCity : "")
    );
    const [deliveryZipPostal, setDeliveryZipPostal] = useState(
        initialCompanyValues.deliveryZipPostal || (initialSameAsCompanyAddress ? initialCompanyValues.officeZipPostal : "")
    );
    const [sameAsCompanyAddress, setSameAsCompanyAddress] = useState(initialSameAsCompanyAddress);
    const [industry, setIndustry] = useState(initialCompanyValues.industry);
    const [teamSize, setTeamSize] = useState(initialCompanyValues.teamSize);
    const [submitting, setSubmitting] = useState(false);

    const personalInfo = useMemo(
        () => ({
            fullName: getParamValue(params.full_name).trim(),
            jobTitle: getParamValue(params.job_title).trim(),
            phoneNumber: getParamValue(params.phone_number).trim(),
        }),
        [params.full_name, params.job_title, params.phone_number]
    );

    const resolvedPersonalInfo = useMemo(
        () => ({
            fullName: personalInfo.fullName || profile?.full_name?.trim() || "",
            jobTitle: personalInfo.jobTitle || profile?.job_title?.trim() || "",
            phoneNumber: personalInfo.phoneNumber || profile?.phone_number?.trim() || "",
        }),
        [personalInfo.fullName, personalInfo.jobTitle, personalInfo.phoneNumber, profile?.full_name, profile?.job_title, profile?.phone_number]
    );

    useEffect(() => {
        setCompanyName((current) => (current.trim().length > 0 ? current : initialCompanyValues.companyName));
        setRegistrationNumber((current) => (current.trim().length > 0 ? current : initialCompanyValues.registrationNumber));
        setAddress((current) => (current.trim().length > 0 ? current : initialCompanyValues.address));
        setOfficeCity((current) => (current.trim().length > 0 ? current : initialCompanyValues.officeCity));
        setOfficeZipPostal((current) => (current.trim().length > 0 ? current : initialCompanyValues.officeZipPostal));
        setDeliveryAddress((current) =>
            current.trim().length > 0
                ? current
                : initialCompanyValues.deliveryAddress || (initialSameAsCompanyAddress ? initialCompanyValues.address : "")
        );
        setDeliveryCity((current) =>
            current.trim().length > 0
                ? current
                : initialCompanyValues.deliveryCity || (initialSameAsCompanyAddress ? initialCompanyValues.officeCity : "")
        );
        setDeliveryZipPostal((current) =>
            current.trim().length > 0
                ? current
                : initialCompanyValues.deliveryZipPostal || (initialSameAsCompanyAddress ? initialCompanyValues.officeZipPostal : "")
        );
        setIndustry((current) => (current.trim().length > 0 ? current : initialCompanyValues.industry));
        setTeamSize((current) => (current.trim().length > 0 ? current : initialCompanyValues.teamSize));
    }, [
        initialCompanyValues.address,
        initialCompanyValues.companyName,
        initialCompanyValues.deliveryAddress,
        initialCompanyValues.deliveryCity,
        initialCompanyValues.deliveryZipPostal,
        initialCompanyValues.industry,
        initialCompanyValues.officeCity,
        initialCompanyValues.officeZipPostal,
        initialCompanyValues.registrationNumber,
        initialCompanyValues.teamSize,
        initialSameAsCompanyAddress,
    ]);

    useEffect(() => {
        const company = profile?.company;
        if (!company) return;
        const sameAsOfficeAddress = isDeliverySameAsOfficeAddress(company);

        setCompanyName((current) => (current.trim().length > 0 ? current : company.company_name ?? ""));
        setRegistrationNumber((current) => (current.trim().length > 0 ? current : company.registration_number ?? ""));
        setAddress((current) => (current.trim().length > 0 ? current : company.address ?? ""));
        setOfficeCity((current) => (current.trim().length > 0 ? current : company.office_city ?? ""));
        setOfficeZipPostal((current) => (current.trim().length > 0 ? current : company.office_zip_postal ?? ""));
        setDeliveryAddress((current) =>
            current.trim().length > 0
                ? current
                : sameAsOfficeAddress
                    ? company.address ?? ""
                    : company.delivery_address ?? ""
        );
        setDeliveryCity((current) =>
            current.trim().length > 0
                ? current
                : sameAsOfficeAddress
                    ? company.office_city ?? ""
                    : company.delivery_city ?? ""
        );
        setDeliveryZipPostal((current) =>
            current.trim().length > 0
                ? current
                : sameAsOfficeAddress
                    ? company.office_zip_postal ?? ""
                    : company.delivery_zip_postal ?? ""
        );
        setIndustry((current) => (current.trim().length > 0 ? current : company.industry ?? ""));
        setTeamSize((current) => (current.trim().length > 0 ? current : company.team_size ?? ""));
        setSameAsCompanyAddress(sameAsOfficeAddress);
    }, [profile?.company]);

    useEffect(() => {
        if (sameAsCompanyAddress) {
            setDeliveryAddress(address);
            setDeliveryCity(officeCity);
            setDeliveryZipPostal(officeZipPostal);
        }
    }, [address, officeCity, officeZipPostal, sameAsCompanyAddress]);

    const handleFinishSetup = async () => {
        if (!user) {
            Alert.alert("Sign In Required", "Please sign in before completing your profile.");
            router.push("/(auth)/login");
            return;
        }

        if (!resolvedPersonalInfo.fullName || !resolvedPersonalInfo.jobTitle || !resolvedPersonalInfo.phoneNumber) {
            Alert.alert("Missing Personal Info", "Please complete Step 1 first.");
            router.replace("/(onboarding)/personal-info");
            return;
        }

        if (!companyName.trim()) {
            Alert.alert("Missing Information", "Company legal name is required.");
            return;
        }

        const resolvedDeliveryAddress = sameAsCompanyAddress ? address : deliveryAddress;
        const resolvedDeliveryCity = sameAsCompanyAddress ? officeCity : deliveryCity;
        const resolvedDeliveryZipPostal = sameAsCompanyAddress ? officeZipPostal : deliveryZipPostal;
        const requiredCompanyFields = [
            { label: "Company Legal Name", value: companyName },
            { label: "Registration Number", value: registrationNumber },
            { label: "HQ Office Address", value: address },
            { label: "Office City", value: officeCity },
            { label: "Office Zip / Postal", value: officeZipPostal },
            { label: "Delivery Address", value: resolvedDeliveryAddress },
            { label: "Delivery City", value: resolvedDeliveryCity },
            { label: "Delivery Zip / Postal", value: resolvedDeliveryZipPostal },
            { label: "Industry", value: industry },
            { label: "Team Size", value: teamSize },
        ];
        const missingCompanyFields = requiredCompanyFields
            .filter((field) => field.value.trim().length === 0)
            .map((field) => field.label);

        if (missingCompanyFields.length > 0) {
            Alert.alert("Missing Information", `Please complete all fields: ${missingCompanyFields.join(", ")}.`);
            return;
        }

        setSubmitting(true);
        try {
            await upsertProfile({
                user_id: user.id,
                full_name: resolvedPersonalInfo.fullName,
                job_title: resolvedPersonalInfo.jobTitle,
                phone_number: resolvedPersonalInfo.phoneNumber,
                company: {
                    company_name: companyName.trim(),
                    registration_number: toNull(registrationNumber),
                    address: toNull(address),
                    office_city: toNull(officeCity),
                    office_zip_postal: toNull(officeZipPostal),
                    delivery_address: toNull(resolvedDeliveryAddress),
                    delivery_city: toNull(resolvedDeliveryCity),
                    delivery_zip_postal: toNull(resolvedDeliveryZipPostal),
                    industry: toNull(industry),
                    team_size: toNull(teamSize),
                },
            });

            router.replace("/(tabs)/profile");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save profile";
            Alert.alert("Profile Setup Failed", message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <AppTopBar
                title="Profile Setup"
                onBackPress={() => router.back()}
                right={<Text className="text-sm font-semibold uppercase tracking-wider text-primary">Step 2 of 2</Text>}
                rightContainerClassName="w-24"
            />

            <View className="mb-8 px-6">
                <View className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <View className="h-full w-full rounded-full bg-primary" />
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                    <View className="mb-10">
                        <Text className="text-3xl font-bold text-gray-900">Company Details</Text>
                        <Text className="mt-3 text-base text-slate-500">
                            Let&apos;s get your enterprise workspace set up. We need legal details to verify your business.
                        </Text>
                    </View>

                    <View className="gap-6">
                        <Input
                            label="Company Legal Name"
                            placeholder="e.g. Acme Corp Inc."
                            icon="business"
                            value={companyName}
                            onChangeText={setCompanyName}
                        />
                        <Input
                            label="Registration Number (SSM/Tax ID)"
                            placeholder="XX-XXXXXXX"
                            icon="badge"
                            value={registrationNumber}
                            onChangeText={setRegistrationNumber}
                        />

                        <View>
                            <Text className="ml-1 text-sm font-medium text-slate-500">HQ Office Address</Text>
                            <View className="mt-2 rounded-xl border border-gray-200 bg-gray-50">
                                <TextInput
                                    className="min-h-[120px] px-4 pb-4 pt-3 text-gray-900"
                                    placeholder="Street address"
                                    placeholderTextColor="#94A3B8"
                                    multiline
                                    value={address}
                                    onChangeText={setAddress}
                                    textAlignVertical="top"
                                    style={styles.multilineInput}
                                />
                            </View>
                        </View>

                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Input
                                    label="Office City"
                                    placeholder="e.g. San Francisco"
                                    value={officeCity}
                                    onChangeText={setOfficeCity}
                                />
                            </View>
                            <View className="flex-1">
                                <Input
                                    label="Office Zip / Postal"
                                    placeholder="e.g. 94105"
                                    keyboardType="number-pad"
                                    value={officeZipPostal}
                                    onChangeText={setOfficeZipPostal}
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="ml-1 text-sm font-medium text-slate-500">Delivery Address</Text>
                            <Checkbox
                                checked={sameAsCompanyAddress}
                                onPress={() => setSameAsCompanyAddress((previous) => !previous)}
                                className="mt-2"
                                label="Same as office address"
                            />

                            {!sameAsCompanyAddress && (
                                <>
                                    <View className="mt-3 rounded-xl border border-gray-200 bg-gray-50">
                                        <TextInput
                                            className="min-h-[100px] px-4 pb-4 pt-3 text-gray-900"
                                            placeholder="Street address"
                                            placeholderTextColor="#94A3B8"
                                            multiline
                                            value={deliveryAddress}
                                            onChangeText={setDeliveryAddress}
                                            textAlignVertical="top"
                                            style={styles.multilineInput}
                                        />
                                    </View>
                                    <View className="mt-3 flex-row gap-3">
                                        <View className="flex-1">
                                            <Input
                                                label="Delivery City"
                                                placeholder="e.g. San Francisco"
                                                value={deliveryCity}
                                                onChangeText={setDeliveryCity}
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Input
                                                label="Delivery Zip / Postal"
                                                placeholder="e.g. 94105"
                                                keyboardType="number-pad"
                                                value={deliveryZipPostal}
                                                onChangeText={setDeliveryZipPostal}
                                            />
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>

                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Input
                                    label="Industry"
                                    placeholder="e.g. Technology"
                                    value={industry}
                                    onChangeText={setIndustry}
                                />
                            </View>
                            <View className="flex-1">
                                <Input
                                    label="Team Size"
                                    placeholder="e.g. 50-200"
                                    value={teamSize}
                                    onChangeText={setTeamSize}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <StickyActionBar className="bg-white" extraBottomPadding={0}>
                <Button label="Finish Setup" onPress={handleFinishSetup} loading={submitting} />
            </StickyActionBar>
        </SafeAreaView>
    );
}
