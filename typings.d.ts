export interface PodcastData {
  title: string;
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

export interface BookmarkPodcasts {
  title: string;
  creator: string;
  url: string;
  tags: string[];
}

export interface Records {
  id: string;
  fields: BookmarkPodcasts;
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

export interface RequestPayload {
  url: string;
  source: string;
  tags: string[];
}
