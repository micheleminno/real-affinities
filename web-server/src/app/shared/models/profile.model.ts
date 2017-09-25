import { Tweet } from './tweet.model';
import { Interest } from './interest.model';

export class Profile {

  constructor(
    id: string,
    tweets: Tweet[]
  ) { }

  id: string;
  tweets: Tweet[];
  screen_name: string;
  name: string;
  location: string;
  url: string;
  profile_image_url: string;
  verified: boolean;
  description: string;
  statuses_count: number;
  followers_count: number;
  friends_count: number;

  inTarget: boolean;
  status: string;
  origin: string;
  interests: Interest[]
}
