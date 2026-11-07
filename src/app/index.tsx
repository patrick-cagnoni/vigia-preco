import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/src/lib/supabase';

// Tela provisória: só prova que o app consegue ler o banco.
// Será substituída pela tela inicial de verdade (busca, ofertas próximas).
type Product = {
  id: string;
  name: string;
  brand: string | null;
  unit: string;
  quantity: number;
};

// Cores por tema (o app segue o tema claro/escuro do aparelho).
const palette = {
  light: { background: '#ffffff', text: '#111111', muted: '#666666', border: '#cccccc', error: '#b00020' },
  dark: { background: '#000000', text: '#ffffff', muted: '#aaaaaa', border: '#333333', error: '#ff6b6b' },
};

export default function Index() {
  const colors = palette[useColorScheme() === 'dark' ? 'dark' : 'light'];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, brand, unit, quantity')
        .order('name');

      if (!active) return;
      if (error) setError(error.message);
      else setProducts(data ?? []);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Produtos</Text>

      {loading && <ActivityIndicator style={styles.center} color={colors.muted} />}

      {error && (
        <Text style={[styles.message, { color: colors.error }]}>
          Não foi possível ler o banco: {error}
        </Text>
      )}

      {!loading && !error && (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={[styles.message, { color: colors.muted }]}>Nenhum produto cadastrado.</Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.row, { borderColor: colors.border }]}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.meta, { color: colors.muted }]}>
                {[item.brand, `${item.quantity} ${item.unit}`].filter(Boolean).join(' · ')}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
  center: { marginTop: 32 },
  message: { marginTop: 16 },
  row: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  name: { fontSize: 17, fontWeight: '600' },
  meta: { fontSize: 14, marginTop: 2 },
});
