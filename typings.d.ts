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

export interface RecordData {
  title: string;
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
