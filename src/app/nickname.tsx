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

import { useAuth } from '@/src/lib/auth';
import { supabase } from '@/src/lib/supabase';
import { useColors } from '@/src/lib/theme';

// Mesma regra do banco (migração profile_nickname_rules).
const NICKNAME_RULE = /^[A-Za-z0-9_]{3,20}$/;

// Tela simples para escolher o apelido no primeiro acesso. Será melhorada depois.
export default function Nickname() {
  const colors = useColors();
  const { session, saveNickname } = useAuth();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const nickname = value.trim();
    if (!NICKNAME_RULE.test(nickname)) {
      setError('Use de 3 a 20 caracteres: letras sem acento, números e _ (sem espaços).');
      return;
    }
    if (!session) return;

    setBusy(true);
    setError(null);

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ nickname })
      .eq('id', session.user.id)
      .select('nickname');

    if (updateError) {
      // 23505 = apelido já usado por outra pessoa
      setError(
        updateError.code === '23505'
          ? 'Esse apelido já está em uso. Escolha outro.'
          : updateError.message,
      );
    } else if (!data || data.length === 0) {
      setError('Não foi possível salvar o apelido. Tente de novo.');
    } else {
      // O layout raiz percebe o apelido e troca de tela sozinho.
      saveNickname(data[0].nickname);
    }

    setBusy(false);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.form}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={[styles.title, { color: colors.text }]}>Escolha seu apelido</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          É o nome que aparece junto aos preços que você publicar.
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
          placeholder="Apelido"
          placeholderTextColor={colors.muted}
          value={value}
          onChangeText={setValue}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
          editable={!busy}
          onSubmitEditing={submit}
        />

        {error && <Text style={[styles.message, { color: colors.error }]}>{error}</Text>}

        <Pressable
          style={[styles.button, { backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }]}
          onPress={submit}
          disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Continuar</Text>
          )}
        </Pressable>

        <Pressable onPress={() => supabase.auth.signOut()} disabled={busy} style={styles.link}>
          <Text style={{ color: colors.primary }}>Sair</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  form: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 4, marginBottom: 24 },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, marginBottom: 12 },
  message: { marginBottom: 12 },
  button: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  link: { alignItems: 'center', marginTop: 20 },
});
