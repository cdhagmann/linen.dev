import { createXMLSitemapForChannel } from '@/utilities/sitemap';
import { GetServerSideProps } from 'next/types';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  try {
    const { host } = req.headers;
    if (!host) {
      throw 'host missing';
    }
    const { channelName } = query;
    const sitemap = await createXMLSitemapForChannel(
      host,
      channelName as string
    );
    res.setHeader('Content-Type', 'application/xml');
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.write('Something went wrong');
    res.end();
  }
  return { props: {} };
};

// eslint-disable-next-line import/no-anonymous-default-export
export default () => null;