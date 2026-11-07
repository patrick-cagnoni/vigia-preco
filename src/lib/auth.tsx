import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { supabase } from '@/src/lib/supabase';

type AuthState = {
  session: Session | null;
  /** Ainda recuperando a sessão salva no aparelho. */
  loading: boolean;
  /** Perfil (apelido) já carregado para a pessoa logada. */
  profileReady: boolean;
  /** Falha ao carregar o perfil (rede, por exemplo). */
  profileError: boolean;
  /** Apelido da pessoa logada; null se ainda não escolheu. */
  nickname: string | null;
  saveNickname: (nickname: string) => void;
  reloadProfile: () => void;
};

const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
  profileReady: false,
  profileError: false,
  nickname: null,
  saveNickname: () => {},
  reloadProfile: () => {},
});

// Guarda a sessão de login e o perfil, e avisa o app quando eles mudam.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ userId: string; nickname: string | null } | null>(null);
  const [profileError, setProfileError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const userId = session?.user.id;

  useEffect(() => {
    // Sessão salva no aparelho (se a pessoa já estava logada).
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));

    // Mudanças dali em diante. Aqui dentro só atualizamos o estado,
    // sem chamar o Supabase de novo (isso pode travar).
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Carrega o perfil sempre que a pessoa logada mudar (ou ao tentar de novo).
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setProfileError(false);
      return;
    }

    let active = true;
    setProfileError(false);

    supabase
      .from('profiles')
      .select('nickname')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setProfileError(true);
        else setProfile({ userId, nickname: data?.nickname ?? null });
      });

    return () => {
      active = false;
    };
  }, [userId, reloadKey]);

  const profileReady = !userId || profile?.userId === userId;
  const nickname = userId && profile?.userId === userId ? profile.nickname : null;

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        profileReady,
        profileError,
        nickname,
        saveNickname: (value) => {
          if (userId) setProfile({ userId, nickname: value });
        },
        reloadProfile: () => setReloadKey((key) => key + 1),
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
