import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { toErrorMessage } from "../../lib/ui";
import { Button, Divider, Input } from "../../components/ui";

export default function SignupScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password || !fullName) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'customer'
                    },
                },
            });

            if (error) throw error;

            if (data.session) {
                router.replace('/(tabs)');
            } else {
                Alert.alert('Success', 'Please check your email for verification!');
                router.back();
            }
        } catch (error: unknown) {
            Alert.alert('Signup Failed', toErrorMessage(error, 'Unable to create account right now.'));
        } finally {
            setLoading(false);
        }
    };

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
                                    Join The Revolution
                                </Text>
                            </View>

                            <Text className="mb-4 text-center text-3xl font-bold leading-tight text-gray-900">
                                Create Account.{"\n"}
                                <Text className="text-primary">Start Renting.</Text>
                            </Text>
                            <Text className="max-w-sm text-center text-base leading-relaxed text-slate-500">
                                Sign up to access premium furniture with our flexible subscription model.
                            </Text>
                        </View>

                        <View className="mt-8">
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                icon="person-outline"
                                value={fullName}
                                onChangeText={setFullName}
                                className="mb-4"
                            />

                            <Input
                                label="Work Email"
                                placeholder="name@company.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                icon="mail-outline"
                                value={email}
                                onChangeText={setEmail}
                            />

                            <View className="mt-4">
                                <Input
                                    label="Password"
                                    placeholder="••••••••"
                                    icon="lock-outline"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>

                            <Button
                                label="Create Account"
                                className="mt-6"
                                onPress={handleSignup}
                                loading={loading}
                            />

                            <View className="relative my-6">
                                <View className="absolute inset-0 justify-center">
                                    <Divider />
                                </View>
                                <View className="items-center">
                                    <Text className="bg-white px-2 text-sm font-medium uppercase tracking-wider text-slate-400">Or</Text>
                                </View>
                            </View>

                            <View className="flex-row justify-center items-center mt-6 mb-4">
                                <Text className="text-sm text-slate-500">Already have an account? </Text>
                                <TouchableOpacity onPress={() => router.back()}>
                                    <Text className="text-sm font-semibold text-primary">Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
