import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { AppTopBar } from "../../components/ui/AppTopBar";

function SelectField({ label, placeholder }: { label: string; placeholder: string }) {
    return (
        <View>
            <Text className="ml-1 text-sm font-medium text-slate-500">{label}</Text>
            <TouchableOpacity className="mt-2 flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                <Text className="text-base text-slate-400">{placeholder}</Text>
                <MaterialIcons name="expand-more" size={20} color="#94A3B8" />
            </TouchableOpacity>
        </View>
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
                        <Input label="Company Legal Name" placeholder="e.g. Acme Corp Inc." icon="business" />
                        <Input label="Registration Number (SSM/Tax ID)" placeholder="XX-XXXXXXX" icon="badge" />

                        <View>
                            <Text className="ml-1 text-sm font-medium text-slate-500">HQ Office Address</Text>
                            <View className="mt-2 rounded-xl border border-gray-200 bg-gray-50">
                                <TextInput
                                    className="min-h-[120px] px-4 pb-4 pt-3 text-gray-900"
                                    placeholder="Street address, City, State, Zip"
                                    placeholderTextColor="#94A3B8"
                                    multiline
                                    textAlignVertical="top"
                                    style={styles.multilineInput}
                                />
                            </View>
                        </View>

                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <SelectField label="Industry" placeholder="Select" />
                            </View>
                            <View className="flex-1">
                                <SelectField label="Team Size" placeholder="Select" />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-6 py-6">
                <Button label="Finish Setup" onPress={() => router.replace("/(tabs)")} />
            </View>
        </SafeAreaView>
    );
}
