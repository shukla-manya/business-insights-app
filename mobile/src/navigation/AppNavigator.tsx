import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../screens/LoginScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { BusinessProfileScreen } from "../screens/BusinessProfileScreen";
import { ReviewsScreen } from "../screens/ReviewsScreen";
import { useAuth } from "../auth/AuthContext";
import { colors, typography } from "../theme";
import { MainHeaderMenu, type MainStackParamList } from "./MainHeaderMenu";

const Stack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.text,
    border: colors.cardBorder,
    primary: colors.accent,
  },
};

const mainHeaderOptions = {
  headerStyle: {
    backgroundColor: colors.bgElevated,
  },
  headerShadowVisible: false,
  headerTintColor: colors.text,
  headerTitleStyle: {
    ...typography.subtitle,
    color: colors.text,
    fontWeight: "700" as const,
  },
  headerRight: () => <MainHeaderMenu />,
};

function MainStackNavigator() {
  return (
    <MainStack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        ...mainHeaderOptions,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <MainStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Insights" }} />
      <MainStack.Screen name="Business" component={BusinessProfileScreen} options={{ title: "Profile" }} />
      <MainStack.Screen name="Reviews" component={ReviewsScreen} options={{ title: "Reviews" }} />
    </MainStack.Navigator>
  );
}

export function AppNavigator() {
  const { token, bootstrapping } = useAuth();

  if (bootstrapping) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        {token == null ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
});
