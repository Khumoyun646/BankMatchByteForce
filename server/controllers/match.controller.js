import { validateProfile, matchOffers } from '../lib/match.js';
import { httpError } from '../utils/http.js';
export function match(body) {
  const { profile, errors } = validateProfile(body);
  if (errors.length) throw httpError(400, errors.join('. '), errors);
  return matchOffers(profile);
}
