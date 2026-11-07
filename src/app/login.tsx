import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/src/lib/supabase';
import { useColors } from '@/src/lib/theme';

// Tela simples de login e cadastro. Será melhorada depois.
type Mode = 'signin' | 'signup';

export default function Login() {
  const colors = useColors();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const isSignup = mode === 'signup';

  async function submit() {
    const cleanEmail = email.trim();
    if (!cleanEmail || password.length < 6) {
      setMessage({ text: 'Informe um e-mail e uma senha de pelo menos 6 caracteres.', isError: true });
      return;
    }

    setBusy(true);
    setMessage(null);

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password });
      if (error) {
        setMessage({ text: error.message, isError: true });
      } else if (!data.session) {
        // Só acontece quando a confirmação de e-mail está ligada (produção).
        setMessage({ text: 'Conta criada. Confirme seu e-mail para entrar.', isError: false });
      }
      // Com sessão criada, o layout raiz troca de tela sozinho.
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) setMessage({ text: error.message, isError: true });
    }

    setBusy(false);
  }

  function toggleMode() {
    setMode(isSignup ? 'signin' : 'signup');
    setMessage(null);
  }

  const inputStyle = [styles.input, { backgroundColor: colors.input, color: colors.text }];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.form}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={[styles.title, { color: colors.text }]}>Vigia Preço</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {isSignup ? 'Crie sua conta' : 'Entre na sua conta'}
        </Text>

        <TextInput
          style={inputStyle}
          placeholder="E-mail"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          editable={!busy}
        />
        <TextInput
          style={inputStyle}
          placeholder="Senha (mínimo 6 caracteres)"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          secureTextEntry
          editable={!busy}
          onSubmitEditing={submit}
        />

        {message && (
          <Text style={[styles.message, { color: message.isError ? colors.error : colors.muted }]}>
            {message.text}
          </Text>
        )}

        <Pressable
          style={[styles.button, { backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }]}
          onPress={submit}
          disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
              {isSignup ? 'Criar conta' : 'Entrar'}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={toggleMode} disabled={busy} style={styles.toggle}>
          <Text style={{ color: colors.primary }}>
            {isSignup ? 'Já tenho conta. Entrar' : 'Não tenho conta. Criar conta'}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  form: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 4, marginBottom: 24 },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, marginBottom: 12 },
  message: { marginBottom: 12 },
  button: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  toggle: { alignItems: 'center', marginTop: 20 },
});
