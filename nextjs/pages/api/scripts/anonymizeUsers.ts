import { NextApiRequest, NextApiResponse } from 'next';
import { anonymizeUsersFromAccount } from '../../../services/anonymize';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const accountId = request.query.account_id as string;
  await anonymizeUsersFromAccount(accountId);
  return response.status(200).json({});
}