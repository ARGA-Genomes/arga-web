'use client';

import { CacheProvider } from '@emotion/react';
import { useEmotionCache, MantineProvider, ColorScheme, ColorSchemeProvider } from '@mantine/core';
import { useServerInsertedHTML } from 'next/navigation';
import { GetServerSidePropsContext } from 'next';
import { AppProps } from 'next/app';
import { getCookie, setCookie } from 'cookies-next';
import { useState } from 'react';

export default function RootStyleRegistry(
  { children }: { children: React.ReactNode },
  props: AppProps & { colorScheme: ColorScheme }
  // { colorSchemeProp }: { colorSchemeProp: ColorScheme }
) {
  const cache = useEmotionCache();
  cache.compat = true;

  const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme);

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    setCookie('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 });
  };

  useServerInsertedHTML(() => (
    <style
      data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
      dangerouslySetInnerHTML={{
        __html: Object.values(cache.inserted).join(' '),
      }}
    />
  ));

  return (
    <CacheProvider value={cache}>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider withGlobalStyles withNormalizeCSS>
          {children}
        </MantineProvider>
      </ColorSchemeProvider>
    </CacheProvider>
  );
}

RootStyleRegistry.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
  colorScheme: getCookie('mantine-color-scheme', ctx) || 'light',
});
