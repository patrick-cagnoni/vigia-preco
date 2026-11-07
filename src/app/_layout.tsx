import { Stack } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthProvider, useAuth } from '@/src/lib/auth';
import { supabase } from '@/src/lib/supabase';
import { useColors } from '@/src/lib/theme';

// Decide qual tela mostrar:
// sem login -> login; logado sem apelido -> apelido; logado com apelido -> app.
function RootStack() {
  const { session, loading, profileReady, profileError, nickname, reloadProfile } = useAuth();
  const colors = useColors();

  if (session && profileError) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.text }]}>Não foi possível carregar seu perfil.</Text>
        <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={reloadProfile}>
          <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>Tentar de novo</Text>
        </Pressable>
        <Pressable onPress={() => supabase.auth.signOut()} style={styles.link}>
          <Text style={{ color: colors.primary }}>Sair</Text>
        </Pressable>
      </View>
    );
  }

  if (loading || (session && !profileReady)) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.muted} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session && !!nickname}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && !nickname}>
        <Stack.Screen name="nickname" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  text: { fontSize: 16, marginBottom: 16, textAlign: 'center' },
  button: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  link: { marginTop: 20 },
});
