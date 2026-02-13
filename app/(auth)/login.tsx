import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export default function LoginScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className="flex-1 px-6 py-6" contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                    <View className="flex-1 justify-between">
                        <View className="mt-10 items-center">
                            <View className="mb-10 items-center">
                                <Text className="text-4xl font-bold uppercase tracking-widest text-primary">Deskly</Text>
                                <Text className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-primary-dark">
                                    Furnishing Your Future Success
                                </Text>
                            </View>

                            <Text className="mb-4 text-center text-3xl font-bold leading-tight text-gray-900">
                                Rent Office Furniture.{"\n"}
                                <Text className="text-primary">Zero Upfront Cost.</Text>
                            </Text>
                            <Text className="max-w-sm text-center text-base leading-relaxed text-slate-500">
                                Empower your workspace with our flexible subscription model. Premium furniture, managed for you.
                            </Text>
                        </View>

                        <View className="mt-8">
                            <Input
                                label="Work Email"
                                placeholder="name@company.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                icon="mail-outline"
                            />

                            <View className="mt-4">
                                <View className="mb-1 flex-row items-center justify-between px-1">
                                    <Text className="text-sm font-medium text-slate-500">Password</Text>
                                    <TouchableOpacity>
                                        <Text className="text-sm font-medium text-primary">Forgot?</Text>
                                    </TouchableOpacity>
                                </View>
                                <Input label="" placeholder="••••••••" icon="lock-outline" secureTextEntry />
                            </View>

                            <Button label="Log in" className="mt-6" onPress={() => router.replace("/(onboarding)/personal-info")} />

                            <View className="relative my-6">
                                <View className="absolute inset-0 justify-center">
                                    <View className="border-t border-gray-100" />
                                </View>
                                <View className="items-center">
                                    <Text className="bg-white px-2 text-sm font-medium uppercase tracking-wider text-slate-400">Or</Text>
                                </View>
                            </View>

                            <Text className="text-center text-sm text-slate-500">
                                New to Deskly?
                                <Text className="font-semibold text-primary"> Create account</Text>
                            </Text>
                        </View>

                        <View className="mt-8 flex-row items-center justify-center rounded-full bg-gray-50 px-4 py-3">
                            <MaterialIcons name="verified-user" size={18} color="#16A34A" />
                            <Text className="ml-2 text-sm font-medium uppercase tracking-wider text-slate-500">
                                Enterprise Grade Security & Encryption
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
