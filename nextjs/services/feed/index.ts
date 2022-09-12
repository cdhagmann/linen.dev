import { GetServerSidePropsContext } from 'next';
import PermissionsService from 'services/permissions';
import CommunityService from 'services/community';
import ChannelsService from 'services/channels';
import { serialize as serializeSettings } from 'serializers/account/settings';
import { NotFound, RedirectTo } from 'utilities/response';

export async function feedGetServerSideProps(
  context: GetServerSidePropsContext,
  isSubDomainRouting: boolean
) {
  const permissions = await PermissionsService.for(context);
  if (!permissions.feed) {
    return RedirectTo('/signin');
  }
  const community = await CommunityService.find(context.params);
  if (!community) {
    return NotFound();
  }
  const channels = await ChannelsService.find(community.id);
  return {
    props: {
      communityName: context?.params?.communityName,
      isSubDomainRouting,
      settings: serializeSettings(community),
      channels,
      permissions,
    },
  };
}