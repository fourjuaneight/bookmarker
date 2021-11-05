// deno-lint-ignore-file camelcase
export interface PodcastData {
  title: string;
  creator: string;
  url: string;
}

export interface RedditData {
  title: string;
  content: string;
  subreddit: string;
  url: string;
}

export interface TwitterData {
  tweet: string;
  creator: string;
  url: string;
}

export interface ParsingService {
  title: RegExp;
  creator: RegExp;
  url: RegExp;
  [key: string]: RegExp;
}

export interface ParsingPatterns {
  castro: ParsingService;
  overcast: ParsingService;
  title: RegExp[];
  [key: string]: ParsingService | RegExp[];
}

export interface TwitterResponse {
  data: {
    author_id: string;
    created_at: string;
    text: string;
    id: string;
  };
  includes: {
    users:
      {
        verified: boolean;
        username: string;
        id: string;
        name: string;
      }[];
  };
}

export interface RecordData {
  title?: string;
  tweet?: string;
  content?: string;
  creator?: string;
  subreddit?: string;
  url: string;
  tags: string[];
}

export interface Records {
  id: string;
  fields: RecordData;
  createdTime: string;
}

export interface AirtableResp {
  records: Records[];
}

export interface AirtableError {
  errors: {
    error: string;
    message: string;
  }[];
}

export interface BookmarkingResponse {
  success: boolean;
  message: string;
  source: string;
}

export interface RequestPayload {
  url: string;
  table: string;
  tags: string[];
}
