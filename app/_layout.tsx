import {useEffect, useState} from 'react';
import type {ColorSchemeName} from 'react-native';
import {useColorScheme} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {dark, light} from '@dooboo-ui/theme';
import {css} from '@emotion/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDooboo} from 'dooboo-ui';
import StatusBarBrightness from 'dooboo-ui/uis/StatusbarBrightness';
import {SplashScreen, Stack} from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import {initializeApp} from 'firebase/app';
import {getAuth, onAuthStateChanged, type User} from 'firebase/auth';
import {useRecoilState} from 'recoil';

import {firebaseConfig} from '../config';
import RootProvider from '../src/providers';
import {authRecoilState} from '../src/recoils/atoms';
import {AsyncStorageKey} from '../src/utils/constants';

SplashScreen.preventAutoHideAsync();

export const app = initializeApp(firebaseConfig);

function Layout(): JSX.Element | null {
  const {assetLoaded, theme} = useDooboo();
  const [user, setUser] = useRecoilState(authRecoilState);

  // TODO: Remove Console
  console.log('user', user);

  useEffect(() => {
    if (assetLoaded) {
      SplashScreen.hideAsync();
    }
  }, [assetLoaded]);

  useEffect(() => {
    onAuthStateChanged(getAuth(), (fireUser: User | null) => {
      setUser(fireUser);
    });
  }, [setUser]);

  if (!assetLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.bg.basic,
        },
        headerTintColor: theme.text.label,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: theme.text.basic,
        },
      }}
    >
      {/* Note: Only modals are written here.  */}
    </Stack>
  );
}

export default function RootLayout(): JSX.Element | null {
  const colorScheme = useColorScheme();
  const [localThemeType, setLocalThemeType] = useState<string | undefined>(
    undefined,
  );

  // 테마 불러오기
  useEffect(() => {
    const initializeThemeType = async (): Promise<void> => {
      const darkMode = await AsyncStorage.getItem(AsyncStorageKey.DarkMode);

      const isDarkMode = !darkMode
        ? colorScheme === 'dark'
        : darkMode === 'true';

      SystemUI.setBackgroundColorAsync(
        isDarkMode ? dark.bg.basic : light.bg.basic,
      );

      setLocalThemeType(isDarkMode ? 'dark' : 'light');
    };

    initializeThemeType();
  }, [colorScheme]);

  if (!localThemeType) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={css`
        flex: 1;
      `}
    >
      <RootProvider initialThemeType={localThemeType as ColorSchemeName}>
        <>
          <StatusBarBrightness />
          <Layout />
        </>
      </RootProvider>
    </GestureHandlerRootView>
  );
}
