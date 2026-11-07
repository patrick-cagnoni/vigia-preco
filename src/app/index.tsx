import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
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

export default function Index() {
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Produtos</Text>

      {loading && <ActivityIndicator style={styles.center} />}

      {error && (
        <Text style={styles.error}>
          Não foi possível ler o banco: {error}
        </Text>
      )}

      {!loading && !error && (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum produto cadastrado.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
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
  error: { color: '#b00020', marginTop: 16 },
  empty: { color: '#666', marginTop: 16 },
  row: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc' },
  name: { fontSize: 17, fontWeight: '600' },
  meta: { fontSize: 14, color: '#666', marginTop: 2 },
});
