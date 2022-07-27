/* eslint-disable camelcase */
export interface BookmarkData {
  title: string;
  creator: string;
  url: string;
  tags: string[];
}

export interface ArticleData {
  title: string;
  author: string;
  site: string;
  url: string;
  tags: string[];
}

export type PageData = ArticleData | BookmarkData;

export interface RedditData {
  title: string;
  content: string;
  subreddit: string;
  url: string;
  tags: string[];
}

export interface StackExchangeData {
  title: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface TwitterData {
  tweet: string;
  user: string;
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

export interface YouTubeAPIEndpoint {
  endpoint: string;
  link: string;
}

export interface QuestionOwner {
  account_id: number;
  reputation: number;
  user_id: number;
  user_type: string;
  accept_rate: number;
  profile_image: string;
  display_name: string;
  link: string;
}

export interface QuestionItems {
  tags: string[];
  owner: QuestionOwner;
  is_answered: boolean;
  view_count: number;
  protected_date: number;
  accepted_answer_id: number;
  answer_count: number;
  community_owned_date: number;
  score: number;
  locked_date: number;
  last_activity_date: number;
  creation_date: number;
  last_edit_date: number;
  question_id: number;
  content_license: string;
  link: string;
  title: string;
}

export interface StackExchangeResponse {
  items: QuestionItems[];
  has_more: boolean;
  quota_max: number;
  quota_remaining: number;
}

export interface TwitterResponse {
  data: {
    author_id: string;
    created_at: string;
    text: string;
    id: string;
  };
  includes: {
    users: {
      verified: boolean;
      username: string;
      id: string;
      name: string;
    }[];
  };
}

export interface VimeoResponse {
  app: {
    name: string;
    uri: string;
  }[];
  categories: {
    icon: {
      active: boolean;
      base_link: string;
      default_picture: boolean;
      link: string;
      resource_key: string;
      sizes: {
        height: number;
        link: string;
        link_with_play_button: string;
        width: number;
      }[];
      type: string;
      uri: string;
    };
    is_deprecated: boolean;
    last_video_featured_time: string;
    link: string;
    metadata: {
      connections: {
        channels: {
          options: string[];
          total: number;
          uri: string;
        };
        groups: {
          options: string[];
          total: number;
          uri: string;
        };
        users: {
          options: string[];
          total: number;
          uri: string;
        };
        videos: {
          options: string[];
          total: number;
          uri: string;
        };
      };
      interactions: {
        follow: {
          added: boolean;
          added_time: string;
          uri: string;
        };
      };
    };
    name: string;
    parent: {
      link: string;
      name: string;
      uri: string;
    };
    pictures: {
      active: boolean;
      base_link: string;
      default_picture: boolean;
      link: string;
      resource_key: string;
      sizes: {
        height: number;
        link: string;
        link_with_play_button: string;
        width: number;
      }[];
      type: string;
      uri: string;
    };
    resource_key: string;
    subcategories: {
      link: string;
      name: string;
      uri: string;
    }[];
    top_level: boolean;
    uri: string;
  }[];
  content_rating: string[];
  content_rating_class: string;
  context: {
    action: string;
    resource: [];
    resource_type: string;
  };
  created_time: string;
  description: string;
  disabled_properties: {
    download: {
      enable_link: string;
      key_path: string;
      min_tier_for_capability: string;
      reasons: {
        icon: string;
        message: string;
      }[];
    };
    edit_privacy: {
      enable_link: string;
      key_path: string;
      min_tier_for_capability: string;
      reasons: {
        icon: string;
        message: string;
      }[];
    };
    embed: {
      enable_link: string;
      key_path: string;
      min_tier_for_capability: string;
      reasons: {
        icon: string;
        message: string;
      }[];
    };
    embed_presets: {
      enable_link: string;
      key_path: string;
      min_tier_for_capability: string;
      reasons: {
        icon: string;
        message: string;
      }[];
    };
  }[];
  duration: number;
  edit_session: {
    has_watermark: string;
    is_max_resolution: string;
    is_music_licensed: string;
    is_rated: boolean;
    min_tier_for_movie: string;
    result_video_hash: string;
    send_transcoding_complete_email: string;
    status: string;
    vsid: string;
  }[];
  embed: {
    buttons: {
      embed: boolean;
      fullscreen: boolean;
      hd: boolean;
      like: boolean;
      scaling: boolean;
      share: boolean;
      watchlater: boolean;
    };
    color: string;
    end_screen: { type: string };
    event_schedule: boolean;
    logos: {
      custom: {
        active: boolean;
        link: string;
        sticky: boolean;
        url: string;
      };
      vimeo: boolean;
    };
    playbar: boolean;
    speed: boolean;
    title: {
      name: string;
      owner: string;
      portrait: string;
    };
    uri: string;
    volume: boolean;
  }[];
  files: {
    created_time: string;
    expires: string;
    fps: number;
    height: number;
    link: string;
    log: {
      play: string;
    };
    md5: string;
    public_name: string;
    quality: string;
    size: number;
    size_short: string;
    source_link: string;
    type: string;
    video_file_id: number;
    width: number;
  };
  has_audio: string;
  height: number;
  is_free: boolean;
  is_playable: string;
  language: string;
  last_user_action_event_date: string;
  license: string;
  link: string;
  manage_link: string;
  metadata: {
    connections: {
      available_channels: {
        options: string[];
        total: number;
        uri: string;
      };
      comments: {
        options: string[];
        total: number;
        uri: string;
      };
      credits: {
        options: string[];
        total: number;
        uri: string;
      };
      likes: {
        options: string[];
        total: number;
        uri: string;
      };
      ondemand: {
        options: string[];
        resource_key: string;
        uri: string;
      };
      pictures: {
        options: string[];
        total: number;
        uri: string;
      };
      playback: {
        options: string[];
        uri: string;
      };
      recommendations: {
        options: string[];
        uri: string;
      };
      related: {
        options: string[];
        uri: string;
      };
      season: {
        name: string;
        options: string[];
        uri: string;
      };
      texttracks: {
        options: string[];
        total: number;
        uri: string;
      };
      trailer: {
        options: string[];
        resource_key: string;
        uri: string;
      };
      users_with_access: {
        options: string[];
        total: number;
        uri: string;
      };
      versions: {
        current_uri: string;
        options: string[];
        resource_key: string;
        total: number;
        uri: string;
      };
    };
    interactions: {
      album: {
        options: string[];
        uri: string;
      };
      buy: {
        currency: string;
        display_price: string;
        download: string;
        drm: boolean;
        link: string;
        price: number;
        purchase_time: string;
        stream: string;
        uri: string;
      };
      channel: {
        options: string[];
        uri: string;
      };
      delete: {
        options: string[];
        uri: string;
      };
      edit: {
        options: string[];
        uri: string;
      };
      edit_privacy: {
        content_rating: string[];
        options: string[];
        properties: {
          name: string;
          options: string[];
          required: string;
        }[];
        uri: string;
      };
      invite: {
        options: string[];
        uri: string;
      };
      like: {
        added: boolean;
        added_time: string;
        options: string[];
        uri: string;
      };
      rent: {
        currency: string;
        display_price: string;
        drm: boolean;
        expires_time: string;
        link: string;
        price: number;
        purchase_time: string;
        stream: string;
        uri: string;
      };
      report: {
        options: string[];
        reason: string[];
        uri: string;
      };
      set_content_rating: {
        content_rating: string[];
        options: string[];
        uri: string;
      };
      subscribe: {
        drm: boolean;
        expires_time: string;
        purchase_time: string;
        stream: string;
      };
      trim: {
        options: string[];
        uri: string;
      };
      view_team_members: {
        options: string[];
        uri: string;
      };
      watched: {
        added: boolean;
        added_time: string;
        options: string[];
        uri: string;
      };
      watchlater: {
        added: boolean;
        added_time: string;
        options: string[];
        uri: string;
      };
    };
    is_screen_record: boolean;
    is_vimeo_create: boolean;
    is_webinar: boolean;
    is_zoom_upload: boolean;
  };
  modified_time: string;
  name: string;
  parent_folder: {
    access_grant: {
      permission_policy: {
        created_on: string;
        modified_on: string;
        name: string;
        permission_actions: [];
        uri: string;
      }[];
    };
    created_time: string;
    is_pinned: boolean;
    is_private_to_user: boolean;
    last_user_action_event_date: string;
    link: string;
    metadata: {
      connections: {
        ancestor_path: [
          {
            name: string;
            uri: string;
          }
        ];
        folders: {
          options: string[];
          total: number;
          uri: string;
        };
        group_folder_grants: {
          options: string[];
          total: number;
          uri: string;
        };
        items: {
          options: string[];
          total: number;
          uri: string;
        };
        parent_folder: {
          options: string[];
          uri: string;
        };
        user_folder_access_grants: {
          folder_permission_policies: {
            name: string;
            uri: string;
          }[];
          options: string[];
          total: number;
          uri: string;
        };
        videos: {
          options: string[];
          total: number;
          uri: string;
        };
      };
      metadata: {
        interactions: {
          interactions: {
            add_subfolder: {
              can_add_subfolders: string;
              content_type: string;
              options: string[];
              properties: string[];
              subfolder_depth_limit_reached: string;
              uri: string;
            };
          };
        };
      };
    };
    modified_time: string;
    name: string;
    pinned_on: string;
    privacy: { view: string };
    resource_key: string;
    uri: string;
    user: {
      account: string;
      available_for_hire: boolean;
      bio: string;
      can_work_remotely: boolean;
      capabilities: [];
      clients: string;
      content_filter: [];
      created_time: string;
      gender: string;
      link: string;
      location: string;
      location_details: [
        {
          city: string;
          country: string;
          country_iso_code: string;
          formatted_address: string;
          latitude: number;
          longitude: number;
          neighborhood: string;
          state: string;
          state_iso_code: string;
          sub_locality: string;
        }
      ];
      metadata: {
        connections: {
          albums: {
            options: string[];
            total: number;
            uri: string;
          };
          appearances: {
            options: string[];
            total: number;
            uri: string;
          };
          block: {
            options: string[];
            total: number;
            uri: string;
          };
          categories: {
            options: string[];
            total: number;
            uri: string;
          };
          channels: {
            options: string[];
            total: number;
            uri: string;
          };
          connected_apps: {
            options: string[];
            total: number;
            uri: string;
          };
          feed: {
            options: string[];
            uri: string;
          };
          folders: {
            options: string[];
            total: number;
            uri: string;
          };
          folders_root: {
            options: string[];
            uri: string;
          };
          followers: {
            options: string[];
            total: number;
            uri: string;
          };
          following: {
            options: string[];
            total: number;
            uri: string;
          };
          groups: {
            options: string[];
            total: number;
            uri: string;
          };
          likes: {
            options: string[];
            total: number;
            uri: string;
          };
          moderated_channels: {
            options: string[];
            total: number;
            uri: string;
          };
          pictures: {
            options: string[];
            total: number;
            uri: string;
          };
          portfolios: {
            options: string[];
            total: number;
            uri: string;
          };
          recommended_channels: {
            options: string[];
            total: number;
            uri: string;
          };
          recommended_users: {
            options: string[];
            total: number;
            uri: string;
          };
          shared: {
            options: string[];
            total: number;
            uri: string;
          };
          videos: {
            options: string[];
            total: number;
            uri: string;
          };
          watched_videos: {
            options: string[];
            total: number;
            uri: string;
          };
          watchlater: {
            options: string[];
            total: number;
            uri: string;
          };
        };
        interactions: {
          add_privacy_user: {
            options: string[];
            uri: string;
          };
          block: {
            added: boolean;
            added_time: string;
            options: string[];
            uri: string;
          };
          connected_apps: {
            all_scopes: [];
            is_connected: boolean;
            needed_scopes: [];
            options: string[];
            uri: string;
          };
          follow: {
            added: boolean;
            options: string[];
            uri: string;
          };
          report: {
            options: string[];
            reason: string[];
            uri: string;
          };
        };
        public_videos: {
          total: number;
        };
      };
      name: string;
      pictures: [];
      preferences: {
        videos: {
          privacy: {
            password: string;
          };
        };
      };
      resource_key: string;
      short_bio: 'This is a short biography about me!';
      skills: {
        name: string;
        uri: string;
      };
      upload_quota: {
        lifetime: {
          free: number;
          max: number;
          used: number;
        };
        periodic: {
          free: number;
          max: number;
          reset_date: string;
          used: number;
        };
        space: {
          free: number;
          max: number;
          showing: string;
          used: number;
        };
      };
      uri: string;
      websites: {
        description: string;
        link: string;
        name: string;
        type: string;
        uri: string;
      }[];
    };
  }[];
  password: string;
  pictures: [];
  privacy: {
    add: boolean;
    comments: string;
    download: boolean;
    embed: string;
    view: string;
  };
  rating_mod_locked: string;
  release_time: string;
  resource_key: string;
  spatial: {
    director_timeline: {
      pitch: number;
      roll: number;
      time_code: number;
      yaw: number;
    }[];
    field_of_view: number;
    projection: string;
    stereo_format: string;
  };
  stats: { plays: number };
  status: string;
  tags: {
    canonical: string;
    metadata: {
      connections: {
        videos: {
          options: string[];
          total: number;
          uri: string;
        };
      };
    };
    name: string;
    resource_key: string;
    uri: string;
  }[];
  transcode: { status: string };
  type: string;
  upload: {
    approach: string;
    complete_uri: string;
    form: string;
    link: string;
    redirect_url: string;
    size: number;
    status: string;
    upload_link: string;
  };
  uploader: { pictures: string[] };
  uri: string;
  user: {
    account: string;
    available_for_hire: boolean;
    bio: string;
    can_work_remotely: boolean;
    capabilities: [];
    clients: string;
    content_filter: [];
    created_time: string;
    gender: string;
    link: string;
    location: string;
    location_details: {
      city: string;
      country: string;
      country_iso_code: string;
      formatted_address: string;
      latitude: number;
      longitude: number;
      neighborhood: string;
      state: string;
      state_iso_code: string;
      sub_locality: string;
    }[];
    metadata: {
      connections: {
        albums: {
          options: string[];
          total: number;
          uri: string;
        };
        appearances: {
          options: string[];
          total: number;
          uri: string;
        };
        block: {
          options: string[];
          total: number;
          uri: string;
        };
        categories: {
          options: string[];
          total: number;
          uri: string;
        };
        channels: {
          options: string[];
          total: number;
          uri: string;
        };
        connected_apps: {
          options: string[];
          total: number;
          uri: string;
        };
        feed: {
          options: string[];
          uri: string;
        };
        folders: {
          options: string[];
          total: number;
          uri: string;
        };
        folders_root: {
          options: string[];
          uri: string;
        };
        followers: {
          options: string[];
          total: number;
          uri: string;
        };
        following: {
          options: string[];
          total: number;
          uri: string;
        };
        groups: {
          options: string[];
          total: number;
          uri: string;
        };
        likes: {
          options: string[];
          total: number;
          uri: string;
        };
        moderated_channels: {
          options: string[];
          total: number;
          uri: string;
        };
        pictures: {
          options: string[];
          total: number;
          uri: string;
        };
        portfolios: {
          options: string[];
          total: number;
          uri: string;
        };
        recommended_channels: {
          options: string[];
          total: number;
          uri: string;
        };
        recommended_users: {
          options: string[];
          total: number;
          uri: string;
        };
        shared: {
          options: string[];
          total: number;
          uri: string;
        };
        videos: {
          options: string[];
          total: number;
          uri: string;
        };
        watched_videos: {
          options: string[];
          total: number;
          uri: string;
        };
        watchlater: {
          options: string[];
          total: number;
          uri: string;
        };
      };
      interactions: {
        add_privacy_user: {
          options: string[];
          uri: string;
        };
        block: {
          added: boolean;
          added_time: string;
          options: string[];
          uri: string;
        };
        connected_apps: {
          all_scopes: [];
          is_connected: boolean;
          needed_scopes: [];
          options: string[];
          uri: string;
        };
        follow: {
          added: boolean;
          options: string[];
          uri: string;
        };
        report: {
          options: string[];
          reason: string[];
          uri: string;
        };
      };
      public_videos: {
        total: number;
      };
    };
    name: string;
    pictures: [];
    preferences: {
      videos: {
        privacy: {
          password: string;
        };
      };
    };
    resource_key: string;
    short_bio: string;
    skills: {
      name: string;
      uri: string;
    }[];
    upload_quota: {
      lifetime: {
        free: number;
        max: number;
        used: number;
      };
      periodic: {
        free: number;
        max: number;
        reset_date: string;
        used: number;
      };
      space: {
        free: number;
        max: number;
        showing: string;
        used: number;
      };
    };
    uri: string;
    websites: {
      description: string;
      link: string;
      name: string;
      type: string;
      uri: string;
    }[];
  };
  vod: string[];
  width: number;
}

export interface YouTubeResponse {
  kind: string;
  etag: string;
  items: {
    kind: string;
    etag: string;
    id: string;
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: {
          url: string;
          width: number;
          height: number;
        };
        medium: {
          url: string;
          width: number;
          height: number;
        };
        high: {
          url: string;
          width: number;
          height: number;
        };
        standard: {
          url: string;
          width: number;
          height: number;
        };
        maxres: {
          url: string;
          width: number;
          height: number;
        };
      };
      channelTitle: string;
      tags: string[];
      categoryId: string;
      liveBroadcastContent: string;
      defaultLanguage: string;
      localized: {
        title: string;
        description: string;
      };
      defaultAudioLanguage: string;
    };
  }[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface RecordData {
  id: string;
  author?: string;
  answer?: string;
  title?: string;
  tweet?: string;
  content?: string;
  creator?: string;
  question?: string;
  site?: string;
  dead?: boolean;
  subreddit?: string;
  tags: string[];
  url: string;
  user?: string;
  archive?: string;
}

export interface RecordColumnAggregateCount {
  [key: string]: number;
}

export type CountColumn =
  | 'author'
  | 'creator'
  | 'site'
  | 'dead'
  | 'subreddit'
  | 'tags'
  | 'user';

export type TablesAggregate =
  | 'articles'
  | 'comics'
  | 'podcasts'
  | 'reddits'
  | 'tweets'
  | 'videos';

export type Tables =
  | 'Articles'
  | 'Comics'
  | 'Podcasts'
  | 'Reddits'
  | 'Tweets'
  | 'Videos';

export interface BookmarkingResponse {
  success: boolean;
  message: string;
  source: string;
}

export type Types = 'Count' | 'Tags' | 'Query' | 'Search' | 'Insert' | 'Update';

export interface RequestPayload {
  type: Types;
  table: Tables;
  tagList?: string;
  query?: string;
  column?: string;
  countColumn?: CountColumn;
  data?: PageData;
}

export interface HasuraInsertResp {
  data: {
    [key: string]: {
      id: string;
    };
  };
}

export interface HasuraMutationResp {
  [key: string]: {
    returning: {
      id: string;
    }[];
  };
}

export interface HasuraQueryResp {
  data: {
    [key: string]: RecordData[];
  };
}

export interface HasuraQueryAggregateResp {
  data: {
    [key: string]: {
      [key: string]: string | string[];
    }[];
  };
}

export interface HasuraQueryTagsResp {
  data: {
    meta_tags: { name: string }[];
  };
}

export interface HasuraErrors {
  errors: {
    extensions: {
      path: string;
      code: string;
    };
    message: string;
  }[];
}
