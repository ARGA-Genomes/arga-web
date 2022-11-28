'use client';

import { ActionIcon, AppShell, Group, Header, Navbar } from '@mantine/core';
import RootStyleRegistry from '../emotion';
import logo from '../../public/ARGA-logo-notext.png';
import Image from 'next/image';
import { IconSun } from '@tabler/icons';

// import Search from '../../../react/src/components/Search';

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <head />
      <body>
        <AppShell
          padding="md"
          navbar={
            <Navbar width={{ base: 300 }} height="100%" p="xs">
              Some navigation stuff
            </Navbar>
          }
          header={
            <Header height={72} p="xs" style={{ padding: '5px 10px' }}>
              {/* Header content */}
              <Group position={'apart'}>
                <a href="https://arga.org.au">
                  <Image src={logo} alt="ARGA logo" style={{ marginRight: 8 }} />
                  Australian Reference Genome Atlas
                </a>
                <ActionIcon color={'blue'} size="lg">
                  <IconSun size={16} />
                  {/* {colorScheme === 'dark' ? <Sun size={16} /> : <MoonStars size={16} />} */}
                </ActionIcon>
              </Group>
            </Header>
          }
          styles={(theme) => ({
            main: {
              backgroundColor:
                theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
            },
          })}
        >
          <RootStyleRegistry>{children}</RootStyleRegistry>
        </AppShell>
      </body>
    </html>
  );
}
