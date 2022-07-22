import React, { useEffect } from 'react';
import { NextPageContext } from 'next';
import { getSession } from 'next-auth/react';
import serializeAccount, { SerializedAccount } from 'serializers/account';
import { useRouter } from 'next/router';
import { toast } from 'components/Toast';
import { channelIndex, findAccountByEmail } from 'lib/models';
import Settings from 'components/Pages/Settings';
import { sortBy } from 'utilities/sort';
import { channels } from '@prisma/client';

interface Props {
  account?: SerializedAccount;
  channels?: channels[];
}

export default function SettingsPage({ account, channels }: Props) {
  const router = useRouter();

  useEffect(() => {
    const error = router.query.error as string;
    if (error) {
      toast.error('Something went wrong, please try again');
      router.replace(window.location.pathname, undefined, { shallow: true });
    }
    const success = router.query.success as string;
    if (success) {
      toast.success(decodeURI(success));
      router.replace(window.location.pathname, undefined, { shallow: true });
    }
  }, [router.query, router]);

  return <Settings account={account} channels={channels} />;
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const account = await findAccountByEmail(session?.user?.email);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: 'signin',
      },
    };
  }

  if (!account) {
    return {
      props: {
        session,
      },
    };
  }

  const channelsResponse = await channelIndex(account.id);
  const channels = sortBy(channelsResponse, 'channelName');
  return {
    props: {
      session,
      channels,
      account: account && serializeAccount(account),
    },
  };
}