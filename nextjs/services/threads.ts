import serializeThread from '../serializers/thread';
import {
  threadIndex,
  threadCount,
  channelIndex,
  findAccountByPath,
  findThreadById,
  channelsGroupByThreadCount,
} from '../lib/models';
import { ThreadByIdResponse } from '../types/apiResponses/threads/[threadId]';
import { accounts, users } from '@prisma/client';
import { GetStaticPropsContext } from 'next';
import { NotFound } from '../utilities/response';
import { revalidateInSeconds } from '../constants/revalidate';
import * as Sentry from '@sentry/nextjs';
import { buildSettings } from './accountSettings';
import { memoize } from '../utilities/dynamoCache';

interface IndexProps {
  channelId: string;
  page: number;
  account: accounts;
}

export async function index({ channelId, page, account }: IndexProps) {
  const take = 10;
  const skip = (page - 1) * take;
  const [threads, total] = await Promise.all([
    threadIndexMemo({ channelId, take, skip, account }),
    threadCountMemo(channelId),
  ]);
  return {
    data: {
      threads: threads.map(serializeThread),
    },
    pagination: {
      totalCount: total,
      pageCount: Math.ceil(total / take),
      currentPage: page,
      perPage: take,
    },
  };
}

// extracted here to be reused in both /[threadId]/index and /[slug]/index
export async function getThreadById(
  threadId: string,
  communityName: string
): Promise<ThreadByIdResponse> {
  const id = parseInt(threadId);
  const [thread, account] = await Promise.all([
    findThreadByIdMemo(id),
    findAccountByPathMemo(communityName),
  ]);

  if (!thread || !thread?.channel?.accountId) {
    return Promise.reject(new Error('Thread not found'));
  }

  if (!account) {
    return Promise.reject(new Error('Account not found'));
  }

  if (thread?.channel?.accountId !== account.id) {
    console.log('thread belongs to another community');
    return Promise.reject(new Error('Thread not found'));
  }

  const [channels, channelsResponse] = await Promise.all([
    channelIndexMemo(thread.channel.accountId, { hidden: false }),
    channelsGroupByThreadCountMemo(thread?.channel?.accountId),
  ]);

  //Filter out channels with less than 20 threads
  const channelsWithMinThreads = channels
    .filter((c) => !c.hidden)
    .filter((c) => {
      if (c.id === thread?.channel?.id) {
        return true;
      }

      const channelCount = channelsResponse.find((r) => {
        return r.channelId === c.id;
      });

      return channelCount && channelCount._count.id > 2;
    });

  const settings = buildSettings(account);

  const authors = thread.messages
    .map((m) => m.author)
    .filter(Boolean) as users[];

  let threadUrl: string;

  if (account.communityInviteUrl) {
    if (account.communityInviteUrl.includes('slack.com/join/shared_invite')) {
      threadUrl =
        account.communityInviteUrl &&
        `${account.communityInviteUrl}/archives/${
          thread.channel.externalChannelId
        }/p${(parseFloat(thread.externalThreadId) * 1000000).toString()}`;
    } else {
      threadUrl = account.communityInviteUrl;
    }
  } else {
    threadUrl =
      account.communityUrl +
      '/archives/' +
      thread.channel.externalChannelId +
      '/p' +
      (parseFloat(thread.externalThreadId) * 1000000).toString();
  }

  if (account.discordServerId) {
    threadUrl = `https://discord.com/channels/${account.discordServerId}/${thread.channel.externalChannelId}/${thread.externalThreadId}`;
  }

  return {
    id: thread.id,
    incrementId: thread.incrementId,
    viewCount: thread.viewCount,
    slug: thread.slug || '',
    externalThreadId: thread.externalThreadId,
    messageCount: thread.messageCount,
    channelId: thread.channel.id,
    channel: thread.channel,
    authors: authors,
    messages: serializeThread(thread).messages,
    threadId,
    currentChannel: thread.channel,
    channels: channelsWithMinThreads,
    communityUrl: account.communityUrl || '',
    communityInviteUrl: account.communityInviteUrl || '',
    communityName:
      account.slackDomain ||
      account.discordDomain ||
      account.discordServerId ||
      '',
    threadUrl,
    settings,
  };
}

export async function threadGetStaticProps(
  context: GetStaticPropsContext,
  isSubdomainbasedRouting: boolean
) {
  const threadId = context.params?.threadId as string;
  const communityName = context.params?.communityName as string;
  try {
    const thread = await getThreadByIdMemo(threadId, communityName);
    return {
      props: {
        ...thread,
        isSubDomainRouting: isSubdomainbasedRouting,
      },
      revalidate: revalidateInSeconds, // In seconds
    };
  } catch (exception) {
    Sentry.captureException(exception);
    return NotFound();
  }
}

const threadIndexMemo = memoize(threadIndex);
const threadCountMemo = memoize(threadCount);
const findThreadByIdMemo = memoize(findThreadById);
const channelIndexMemo = memoize(channelIndex);
const findAccountByPathMemo = memoize(findAccountByPath);
const channelsGroupByThreadCountMemo = memoize(channelsGroupByThreadCount);
const getThreadByIdMemo = memoize(getThreadById);