import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { isValidEmail, toErrorMessage } from "../../lib/ui";
import { Button, Divider, Input } from "../../components/ui";

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const normalizedEmail = email.trim();
    const emailError =
        normalizedEmail.length > 0 && !isValidEmail(normalizedEmail)
            ? "Please enter a valid email address."
            : undefined;

    const handleLogin = async () => {
        if (!normalizedEmail || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (!isValidEmail(normalizedEmail)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password,
            });

            if (error) throw error;
            router.replace('/(tabs)');
        } catch (error: unknown) {
            Alert.alert('Login Failed', toErrorMessage(error, 'Unable to sign in right now.'));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!normalizedEmail) {
            Alert.alert('Error', 'Please enter your email address to reset password');
            return;
        }
        if (!isValidEmail(normalizedEmail)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
            if (error) throw error;
            Alert.alert('Success', 'Password reset instructions sent to your email');
        } catch (error: unknown) {
            Alert.alert('Error', toErrorMessage(error, 'Unable to send reset instructions.'));
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
                                <Text
                                    className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-primary-dark"
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.85}
                                >
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
                                value={email}
                                onChangeText={setEmail}
                                error={emailError}
                            />

                            <View className="mt-4">
                                <View className="mb-1 flex-row items-center justify-between px-1">
                                    <Text className="text-sm font-medium text-slate-500">Password</Text>
                                    <TouchableOpacity onPress={handleForgotPassword}>
                                        <Text className="text-sm font-medium text-primary">Forgot password?</Text>
                                    </TouchableOpacity>
                                </View>
                                <Input
                                    placeholder="••••••••"
                                    icon="lock-outline"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    rightIcon={showPassword ? "visibility-off" : "visibility"}
                                    rightIconAccessibilityLabel={showPassword ? "Hide password" : "Show password"}
                                    onRightIconPress={() => setShowPassword((previous) => !previous)}
                                />
                            </View>

                            <Button
                                label="Log in"
                                className="mt-6"
                                onPress={handleLogin}
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
                                <Text className="text-sm text-slate-500">New to Deskly? </Text>
                                <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                                    <Text className="text-sm font-semibold text-primary">Create account</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
