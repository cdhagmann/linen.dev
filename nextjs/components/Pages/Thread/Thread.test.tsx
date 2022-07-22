import React from 'react';
import { render } from '@testing-library/react';
import Thread from './Thread';

describe('Thread', () => {
  describe('when threadCommunityInviteUrl is present', () => {
    it.skip('renders a link with the invite url', () => {
      const channels = [
        {
          id: 'X1',
          channelName: 'general',
          externalChannelId: 'S1',
          accountId: 'A1',
          hidden: false,
          externalPageCursor: null,
        },
      ];
      const threadCommunityInviteUrl =
        'https://foo.slack.com/thread/1#/archives/1234/p5678';
      const { getByText } = render(
        <Thread
          id="1"
          incrementId={1}
          channels={channels}
          channel={channels[0]}
          currentChannel={channels[0]}
          threadUrl="https://foo.slack.com/thread/1#/"
          threadCommunityInviteUrl={threadCommunityInviteUrl}
          threadId="1"
          communityInviteUrl="https://foo.slack.com/invite/1"
          communityUrl="https://foo.slack.com"
          externalThreadId="1588888888"
          settings={{
            brandColor: '#fff',
            homeUrl: 'https://foo.com',
            docsUrl: 'https://foo.com/docs',
            logoUrl: 'https://foo.com/logo.png',
            googleAnalyticsId: 'UA-123456789-1',
          }}
          communityName="Foo"
          isSubDomainRouting={false}
          viewCount={5}
          slug="/slug"
          channelId={channels[0].id}
          messages={[
            {
              id: '1',
              body: 'Hello',
              mentions: [],
            },
          ]}
          messageCount={1}
          authors={[]}
        />
      );
      const link = getByText('Join thread in Slack') as HTMLLinkElement;
      expect(link).toBeInTheDocument();
      expect(link.href).toEqual(threadCommunityInviteUrl);
    });
  });
});