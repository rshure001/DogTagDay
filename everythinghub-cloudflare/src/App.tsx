import { useEffect, useState } from 'react';
import { api } from './api';
import {
  ArrowUpRight, Search, Globe2, ShieldCheck, X, ExternalLink,
  Image as ImageIcon, Newspaper, HeartHandshake, Sparkles, Compass,
  BriefcaseBusiness, MapPinned, PlaySquare, BookOpen, Menu, Layers3
} from 'lucide-react';

type Result = { title: string; url: string; snippet: string; source: string; publishedAt?: string; thumbnailUrl?: string; creator?: string };
type FeedStory = Result & { feedCategory: 'WORLD' | 'TECHNOLOGY' | 'BUSINESS' | 'SCIENCE' };
type ResourceItem = { title: string; category: string; description: string; url: string; source: string; access: 'FREE' | 'PUBLIC' };
type PeopleItem = { name: string; category: string; description: string; url: string; location: string; access: string };
type PlaceTopic = { label: string; query: string; description: string };
type ImageResult = { title: string; pageUrl: string; imageUrl: string; description: string };
type PlaceResult = { id: string; name: string; address: string; latitude: number; longitude: number; category: string; mapUrl: string };
type BusinessResult = { name: string; ticker: string; cik: string; category: string; source: string; url: string };
type BusinessResponse = { results?: BusinessResult[]; scope?: string };
type SearchResponse = { results?: Result[]; count?: number; providers?: string[]; unavailableProviders?: string[]; note?: string };
type IndexStatus = { crawler?: string; running?: boolean; schedule?: string; workers?: number; maxPagesPerWorkerPerRun?: number; maxPagesPerRun?: number; seedSites?: number; pagesIndexed?: number; pagesSkipped?: number; queuedPages?: number; lastCrawledAt?: string | null; lastError?: string | null; scope?: string };
type TrafficStatus = { windowMinutes?: number; totals?: { visits?: number; searches?: number; clicks?: number; crawlerRuns?: number; trackedEvents?: number }; averageTrackedEventsPerMinute?: number; crawler?: { pagesIndexed?: number; pagesSkipped?: number; queuedPages?: number; lastCrawledAt?: string | null; lastError?: string | null }; measurement?: string };
type ImageResponse = { results?: ImageResult[] };
type PlaceResponse = { results?: PlaceResult[] };
type AiResponse = { answer?: string; sources?: Array<{ title: string; url: string; source: string }>; providers?: string[]; unavailableProviders?: string[]; sourceCount?: number };
type Mode = 'web' | 'images' | 'news' | 'veterans' | 'ai' | 'business' | 'places' | 'media' | 'world';

const suggestions = ['The latest space discoveries', 'Best small business software', 'How solar energy works', 'World economic outlook'];

const PUBLIC_SEARCH_API = 'https://everythinghub-public-api.vercel.app';

type PublicSearchPayload = {
  results?: Array<{ title?: string; url?: string; snippet?: string }>;
};

type PublicImagePayload = {
  results?: Array<{ title?: string; pageUrl?: string; imageUrl?: string }>;
};

async function searchWithFreeFallback(query: string, vertical: Mode, limit = 10): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query, limit: String(limit), vertical });
  try {
    const response = await api.get('/api/search?' + params.toString());
    return response.data as SearchResponse;
  } catch {
    const fallbackParams = new URLSearchParams({ q: query });
    if (vertical === 'news') fallbackParams.set('mode', 'news');
    const response = await fetch(PUBLIC_SEARCH_API + '/api/search?' + fallbackParams.toString(), {
      headers: { Accept: 'application/json' },
    });
    const payload = await response.json() as PublicSearchPayload;
    if (!response.ok) throw new Error('Free public search is temporarily unavailable.');
    const results = (payload.results || [])
      .filter(item => item.title && item.url)
      .map(item => {
        let source = 'Public web source';
        try {
          source = new URL(item.url || '').hostname.replace(/^www\./i, '');
        } catch {
          // Keep the generic source label for an invalid URL.
        }
        return {
          title: item.title || '',
          url: item.url || '',
          snippet: item.snippet || '',
          source,
        };
      });
    return {
      results,
      count: results.length,
      providers: ['Bing RSS · free fallback'],
      unavailableProviders: [],
    };
  }
}

async function imagesWithFreeFallback(query: string): Promise<ImageResponse> {
  try {
    const response = await api.get('/api/images?q=' + encodeURIComponent(query));
    return response.data as ImageResponse;
  } catch {
    const response = await fetch(PUBLIC_SEARCH_API + '/api/images?q=' + encodeURIComponent(query), {
      headers: { Accept: 'application/json' },
    });
    const payload = await response.json() as PublicImagePayload;
    if (!response.ok) throw new Error('Free image search is temporarily unavailable.');
    return {
      results: (payload.results || [])
        .filter(item => item.title && item.pageUrl && item.imageUrl)
        .map(item => ({
          title: item.title || '',
          pageUrl: item.pageUrl || '',
          imageUrl: item.imageUrl || '',
          description: '',
        })),
    };
  }
}

const libraryItems = [
  { title: 'Project Gutenberg', category: 'Books', description: 'Free ebooks from a volunteer-supported digital library.', url: 'https://www.gutenberg.org/', source: 'Project Gutenberg' },
  { title: 'Internet Archive', category: 'Books', description: 'A nonprofit digital library of books, films, music and archived web pages.', url: 'https://archive.org/', source: 'Internet Archive' },
  { title: 'Library of Congress', category: 'Research', description: 'Explore digitized collections, photographs, maps, newspapers and primary sources.', url: 'https://www.loc.gov/', source: 'Library of Congress' },
  { title: 'NASA Science', category: 'Science', description: 'Research, missions, images and learning resources about Earth and space.', url: 'https://science.nasa.gov/', source: 'NASA' },
  { title: 'PubMed', category: 'Research', description: 'Search biomedical and life-sciences citations and abstracts.', url: 'https://pubmed.ncbi.nlm.nih.gov/', source: 'National Library of Medicine' },
  { title: 'Smithsonian Open Access', category: 'Images', description: 'Discover and reuse millions of digital collection items and images.', url: 'https://www.si.edu/openaccess', source: 'Smithsonian Institution' },
  { title: 'Khan Academy', category: 'Learning', description: 'Free lessons and practice across math, science, humanities and more.', url: 'https://www.khanacademy.org/', source: 'Khan Academy' },
  { title: 'MIT OpenCourseWare', category: 'Learning', description: 'Free course materials from thousands of MIT classes.', url: 'https://ocw.mit.edu/', source: 'MIT' },
  { title: 'USA.gov', category: 'Government', description: 'Official U.S. government information, services and agency directories.', url: 'https://www.usa.gov/', source: 'U.S. government' },
  { title: 'National Archives', category: 'Research', description: 'Search U.S. historical records, documents, photographs and government archives.', url: 'https://www.archives.gov/research', source: 'U.S. National Archives' },
  { title: 'Google Arts & Culture', category: 'Arts', description: 'Explore artworks, museums, cultural collections and virtual exhibitions.', url: 'https://artsandculture.google.com/', source: 'Google Arts & Culture' },
  { title: 'OpenStax', category: 'Books', description: 'Free, peer-reviewed, openly licensed textbooks for college and high school.', url: 'https://openstax.org/', source: 'Rice University' }
];
const resourceDirectory: ResourceItem[] = [
  { title: 'Grants.gov', category: 'Funding', description: 'Search federal grant opportunities and official application notices.', url: 'https://www.grants.gov/', source: 'U.S. federal government', access: 'PUBLIC' },
  { title: 'SAM.gov Assistance Listings', category: 'Funding', description: 'Find federal assistance programs and eligibility information.', url: 'https://sam.gov/content/assistance-listings', source: 'U.S. federal government', access: 'PUBLIC' },
  { title: 'Nevada 211', category: 'Nevada', description: 'Find community services and local assistance resources in Nevada.', url: 'https://www.nevada211.org/', source: 'Nevada 211', access: 'FREE' },
  { title: 'Nevada Grants Office', category: 'Nevada', description: 'State information about grant opportunities and administration.', url: 'https://grant.nv.gov/', source: 'State of Nevada', access: 'PUBLIC' },
  { title: 'SBA Funding Programs', category: 'Business', description: 'Explore small-business funding programs and eligibility guidance.', url: 'https://www.sba.gov/funding-programs', source: 'U.S. Small Business Administration', access: 'PUBLIC' },
  { title: 'VolunteerMatch', category: 'Volunteering', description: 'Discover volunteer opportunities with nonprofit organizations.', url: 'https://www.volunteermatch.org/', source: 'VolunteerMatch', access: 'FREE' },
  { title: 'Catchafire', category: 'Nonprofit Support', description: 'Find skills-based volunteer support for nonprofit projects.', url: 'https://www.catchafire.org/', source: 'Catchafire', access: 'FREE' },
  { title: 'TechSoup', category: 'Nonprofit Support', description: 'Explore technology offers and services for eligible nonprofits.', url: 'https://www.techsoup.org/', source: 'TechSoup', access: 'PUBLIC' },
  { title: 'Candid Foundation Directory', category: 'Funding', description: 'Research grantmakers and funding opportunities; some services require payment.', url: 'https://candid.org/', source: 'Candid', access: 'PUBLIC' },
  { title: 'USA.gov Benefits', category: 'Government', description: 'Find official government benefit programs and eligibility information.', url: 'https://www.usa.gov/benefits', source: 'U.S. government', access: 'PUBLIC' },
  { title: 'VA Grants', category: 'Veterans', description: 'Explore official VA grant programs, eligibility rules and application guidance for organizations.', url: 'https://department.va.gov/grants/', source: 'U.S. Department of Veterans Affairs', access: 'PUBLIC' },
  { title: 'Google for Nonprofits', category: 'Nonprofit Support', description: 'Review technology programs available to qualifying nonprofit organizations.', url: 'https://www.google.com/nonprofits/', source: 'Google', access: 'PUBLIC' },
];

const peopleDirectory: PeopleItem[] = [
  { name: 'United Way of Southern Nevada', category: 'Community', description: 'Connect with community initiatives, local support programs and volunteer opportunities.', url: 'https://uwsn.org/', location: 'Las Vegas · Southern Nevada', access: 'Public information' },
  { name: 'Three Square Food Bank', category: 'Community', description: 'Find food assistance programs and ways to volunteer in Southern Nevada.', url: 'https://threesquare.org/', location: 'Las Vegas · Southern Nevada', access: 'Public information' },
  { name: 'Nevada 211', category: 'Community', description: 'Find local health, human-service and community support providers.', url: 'https://www.nevada211.org/', location: 'Nevada', access: 'Free information and referrals' },
  { name: 'Las Vegas Rescue Mission', category: 'Community', description: 'Learn about local services, outreach and volunteer opportunities.', url: 'https://vegasrescue.org/', location: 'Las Vegas', access: 'Public information' },
  { name: 'Disabled American Veterans', category: 'Veterans', description: 'Connect with veteran service support and learn about volunteer transportation services.', url: 'https://www.dav.org/', location: 'Nationwide', access: 'Public information' },
  { name: 'Veterans of Foreign Wars', category: 'Veterans', description: 'Find local VFW posts, veteran community connections and service programs.', url: 'https://www.vfw.org/', location: 'Nationwide', access: 'Public information' },
  { name: 'The American Legion', category: 'Veterans', description: 'Locate posts and explore veteran, family and community programs.', url: 'https://www.legion.org/', location: 'Nationwide', access: 'Public information' },
  { name: 'VolunteerMatch', category: 'Volunteering', description: 'Search volunteer opportunities by cause and location.', url: 'https://www.volunteermatch.org/', location: 'Nationwide', access: 'Free opportunity search' },
  { name: 'AmeriCorps', category: 'Volunteering', description: 'Explore national service programs and community volunteer opportunities.', url: 'https://americorps.gov/', location: 'Nationwide', access: 'Public information' },
  { name: 'Team Rubicon', category: 'Volunteering', description: 'Learn about a veteran-led disaster response organization and volunteer pathways.', url: 'https://teamrubiconusa.org/', location: 'Nationwide', access: 'Public information' },
  { name: 'Points of Light', category: 'Volunteering', description: 'Discover civic engagement initiatives and volunteer opportunities.', url: 'https://www.pointsoflight.org/', location: 'Nationwide', access: 'Public information' },
  { name: 'National Council of Nonprofits', category: 'Organizations', description: 'Find nonprofit sector information and state association connections.', url: 'https://www.councilofnonprofits.org/', location: 'Nationwide', access: 'Public information' },
];

const placeTopics: PlaceTopic[] = [
  { label: 'Nearby places', query: 'places near me', description: 'Explore places and services around your current area' },
  { label: 'Restaurants & cafes', query: 'restaurants and cafes', description: 'Find places to eat and meet' },
  { label: 'Parks & outdoors', query: 'parks trails and outdoor recreation', description: 'Discover green spaces, trails and recreation' },
  { label: 'Museums & culture', query: 'museums galleries and cultural attractions', description: 'Explore art, history and local culture' },
  { label: 'Landmarks', query: 'famous landmarks and historic sites', description: 'Find notable places and points of interest' },
  { label: 'Events & venues', query: 'event venues and attractions', description: 'Discover venues and places to visit' },
];

const divisions = [
  { name: 'People', detail: 'Find people and communities', icon: Globe2, mode: 'world' as Mode, prompt: 'Find people and communities related to' },
  { name: 'Places', detail: 'Explore locations and destinations', icon: MapPinned, mode: 'places' as Mode, prompt: 'Places and maps for' },
  { name: 'Resources', detail: 'Tools, services and support', icon: BriefcaseBusiness, mode: 'web' as Mode, prompt: 'Find resources for' },
  { name: 'Knowledge', detail: 'Learn, research and understand', icon: BookOpen, mode: 'ai' as Mode, prompt: 'Research' },
  { name: 'News', detail: 'Current reporting and coverage', icon: Newspaper, mode: 'news' as Mode, prompt: 'Latest news about' },
  { name: 'Videos', detail: 'Watch and discover media', icon: PlaySquare, mode: 'media' as Mode, prompt: 'Videos and media about' },
  { name: 'Images', detail: 'Discover visual references', icon: ImageIcon, mode: 'images' as Mode, prompt: 'Images of' },
  { name: 'Solutions', detail: 'Find answers and practical help', icon: Sparkles, mode: 'ai' as Mode, prompt: 'Help me find a solution for' },
];

const divisionWorkspaces = [
  { name: 'People', intro: 'Discover the people, groups and organizations connected to your interests.', focus: ['Community groups and nonprofits', 'Veteran organizations and support', 'Volunteer networks'], actions: [{ label: 'Find community organizations', query: 'community organizations and nonprofits', mode: 'world' as Mode }, { label: 'Find veteran support', query: 'veteran support organizations and services', mode: 'world' as Mode }, { label: 'Find volunteer opportunities', query: 'volunteer opportunities', mode: 'world' as Mode }] },
  { name: 'Places', intro: 'Explore destinations, local places, landmarks and events.', focus: ['Destinations and attractions', 'Local businesses and landmarks', 'Events and things to do'], actions: [{ label: 'Explore places', query: 'interesting places and destinations', mode: 'places' as Mode }, { label: 'Find local events', query: 'upcoming local events', mode: 'places' as Mode }, { label: 'Discover attractions', query: 'local attractions and things to do', mode: 'places' as Mode }] },
  { name: 'Resources', intro: 'Find practical tools, free support, services and opportunities.', focus: ['Free grants and assistance', 'Businesses and service providers', 'Useful tools and public services'], actions: [{ label: 'Find free resources and grants', query: 'free grants and assistance resources', mode: 'web' as Mode }, { label: 'Find businesses and services', query: 'businesses and service providers', mode: 'business' as Mode }, { label: 'Explore tools and services', query: 'free useful tools and public services', mode: 'web' as Mode }] },
  { name: 'Knowledge', intro: 'Research a subject, learn a skill and explore trusted public collections.', focus: ['Research and reference', 'Free courses and learning', 'Books and public archives'], actions: [{ label: 'Research a topic', query: 'research and explain', mode: 'ai' as Mode }, { label: 'Find free courses', query: 'free online courses and lessons', mode: 'web' as Mode }, { label: 'Explore research collections', query: 'public research collections and archives', mode: 'web' as Mode }] },
  { name: 'News', intro: 'Follow current reporting and explore coverage from public news sources.', focus: ['Top headlines', 'Las Vegas and Nevada news', 'Veterans and military news'], actions: [{ label: 'Top headlines', query: 'top headlines today', mode: 'news' as Mode }, { label: 'Las Vegas news', query: 'Las Vegas Nevada local news', mode: 'news' as Mode }, { label: 'Veterans news', query: 'veterans military news', mode: 'news' as Mode }] },
  { name: 'Videos', intro: 'Find video, audio and visual explainers from public sources.', focus: ['Educational videos', 'Documentaries and interviews', 'Audio and podcasts'], actions: [{ label: 'Educational videos', query: 'educational videos', mode: 'media' as Mode }, { label: 'Documentaries', query: 'documentaries and interviews', mode: 'media' as Mode }, { label: 'Audio and podcasts', query: 'audio podcasts', mode: 'media' as Mode }] },
  { name: 'Images', intro: 'Explore photographs, illustrations and visual references.', focus: ['Historical photographs', 'Science and space imagery', 'Art and culture collections'], actions: [{ label: 'Historical photographs', query: 'historical photographs', mode: 'images' as Mode }, { label: 'Science and space images', query: 'science space astronomy', mode: 'images' as Mode }, { label: 'Art and culture', query: 'art and culture', mode: 'images' as Mode }] },
  { name: 'Solutions', intro: 'Turn a question or challenge into research and practical next steps.', focus: ['Understand the problem', 'Compare available options', 'Find practical assistance'], actions: [{ label: 'Research a problem', query: 'help me research a problem and possible causes', mode: 'ai' as Mode }, { label: 'Compare options', query: 'compare practical options for', mode: 'ai' as Mode }, { label: 'Find practical assistance', query: 'practical assistance and support resources', mode: 'web' as Mode }] },
];


type Holiday = { name: string; date: Date; theme: string };

function nthWeekday(year: number, month: number, weekday: number, nth: number) {
  const first = new Date(year, month, 1);
  return new Date(year, month, 1 + ((weekday - first.getDay() + 7) % 7) + (nth - 1) * 7);
}

function lastWeekday(year: number, month: number, weekday: number) {
  const last = new Date(year, month + 1, 0);
  return new Date(year, month + 1, -((last.getDay() - weekday + 7) % 7));
}

function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getHolidayStatus(now = new Date()) {
  const holidays: Holiday[] = [];
  for (const year of [now.getFullYear(), now.getFullYear() + 1]) {
    holidays.push(
      { name: "New Year's Day", date: new Date(year, 0, 1), theme: 'new-year' },
      { name: 'Martin Luther King Jr. Day', date: nthWeekday(year, 0, 1, 3), theme: 'mlk-day' },
      { name: "Presidents Day", date: nthWeekday(year, 1, 1, 3), theme: 'presidents-day' },
      { name: 'Easter', date: easterSunday(year), theme: 'easter' },
      { name: 'Memorial Day', date: lastWeekday(year, 4, 1), theme: 'memorial-day' },
      { name: 'Independence Day', date: new Date(year, 6, 4), theme: 'independence-day' },
      { name: 'Labor Day', date: nthWeekday(year, 8, 1, 1), theme: 'labor-day' },
      { name: 'Halloween', date: new Date(year, 9, 31), theme: 'halloween' },
      { name: 'Veterans Day', date: new Date(year, 10, 11), theme: 'veterans-day' },
      { name: 'Thanksgiving', date: nthWeekday(year, 10, 4, 4), theme: 'thanksgiving' },
      { name: 'Christmas', date: new Date(year, 11, 25), theme: 'christmas' }
    );
  }
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const current = holidays.find(item => item.date.getTime() === start.getTime());
  const next = holidays
    .filter(item => item.date.getTime() > start.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
  if (!next) return { next: null, days: 0, activeTheme: current?.theme || '' };
  const days = Math.round((next.date.getTime() - start.getTime()) / 86400000);
  const themeWindow = next.name === 'Halloween' ? 3 : next.name === 'Veterans Day' ? 10 : next.name === 'Christmas' ? 7 : 2;
  return {
    next,
    days,
    activeTheme: current?.theme || (days <= themeWindow ? next.theme : '')
  };
}

function youtubeVideoThumbnail(url: string): string {
  try {
    const parsed = new URL(url);
    const videoId = parsed.hostname.replace(/^www\./i, '') === 'youtu.be'
      ? parsed.pathname.slice(1).split('/')[0]
      : parsed.searchParams.get('v') || parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1] || '';
    return videoId ? 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg' : '';
  } catch {
    return '';
  }
}

function cleanFeedText(value: string): string {
  if (typeof DOMParser !== 'undefined') {
    const parsed = new DOMParser().parseFromString(value, 'text/html');
    return (parsed.body.textContent || '').replace(/\\s+/g, ' ').trim();
  }
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\\s+/g, ' ').trim();
}

function isUsefulHeadline(item: Result): boolean {
  const title = cleanFeedText(item.title || '').toLowerCase();
  const url = (item.url || '').toLowerCase();
  if (!title || title.length < 24) return false;
  const lowValuePatterns = [
    /dictionary|definition|meaning/i,
    /interactive learning platform/,
    /^major events of 20[0-9][0-9]/i,
    /^breaking news, latest news and videos/,
    /^google news - headlines/,
    /^fox news power rankings/,
    /^top hat[ |:-]/i,
  ];
  if (lowValuePatterns.some(pattern => pattern.test(title))) return false;
  if (url.includes('news.google.com/topics/') || url.includes('news.google.com/home')) return false;
  return true;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [businesses, setBusinesses] = useState<BusinessResult[]>([]);
  const [businessScope, setBusinessScope] = useState('');
  const [providers, setProviders] = useState<string[]>([]);
  const [providerIssues, setProviderIssues] = useState<string[]>([]);
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiSources, setAiSources] = useState<Array<{ title: string; url: string; source: string }>>([]);
  const [mode, setMode] = useState<Mode>('web');
  const [message, setMessage] = useState('Search the web. Find the answer, source, or place you need.');
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [activeWorkspaceName, setActiveWorkspaceName] = useState('');
  const [topStories, setTopStories] = useState<FeedStory[]>([]);
  const [topVideos, setTopVideos] = useState<Result[]>([]);
  const [feedFilter, setFeedFilter] = useState('ALL');
  const [destinationNewsFilter, setDestinationNewsFilter] = useState('ALL');
  const [storyImages, setStoryImages] = useState<Record<string, string>>({});
  const [resultImages, setResultImages] = useState<Record<string, string>>({});
  const [newsUpdatedAt, setNewsUpdatedAt] = useState('');
  const [newsStatus, setNewsStatus] = useState('Loading the latest headlines…');
  const [newsRefresh, setNewsRefresh] = useState(0);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [libraryCategory, setLibraryCategory] = useState('All');
  const [libraryPreview, setLibraryPreview] = useState<typeof libraryItems[number] | null>(null);
  const [resourceQuery, setResourceQuery] = useState('');
  const [resourceCategory, setResourceCategory] = useState('All');
  const [resourceAccess, setResourceAccess] = useState('All');
  const [peopleQuery, setPeopleQuery] = useState('');
  const [peopleCategory, setPeopleCategory] = useState('All');
  const [peopleScope, setPeopleScope] = useState('All');
  const [placeQuery, setPlaceQuery] = useState('');
  const [indexStatus, setIndexStatus] = useState<IndexStatus | null>(null);
  const [trafficStatus, setTrafficStatus] = useState<TrafficStatus | null>(null);
  const [systemStatusError, setSystemStatusError] = useState('');
  useEffect(() => {
    let active = true;
    const loadSystemPulse = async () => {
      try {
        const [indexResponse, trafficResponse] = await Promise.all([
          api.get('/api/index/status'),
          api.get('/api/insights/traffic?minutes=60'),
        ]);
        if (!active) return;
        setIndexStatus(indexResponse.data as IndexStatus);
        setTrafficStatus(trafficResponse.data as TrafficStatus);
        setSystemStatusError('');
      } catch {
        if (active) setSystemStatusError('Live system metrics are temporarily unavailable.');
      }
    };
    void loadSystemPulse();
    const interval = window.setInterval(() => void loadSystemPulse(), 60000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  useEffect(() => {
    void api.post('/api/insights/visit', {}).catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    const loadTopStories = async () => {
      try {
        const topics = [
          { query: 'top world headlines', category: 'WORLD' as const },
          { query: 'latest technology news', category: 'TECHNOLOGY' as const },
          { query: 'latest business news', category: 'BUSINESS' as const },
          { query: 'latest science and space news', category: 'SCIENCE' as const },
        ];
        const [topicResults, videoData] = await Promise.all([
          Promise.all(topics.map(topic => searchWithFreeFallback(topic.query, 'news', 4))),
          searchWithFreeFallback('latest news videos', 'media', 4),
        ]);
        if (!active) return;
        const seen = new Set<string>();
        const stories = topicResults.flatMap((data, index) =>
          (data.results || []).filter(item => isUsefulHeadline(item) && item.url && !seen.has(item.url) && Boolean(seen.add(item.url)))
            .map(item => ({ ...item, title: cleanFeedText(item.title), snippet: cleanFeedText(item.snippet), feedCategory: topics[index].category }))
        ).slice(0, 16);
        const videos = (videoData.results || [])
          .filter(item => item.title && item.url && /youtube\.com|youtu\.be|vimeo\.com/i.test(item.url))
          .slice(0, 4);
        setTopStories(stories);
        setTopVideos(videos);
        setNewsUpdatedAt(new Date().toISOString());
        setNewsStatus(stories.length || videos.length
          ? 'Live stories and videos from public sources'
          : 'No headlines returned right now.');
      } catch {
        if (active) setNewsStatus('Top news is temporarily unavailable. Refresh to try again.');
      }
    };
    void loadTopStories();
    const interval = window.setInterval(() => void loadTopStories(), 15 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [newsRefresh]);

  useEffect(() => {
    // Never guess an article thumbnail from a separate image search: that can attach an unrelated picture to a headline.
    setStoryImages({});
  }, [topStories, topVideos]);

  async function runSearch(event?: React.FormEvent<HTMLFormElement>, term = query, selectedMode = mode) {
    event?.preventDefault();
    const cleanQuery = term.trim();
    if (cleanQuery.length < 2) { setMessage('Enter at least two characters to search.'); return; }
    setQuery(cleanQuery);
    setSubmittedQuery(cleanQuery);
    setMode(selectedMode);
    setBusy(true);
    setSearched(true);
    setResults([]);
    setImages([]);
    setPlaces([]);
    setBusinesses([]);
    setBusinessScope('');
    setProviders([]);
    setProviderIssues([]);
    setAiAnswer('');
    setAiSources([]);
    setMessage(selectedMode === 'ai' ? 'EverythingHub AI is researching your question…' : selectedMode === 'images' ? 'Finding images from Wikimedia Commons…' : selectedMode === 'news' ? 'Finding current news coverage…' : selectedMode === 'business' ? 'Discovering companies, organizations and market information…' : selectedMode === 'places' ? 'Finding locations, destinations and local information…' : selectedMode === 'media' ? 'Finding video, audio and media sources…' : selectedMode === 'world' ? 'Searching global information sources…' : 'Searching public web sources…');
    try {
      if (selectedMode === 'ai') {
        const response = await api.post('/api/ai/answer', { question: cleanQuery });
        const data = response.data as AiResponse;
        setAiAnswer(data.answer || 'I could not prepare an answer. Please try again.');
        setAiSources(data.sources || []);
        setProviders(data.providers || []);
        setProviderIssues(data.unavailableProviders || []);
        setMessage((data.providers || []).length + ' of 3 research sources returned readable results · ' + (data.unavailableProviders || []).length + ' unavailable · ' + (data.sourceCount || (data.sources || []).length) + ' linked sources');
      } else if (selectedMode === 'business') {
        const [companyAttempt, webAttempt] = await Promise.allSettled([
          api.get('/api/businesses?q=' + encodeURIComponent(cleanQuery)),
          api.get('/api/search?' + new URLSearchParams({ q: cleanQuery, limit: '10', vertical: 'business' }).toString()),
        ]);
        const companyData = companyAttempt.status === 'fulfilled'
          ? companyAttempt.value.data as BusinessResponse
          : { results: [], scope: 'SEC company directory temporarily unavailable.' };
        const webData = webAttempt.status === 'fulfilled'
          ? webAttempt.value.data as SearchResponse
          : { results: [], providers: [], unavailableProviders: ['General web business search temporarily unavailable'] };
        const companyMatches = companyData.results || [];
        const webMatches = webData.results || [];
        setBusinesses(companyMatches);
        setResults(webMatches);
        setBusinessScope(companyData.scope || 'SEC reporting companies and listed tickers; not a complete business directory.');
        setProviders(webData.providers || []);
        setProviderIssues(webData.unavailableProviders || []);
        setMessage(
          companyMatches.length + ' SEC directory matches · ' +
          webMatches.length + ' broader business web results'
        );
        void api.post('/api/insights/search', { query: cleanQuery, resultCount: companyMatches.length + webMatches.length }).catch(() => undefined);
      } else if (selectedMode === 'places') {
        const response = await api.get('/api/places?q=' + encodeURIComponent(cleanQuery));
        const data = response.data as PlaceResponse;
        const found = data.results || [];
        setPlaces(found);
        setMessage(found.length ? found.length + ' real-world places found via OpenStreetMap' : 'No matching places found. Try a city, address, landmark or business name.');
        void api.post('/api/insights/search', { query: cleanQuery, resultCount: found.length }).catch(() => undefined);
      } else if (selectedMode === 'images') {
        const data = await imagesWithFreeFallback(cleanQuery);
        const found = data.results || [];
        setImages(found);
        setMessage(found.length ? found.length + ' images found across Wikimedia Commons and Openverse' : 'No matching images were found. Try a broader phrase.');
        setProviders((data as ImageResponse & { providers?: string[] }).providers || []);
        setProviderIssues((data as ImageResponse & { unavailableProviders?: string[] }).unavailableProviders || []);
        void api.post('/api/insights/search', { query: cleanQuery, resultCount: found.length }).catch(() => undefined);
      } else if (selectedMode === 'media') {
        let data: SearchResponse;
        try {
          const response = await api.get('/api/videos?q=' + encodeURIComponent(cleanQuery));
          data = response.data as SearchResponse;
        } catch {
          const response = await fetch(PUBLIC_SEARCH_API + '/api/videos?q=' + encodeURIComponent(cleanQuery), { headers: { Accept: 'application/json' } });
          const payload = await response.json() as SearchResponse;
          if (!response.ok) throw new Error('Free public video search is temporarily unavailable.');
          data = payload;
        }
        const found = data.results || [];
        setResults(found);
        setProviders(data.providers || []);
        setProviderIssues(data.unavailableProviders || []);
        setMessage(found.length ? found.length + ' relevant public video results found' : 'No sufficiently relevant videos found. Try a more specific or broader phrase.');
        void api.post('/api/insights/search', { query: cleanQuery, resultCount: found.length }).catch(() => undefined);
      } else {
        const data = await searchWithFreeFallback(cleanQuery, selectedMode, 25);
        const found = data.results || [];
        setResults(found);
        setProviders(data.providers || []);
        setProviderIssues(data.unavailableProviders || []);
        const providerSummary = (data.providers || []).length + ' free public sources responded';
        setMessage(found.length ? found.length + (selectedMode === 'news' ? ' news-focused results found · ' : ' results found · ') + providerSummary + (data.note ? ' · ' + data.note : '') : 'No readable results came back. Try a different phrase.');
        void api.post('/api/insights/search', { query: cleanQuery, resultCount: found.length }).catch(() => undefined);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Search is temporarily unavailable. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function chooseMode(next: Mode) {
    setMode(next);
    if (query.trim().length >= 2) void runSearch(undefined, query, next);
    else setMessage(next === 'images' ? 'Search images from Wikimedia Commons.' : next === 'news' ? 'Find news and current reporting across public sources.' : next === 'ai' ? 'Ask a question and review the sources behind the answer.' : 'Search the public web.');
  }

  function exploreDivision(item: typeof divisions[number]) {
    setMenuOpen(false);
    setResourceQuery('');
    setResourceCategory('All');
    setResourceAccess(item.name === 'Resources' ? 'Free only' : 'All resources');
    setPeopleQuery('');
    setPeopleCategory('All');
    setPlaceQuery('');
    setLibraryOpen(false);
    setSearched(false);
    setSelectedDivision(item.name);
    setActiveWorkspaceName(item.name);
    setMode(item.mode);
    setMessage(`${item.name} workspace opened. Choose a focus area or start a search.`);
    document.getElementById('hub-search')?.focus();
  }

  function resetSearch() {
    setActiveWorkspaceName('');
    setSelectedDivision('');
    setQuery('');
    setSubmittedQuery('');
    setResults([]);
    setImages([]);
    setPlaces([]);
    setBusinesses([]);
    setBusinessScope('');
    setProviders([]);
    setProviderIssues([]);
    setAiAnswer('');
    setAiSources([]);
    setSearched(false);
    setBusy(false);
    setMode('web');
    setMessage('Search the web. Find the answer, source, or place you need.');
  }

  const holidayStatus = getHolidayStatus();
  const activeWorkspace = divisionWorkspaces.find(item => item.name === activeWorkspaceName) || null;
  const destinationNewsStories = topStories.filter(story => destinationNewsFilter === 'ALL' || story.feedCategory === destinationNewsFilter);
  const feedItems = [
    ...topStories.map(story => ({ ...story, feedType: 'STORY' as const })),
    ...topVideos.map(story => ({ ...story, feedType: 'VIDEO' as const, feedCategory: 'VIDEO' })),
  ].filter(story => feedFilter === 'ALL' || story.feedCategory === feedFilter);

  return (
    <div className={holidayStatus.activeTheme ? `site-shell holiday-${holidayStatus.activeTheme}` : 'site-shell'}>
      <header className="topbar">
        <a className="brand" href="#" onClick={event => { event.preventDefault(); resetSearch(); }}>
          {false && (<img className="brand-goat" src="data:image/webp;base64,UklGRp4LAABXRUJQVlA4IJILAABwLQCdASpwAHAAPnUukkYkoqGhMvlcYJAOiWIAun/MTKfa+dnbf9jxTiH4Z+FP+lr/R76r6AHTCz6D479C/l/zR5ZfSfmL9ef5fml33/EnUR9f+cdBdcHd8eJ/xAOGHoEeLlok+tvYLThAsWJuuymnFL3FGJmNKuA108/J2KuXTDBV62Pe129IPaw+hNSa3147aS+RAl3GSqWx8yGeYd3jnfgR8H4vwBhz6m3olbTilgW23oYm/M6LnQHJAM3JTMxE4FMhOJyHL5Dd/Xgp0eZwNkTRCGWemd+ugEb6xcV/upi1n4grIJ7Rl68JOMle8+VztSHb0f9KyT+85WRWFann+/raOS7rkxJmHRE2lcqfcnClZ3L4B9+wEswt6079WqkjLFX+PTl57l3vXJypwZ9G8lK5Yx3D47uLLtyL+BM/7g1HmPmjg750lZuqBovjwlKc4C1cJTuWz5Vz/vWxi44kvOrSW8BNYSoXXM1JlZT3+xCM1AAA/voBe8h/i9coGy3+05Rs9QHXq39WEdbrt2MjmGc2fowKkDeJOsaWZ9jmqoxVd5YNdK6e6Ut+NFMye9PtPG//lJtLNJWdQnNiB8DRlWrQ7RBEN335dlGaEZtmEehn3tPVCJyy0HwokKTmb0/tlNasl/aq2n/4l9dsGkyKRR9/MLtOelOLd2vbaKm4DFX4NsDvyvNPsWj0P35Ud5ygWfFzhyj9WIneTutzvY1Y9k8P6XfV9+0fi3ZR9kSkSSouPMJij3h8hcT1vQVfDrsS7O7a24btWU5EtFReZlum/JF4cA9NhjawsqkB/f8/Ge7yOJexd+Wh8n8K9fiv4q4cYi500Ji31JbG9uG7kLjp25iwB43P49u3bQU/tp9aB8T672J39e3V+q6CbW82IttgDHF2wBonRtJkjFP2Vj50HmPfTx5a4f5tafz3nxkEKKitaAwOm/g4qCFCzC0A4O9VgVy3oUMlgFu4Seh74YrstqfUnXzvfAIN4sRznTPzqrqwFf4lIQ6YIeUsXw/afUVlhmbkfpoWzap+744p7Q002vINnrqa87Goum8BhuO2qBZjo9W4Bd99L66Tazb3lXCstvqId5toGGJAv7r0iGyrR6JEt/+1ZsX4qgvRTJN0TP2eqx8y4ViuZ5ArBCzGQVDnasI3m9kf7nQdYH9pLE5PHULhEw5Ape8irn4zXQWsTURSIwzPMLRlx4gSpdItn87RfkCz8CoIDTk6SZIQKcYgIJ5OSEd3au07bVm6zCOOCz1s+HkY1Y3UVz67+e8Ahw621GKwtKQkzHX4RmNlSjRu0IE8ZfpkHmUGG2rXb9yHFVfI6T28ONGnSKl3nfuC/o//wt22/I73K99p0HSay+xOW/4siYphBYN7t/vfyX3z2ua45+E6BAkfqMe5sirC/CtAebROAywCBo4q8FO6uUqtoF1yEOUTZkdZI6GCTufYRhsyA39HkwmjKEx7KhFpNDrPVgobShqrCTSQlyRKXb5dPjXcf2WaGc+uXesrpfYZ0jsd3M2fD17bZOV+HbPPa0SiHXfZxJ4mnHYJVawS6JwZYDomkvD54ZcOBEr+iHLOD1/IRzfZHkfMix095afi+4P9xa6PnEAn+vROwwMq2+5rHZSeuIfwprEYji3Ud/itDNmXQ+VR2U5CewBxKKaOQQMx+lI+zvJwU8JHkdIWXzPtsJ0PqrmLAtIZZAIlV6pnQAcPwGBXFERRO6bpu7du1YobN01aaWlltepVVTNgER4YQfnTxRNgIh1NOGvGhwExzT1hVwS3ThnNOktCp87OJprHsHuQX+R8LXckkKRTbVJ6bYvYDcf4SPEXK7G0OmMCQ3O5Vr4FyFTEU2OPh2w7wFW47mSmHLRDsw0SYqh9Zbu75ag+f15j7x6L8n1V6kR6ozpVmcNJ67ZflizT1QrdPkSyZLWcjx13CrTjPzt5w+RISCfUusBhO5D3Xp9L8oY8yonAME5ZYGObUoGAMaGzBldTgWK1v+P6eNmXrzFEAyEfsqd/s+AxrGwS4q+QrSV2qWc9tJr2mj7tA9rFsj8sM273AiP9N2UsZvxo3772dsH/OmM67T4ltHZKcHvXISqVvOPkrgbUza19gFGPIysl8cA1rdG5jS9nTD1+EUYH1Cwwovf5lypH9RcMcmui53af3+2999/4z7vSKirvNnojC2vYk8IjYMqm1zvlT4MrEqCZAqTgMf0YrCVzBp3tsJvVQTAAcFaNlG6OB0iBn7parZL2/sLvBY7vSacj6I6oo06qNArTi6bQUZQTo5Ugu9pYcAARH7Oz+HnomczA9HuD1R3mtK4M/RrQltcuzIIg3Zhays7mPUyPoqUHd3UJ4+vfquV++mzpEXkmbL+8ZFNMnfcQhoVaDUmQiyKwAKlDfuqY0nWh2PNr1QS6exTjMff4VZ8fP0wkhbBTHnVO0kUw9r5fMvP/PSIOd6zz2kNsRCJSX2d20AFCV1ibNOwusgKep6nvxa2CNtmhz73yyHiDychqjiXWd8werEaPmCQjrYbxC8W549L2z2V6Ok2La/O/EM6tEd4ArQVe/ay3VgChzIYdY0IO0dIk/wt7dM/jtIkeDNKrUL4R/8cMU92HRGycYM5YXQMYDts5hmsBG1F8qAV+Jc0IeNUYGhYJ01yA8yemuNiSlCljHrUMHiwVgnhRbkAuk2978RpJzvh4qHruc4JTmU83qo9S1A9fx4TXDH9z7CeK/1wApYm+V4XqIgrAwYS7NW5282v1HLBKKkgfR98+lXusOJ6hOHJbBIQSVIyFNDDgk/RTJUwwTdj+0KpHi9waCatUglQWbiXXl3V6nVMgX9HtpUOi8vi8W2mwoedGjNaYWwhV2rq/PVSfyOytIXGuSF5DTjFj092DeJ/XfY6DdbWtKeDyb1ek7Lt54obAm4F5BqavAv5Cfk87SijM0tIW0EEPHLfPOy2iKGfT6aEi67RBupX095meh5SwsVOS7tI3tbPFNHcCMdGTd7+ApVi9EHQjWDURUP3vB1DNfHbOKsyZOGcerDhJQJy0KZxsnoGMMvVckkFWEk2Rt9efPZfP9FWcbjouIgJ9xJwBoenmMRgRv8HwuNKMF2TwH17/GhDY92hpM4NYyOqhQ50hEGT8qM76Fz7bBKDnVi8s5oF5I/IKYWJuykinoOaEAN8UuFYPzX8yAb+0EI+I+0gzsSIFb3oLsHx383rcnr8hV8gr1igy3kzVK7j6lKJBdi09e9H1x68tiKBUwdcSHZAUl3CQ3nK5unPIGUAJOVc/M3JkaDaJd3PEQEZPNG88pu60yOxk4Aes3Tir3YjpSV9c4WpINVJxbFqk9/xtu0mxb/36zCTTSmVBl2+8qHjo5Bxgq+aDjtnq2vtivY/uwLn6URaAz2p1tOLLrp1gBzOEGYWF7tq7piYAjJ7BG2NnizMnFxzowbSYstckGg/7JjrsMVZ27RF5Qkex19yCFUUtspPT1bQe5BxMM9fz7FxWRI5cy1QXa92iTc0ob+HgY/uH1LYZr88foqzqK0RCZefhLne25AbZwqVuXsS8pjt1prsPi9g+vY1H0yUsG+2a1l26GBFrub8gGY6CetA1tmoyTYJ0nstUYDtcpGm1z5RyUSkHIt91w4201v+EsV0x0kFQIuQfoAJbqP2Yeo+cgDDMdTwNCfh7PaW1BxUljHGqn8/xSAk3pMQVb+9L8LWobouh3byaUl9Mrv8ojxFLiQ+OjpUkZ1kgk/5ByTcLY8PQa655TgT26evb4zvKattdAQed6KxyPcLsq3YqbmEyf9eYytp/pa2lE5DKnVZ19VtudNz6HhGo/Lp8TCaqT042begp2A570eXYY7xJKOq3jjnHwUExcawF4JkQJhxrr8uFwiHjkabdiilRLdfnULN7wM62yLoizDBEA0AmkxRLeof0MqxThzVa2jHXriLq7rwAAA" alt="Baby goat mascot with tiny green horn knobs" />)}
          <span className="brand-word">everything</span>
        </a>
        <nav className="desktop-nav" aria-label="Main divisions">
          <a href="#divisions" onClick={() => setLibraryOpen(false)}>Explore</a>
          <button className="nav-library" type="button" onClick={() => { setLibraryOpen(true); setSearched(false); }}>Library</button>
          <a href="#how-it-works" onClick={() => setLibraryOpen(false)}>About</a>
        </nav>
        <div className="topbar-right">
          <span className="availability"><i /> SEARCH ONLINE</span>
          {holidayStatus.activeTheme !== 'veterans-day' && <div className="holiday-meter" aria-label={holidayStatus.next ? `Next major holiday: ${holidayStatus.next.name}` : 'Holiday calendar'}>
            <span className="holiday-meter-label">NEXT HOLIDAY</span>
            <strong>{holidayStatus.next?.name || 'Calendar updating'}</strong>
            {holidayStatus.next && <span className="holiday-meter-count">{holidayStatus.days === 0 ? 'TODAY' : `IN ${holidayStatus.days} DAYS`}</span>}
          </div>}
          <button className="mobile-menu" type="button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={19}/></button>
        </div>
      </header>

      {menuOpen && <div className="mobile-nav"><a href="#divisions" onClick={() => { setMenuOpen(false); setLibraryOpen(false); }}>Explore divisions</a><button type="button" onClick={() => { setMenuOpen(false); setLibraryOpen(true); setSearched(false); }}>Library</button><a href="#how-it-works" onClick={() => { setMenuOpen(false); setLibraryOpen(false); }}>About EverythingHub</a></div>}

      <main className={searched ? 'main-content results-mode' : 'main-content'}>
        {activeWorkspaceName === 'Places' && !libraryOpen && !searched && (
          <section className="places-center" aria-labelledby="places-center-title">
            <div className="places-center-heading"><span className="section-kicker">THE PLACES EXPLORER</span><h2 id="places-center-title">Find somewhere worth discovering.</h2><p>Search real-world places, landmarks and local destinations. Choose a starting point below or enter any city, address or place name.</p></div>
            <form className="places-search" onSubmit={event => { event.preventDefault(); if (placeQuery.trim().length >= 2) { setActiveWorkspaceName(''); void runSearch(undefined, placeQuery.trim(), 'places'); } }}><MapPinned size={19}/><input aria-label="Search places and destinations" value={placeQuery} onChange={event => setPlaceQuery(event.target.value)} placeholder="City, landmark, address or place…"/><button type="submit" disabled={placeQuery.trim().length < 2}>Explore places <ArrowUpRight size={14}/></button></form>
            <div className="places-topic-grid">{placeTopics.map((topic,index) => <button type="button" className="places-topic-card" key={topic.label} onClick={() => { setPlaceQuery(topic.query); setActiveWorkspaceName(''); void runSearch(undefined, topic.query, 'places'); }}><span>0{index+1}</span><strong>{topic.label}</strong><small>{topic.description}</small><ArrowUpRight size={15}/></button>)}</div>
            <div className="places-source-note"><MapPinned size={16}/><span>Place results are sourced from OpenStreetMap. Addresses and map links are supplied where available; verify opening hours and details with each place.</span></div>
          </section>
        )}

        {activeWorkspaceName === 'People' && !libraryOpen && !searched && (
          <section className="people-center" aria-labelledby="people-center-title">
            <div className="people-center-heading"><span className="section-kicker">THE PEOPLE NETWORK</span><h2 id="people-center-title">Find your people. Find a way to help.</h2><p>Explore community organizations, veteran networks and volunteer pathways. Start with Southern Nevada, then discover nationwide connections.</p></div>
            <div className="people-search"><Search size={18}/><input aria-label="Search people and organizations" value={peopleQuery} onChange={event => setPeopleQuery(event.target.value)} placeholder="Search organizations, causes or locations…"/><span>{peopleDirectory.filter(item => (peopleScope === 'All' || (peopleScope === 'Las Vegas area' ? /Las Vegas|Southern Nevada/i.test(item.location) : peopleScope === 'Nevada' ? /Nevada/i.test(item.location) && !/Nationwide/i.test(item.location) : /Nationwide/i.test(item.location))) && (peopleCategory === 'All' || item.category === peopleCategory) && (item.name + ' ' + item.description + ' ' + item.location + ' ' + item.category).toLowerCase().includes(peopleQuery.toLowerCase())).length} connections</span></div>
            <div className="people-filters" aria-label="Geographic scope">{['All', 'Las Vegas area', 'Nevada', 'Nationwide'].map(scope => <button key={scope} type="button" className={peopleScope === scope ? 'selected' : ''} onClick={() => setPeopleScope(scope)}>{scope}</button>)}</div>
            <div className="people-filters">{['All', ...Array.from(new Set(peopleDirectory.map(item => item.category)))].map(category => <button key={category} type="button" className={peopleCategory === category ? 'selected' : ''} onClick={() => setPeopleCategory(category)}>{category}</button>)}</div>
            <div className="people-grid">{peopleDirectory.filter(item => (peopleScope === 'All' || (peopleScope === 'Las Vegas area' ? /Las Vegas|Southern Nevada/i.test(item.location) : peopleScope === 'Nevada' ? /Nevada/i.test(item.location) && !/Nationwide/i.test(item.location) : /Nationwide/i.test(item.location))) && (peopleCategory === 'All' || item.category === peopleCategory) && (item.name + ' ' + item.description + ' ' + item.location + ' ' + item.category).toLowerCase().includes(peopleQuery.toLowerCase())).map(item => <article className="people-card" key={item.name}><div className="people-card-meta"><span>{item.category}</span><span>{item.location}</span></div><h3>{item.name}</h3><p>{item.description}</p><small>{item.access}</small><a href={item.url} target="_blank" rel="noopener noreferrer">Visit organization <ExternalLink size={13}/></a></article>)}</div>
            <p className="people-disclaimer">These are discovery links, not endorsements or verified openings. Contact each organization directly to confirm current services, eligibility, local chapters and volunteer availability.</p>
          </section>
        )}

        {activeWorkspaceName === 'Knowledge' && !libraryOpen && !searched && (
          <section className="division-workspace division-destination-page" aria-labelledby="knowledge-destination-title">
            <div className="division-workspace-heading"><div><span className="section-kicker">THE KNOWLEDGE NETWORK</span><h1 id="knowledge-destination-title">Learn something. Understand more.</h1><p>Search across open learning, public archives, science collections and research sources.</p></div><button className="workspace-close" type="button" onClick={resetSearch}>Home <X size={16}/></button></div>
            <form className="search-form" onSubmit={event => { event.preventDefault(); void runSearch(undefined, query, 'ai'); }}>
              <Search size={19}/><input aria-label="Research a topic" value={query} onChange={event => setQuery(event.target.value)} placeholder="What do you want to understand?"/><button className="search-button" type="submit" disabled={busy || query.trim().length < 2}>Research <ArrowUpRight size={15}/></button>
            </form>
            <div className="workspace-focus-grid">{['Open books and textbooks','Research papers and archives','Science, space and history'].map((item,index)=><article className="workspace-focus-card" key={item}><span>0{index+1}</span><strong>{item}</strong></article>)}</div>
            <div className="workspace-actions"><strong>Browse the open library</strong><div className="workspace-action-list">{['Books','Research','Science','Learning'].map(category=><button type="button" key={category} onClick={()=>{setLibraryCategory(category);setLibraryQuery('');setLibraryOpen(true);setSearched(false);setActiveWorkspaceName('');}}>{category}<ArrowUpRight size={14}/></button>)}<button type="button" onClick={()=>{setLibraryCategory('All');setLibraryQuery('');setLibraryOpen(true);setSearched(false);setActiveWorkspaceName('');}}>Open full library <BookOpen size={14}/></button></div></div>
          </section>
        )}

        {['News', 'Videos', 'Images', 'Solutions'].includes(activeWorkspaceName) && activeWorkspace && !libraryOpen && !searched && (
          <section className="division-workspace division-destination-page" aria-labelledby="division-destination-title">
            <div className="division-workspace-heading">
              <div>
                <span className="section-kicker">EVERYTHINGHUB / {activeWorkspace.name.toUpperCase()}</span>
                <h1 id="division-destination-title">{activeWorkspace.name === 'News' ? 'The world, as it happens.' : activeWorkspace.name === 'Videos' ? 'Watch. Learn. Discover.' : activeWorkspace.name === 'Images' ? 'A visual world of ideas.' : 'Find a way forward.'}</h1>
                <p>{activeWorkspace.intro}</p>
              </div>
              <button className="workspace-close" type="button" onClick={resetSearch} aria-label="Return to EverythingHub home">Home <X size={16}/></button>
            </div>
            <form className="search-form workspace-search" onSubmit={event => {
              event.preventDefault();
              const destinationMode: Mode = activeWorkspace.name === 'News' ? 'news' : activeWorkspace.name === 'Videos' ? 'media' : activeWorkspace.name === 'Images' ? 'images' : 'ai';
              void runSearch(undefined, query, destinationMode);
            }}>
              <Search size={19}/>
              <input aria-label={'Search ' + activeWorkspace.name} value={query} onChange={event => setQuery(event.target.value)} placeholder={activeWorkspace.name === 'News' ? 'Search current events, topics or sources…' : activeWorkspace.name === 'Videos' ? 'What do you want to watch or learn?': activeWorkspace.name === 'Images' ? 'Find photographs, artwork or visual references…' : 'Describe the problem you want to solve…'}/>
              <button className="search-button" type="submit" disabled={busy || query.trim().length < 2}>{activeWorkspace.name === 'Solutions' ? 'Find answers' : activeWorkspace.name === 'News' ? 'Find news' : activeWorkspace.name === 'Videos' ? 'Find videos' : 'Find images'} <ArrowUpRight size={15}/></button>
            </form>
            <div className="workspace-focus-grid">
              {activeWorkspace.focus.map((focus, index) => (
                <article className="workspace-focus-card" key={focus}><span>0{index + 1}</span><strong>{focus}</strong></article>
              ))}
            </div>
            {activeWorkspace.name === 'News' && (
              <div className="destination-feature">
                <div className="library-section-head"><div><span className="section-kicker">LIVE DISCOVER FEED</span><h2>Headlines to explore</h2></div><span>{destinationNewsStories.length} stories shown · {topStories.length} loaded</span></div>
                <div className="destination-news-filters" role="group" aria-label="Filter news by topic">{['ALL', 'WORLD', 'TECHNOLOGY', 'BUSINESS', 'SCIENCE'].map(category => <button type="button" key={category} className={destinationNewsFilter === category ? 'active' : ''} aria-pressed={destinationNewsFilter === category} onClick={() => setDestinationNewsFilter(category)}>{category === 'ALL' ? 'All news' : category.charAt(0) + category.slice(1).toLowerCase()}</button>)}</div>
                {destinationNewsStories.length ? <div className="top-news-grid">{destinationNewsStories.slice(0, 6).map((story, index) => <a className="top-news-card" key={story.url + index} href={story.url} target="_blank" rel="noopener noreferrer">{story.thumbnailUrl && <img src={story.thumbnailUrl} alt="" loading="lazy" style={{ width: '100%', height: 148, objectFit: 'cover', borderRadius: 8 }} onError={event => { event.currentTarget.style.display = 'none'; }}/>}<span className="top-news-number">{story.feedCategory} · {String(index + 1).padStart(2, '0')}</span><strong>{story.title}</strong><span className="top-news-summary">{story.snippet}</span><span className="top-news-source">{story.source}</span></a>)}</div> : <p className="top-news-empty">The live feed is loading. Use a topic below to search public news sources.</p>}
              </div>
            )}
            {activeWorkspace.name === 'Videos' && (
              <div className="destination-feature"><div className="library-section-head"><div><span className="section-kicker">VIDEO DISCOVERY</span><h2>Watch and explore</h2></div><span>{topVideos.length} videos available</span></div>
                {topVideos.length ? <div className="top-news-grid">{topVideos.map((video, index) => <a className="top-news-card" key={video.url + index} href={video.url} target="_blank" rel="noopener noreferrer">{video.thumbnailUrl && <img src={video.thumbnailUrl} alt="" loading="lazy" style={{ width: '100%', height: 148, objectFit: 'cover', borderRadius: 8 }} onError={event => { event.currentTarget.style.display = 'none'; }}/>}<span className="top-news-number">FEATURED VIDEO · {String(index + 1).padStart(2, '0')}</span><strong>{video.title}</strong><span className="top-news-summary">{video.snippet || video.source}</span><span className="top-news-source">Open original video <ExternalLink size={12}/></span></a>)}</div> : <p className="top-news-empty">Choose a topic below to find videos from public sources.</p>}
              </div>
            )}
            <div className="workspace-actions"><strong>{activeWorkspace.name === 'Solutions' ? 'Start solving' : activeWorkspace.name === 'Images' ? 'Explore visual topics' : activeWorkspace.name === 'Videos' ? 'Find something to watch' : 'Explore news topics'}</strong>
              <div className="workspace-action-list">{activeWorkspace.actions.map(action => <button type="button" key={action.label} onClick={() => { setActiveWorkspaceName(''); void runSearch(undefined, action.query, action.mode); }}>{action.label}<ArrowUpRight size={14}/></button>)}</div>
            </div>
          </section>
        )}

        {activeWorkspaceName === 'Resources' && !libraryOpen && !searched && (
          <section className="resource-center" aria-labelledby="resource-center-title">
            <div className="resource-center-heading">
              <span className="section-kicker">THE RESOURCE DESK</span>
              <h2 id="resource-center-title">Find support. Find opportunity.</h2>
              <p>Free and public starting points for grants, nonprofit support, volunteering and practical services. This directory opens on resources marked FREE; public information pages may link to services with fees. Always confirm eligibility and deadlines with the provider.</p>
            </div>
            <div className="resource-search"><Search size={18}/><input aria-label="Search resources" value={resourceQuery} onChange={event => setResourceQuery(event.target.value)} placeholder="Search grants, volunteers, technology…"/><span>{resourceDirectory.filter(item => (resourceAccess === 'All resources' || (resourceAccess === 'Free only' ? item.access === 'FREE' : item.access === 'PUBLIC')) && (resourceCategory === 'All' || item.category === resourceCategory) && (item.title + ' ' + item.description + ' ' + item.category).toLowerCase().includes(resourceQuery.toLowerCase())).length} resources</span></div>
            <div className="resource-filters" aria-label="Access filter">{['All resources', 'Free only', 'Public info'].map(access => <button key={access} type="button" className={resourceAccess === access ? 'selected' : ''} onClick={() => setResourceAccess(access)}>{access}</button>)}</div>
            <div className="resource-filters">{['All', ...Array.from(new Set(resourceDirectory.map(item => item.category)))].map(category => <button key={category} type="button" className={resourceCategory === category ? 'selected' : ''} onClick={() => setResourceCategory(category)}>{category}</button>)}</div>
            <div className="resource-grid">{resourceDirectory.filter(item => (resourceAccess === 'All resources' || (resourceAccess === 'Free only' ? item.access === 'FREE' : item.access === 'PUBLIC')) && (resourceCategory === 'All' || item.category === resourceCategory) && (item.title + ' ' + item.description + ' ' + item.category).toLowerCase().includes(resourceQuery.toLowerCase())).map(item => <article className="resource-card" key={item.title}><div className="resource-card-top"><span>{item.category}</span><strong>{item.access === 'FREE' ? 'FREE' : 'PUBLIC INFO'}</strong></div><h3>{item.title}</h3><p>{item.description}</p><small>{item.source}</small><a href={item.url.trim()} target="_blank" rel="noopener noreferrer">Open official resource <ExternalLink size={13}/></a></article>)}</div>
            <p className="resource-disclaimer">Directory entries are starting points, not endorsements or guarantees of funding. Applications may have eligibility rules, deadlines or costs set by the provider.</p>
          </section>
        )}

        {libraryOpen && (
          <section className="library-page">
            <div className="library-topline"><button type="button" onClick={() => setLibraryOpen(false)}>← Back to EverythingHub</button><span>KNOWLEDGE · RESEARCH · DISCOVERY</span></div>
            <div className="library-masthead">
              <div className="library-heading"><span className="section-kicker">THE EVERYTHINGHUB LIBRARY</span><h1>A world of knowledge,<br/><em>within reach.</em></h1><p>Explore trusted collections, original research, books, public records and learning resources—all organized in one place.</p></div>
              <div className="library-masthead-mark"><BookOpen size={48}/><span>YOUR DISCOVERY<br/>STARTS HERE</span></div>
            </div>
            <div className="library-search"><Search size={20}/><input aria-label="Search the Library" value={libraryQuery} onChange={event => setLibraryQuery(event.target.value)} placeholder="What would you like to discover?" /><span>{libraryItems.filter(item => (libraryCategory === 'All' || item.category === libraryCategory) && (item.title + ' ' + item.description + ' ' + item.category).toLowerCase().includes(libraryQuery.toLowerCase())).length} of {libraryItems.length}</span></div>
            {!libraryQuery && libraryCategory === 'All' && <section className="library-collections"><div className="library-section-head"><div><span className="section-kicker">BROWSE BY INTEREST</span><h2>Explore the collections</h2></div><span>Curated starting points</span></div><div className="library-collection-grid">
              <button type="button" className="library-collection collection-books" onClick={() => setLibraryCategory('Books')}><span className="collection-index">01 / READ</span><BookOpen size={25}/><strong>Books & literature</strong><small>Digital books and open textbooks</small></button>
              <button type="button" className="library-collection collection-research" onClick={() => setLibraryCategory('Research')}><span className="collection-index">02 / INVESTIGATE</span><Globe2 size={25}/><strong>Research & archives</strong><small>Primary sources and scholarly records</small></button>
              <button type="button" className="library-collection collection-science" onClick={() => setLibraryCategory('Science')}><span className="collection-index">03 / DISCOVER</span><Compass size={25}/><strong>Science & discovery</strong><small>Earth, space and scientific knowledge</small></button>
              <button type="button" className="library-collection collection-learning" onClick={() => setLibraryCategory('Learning')}><span className="collection-index">04 / LEARN</span><Sparkles size={25}/><strong>Learning & courses</strong><small>Free lessons and course materials</small></button>
            </div></section>}
            <section className="library-directory"><div className="library-section-head"><div><span className="section-kicker">THE RESOURCE DIRECTORY</span><h2>{libraryQuery || libraryCategory !== 'All' ? 'Matching resources' : 'Explore trusted resources'}</h2></div><span>{libraryItems.filter(item => (libraryCategory === 'All' || item.category === libraryCategory) && (item.title + ' ' + item.description + ' ' + item.category).toLowerCase().includes(libraryQuery.toLowerCase())).length} resources listed</span></div>
              <div className="library-filters">{['All', ...Array.from(new Set(libraryItems.map(item => item.category)))].map(category => <button key={category} type="button" className={libraryCategory === category ? 'selected' : ''} onClick={() => setLibraryCategory(category)}>{category}</button>)}</div>
              <div className="library-grid">{libraryItems.filter(item => (libraryCategory === 'All' || item.category === libraryCategory) && (item.title + ' ' + item.description + ' ' + item.category).toLowerCase().includes(libraryQuery.toLowerCase())).map((item,index) => <article className="library-card" key={item.title}><div className={'library-card-art library-art-'+(index%4)}><span>{item.category.toUpperCase()}</span><BookOpen size={24}/></div><div className="library-card-body"><span className="library-source">{item.source}</span><h3>{item.title}</h3><p>{item.description}</p><button type="button" className="library-preview-trigger" onClick={() => setLibraryPreview(item)}>Preview resource <ArrowUpRight size={14}/></button></div></article>)}</div>
              {libraryItems.filter(item => (libraryCategory === 'All' || item.category === libraryCategory) && (item.title + ' ' + item.description + ' ' + item.category).toLowerCase().includes(libraryQuery.toLowerCase())).length === 0 && <div className="empty-state"><h3>No matching resources</h3><p>Try another search or choose All.</p></div>}
            </section>
            <div className="library-trust-note"><ShieldCheck size={18}/><span><strong>Go to the source.</strong> Each listing links to its original publisher. Access, licensing and availability are controlled by that organization.</span></div>
            {libraryPreview && <div className="library-preview-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setLibraryPreview(null); }}><section className="library-preview-panel" role="dialog" aria-modal="true" aria-labelledby="library-preview-title"><button className="library-preview-close" type="button" aria-label="Close preview" onClick={() => setLibraryPreview(null)}><X size={20}/></button><span className="section-kicker">EVERYTHINGHUB RESOURCE PREVIEW</span><div className="library-preview-icon"><BookOpen size={30}/></div><span className="library-card-category">{libraryPreview.category}</span><h2 id="library-preview-title">{libraryPreview.title}</h2><p>{libraryPreview.description}</p><div className="library-preview-meta"><span>PROVIDER</span><strong>{libraryPreview.source}</strong><span>ACCESS</span><strong>Opens at the original publisher</strong></div><p className="library-preview-note">This preview helps you decide whether this resource is relevant. The publisher controls its content, access, and any registration requirements.</p><a className="library-open-source" href={libraryPreview.url} target="_blank" rel="noopener noreferrer" onClick={() => setLibraryPreview(null)}>Continue to original resource <ExternalLink size={15}/></a></section></div>}
          </section>
        )}
        {!libraryOpen && !searched && (
          <section className="hero">
            <div className="hero-intro" style={{display:"none"}}>
              <h1>Everything<span>Hub</span></h1>
              <p className="hero-copy">Search the web, discover resources, explore places, and find what you need.</p>
            </div>
            <div className="everythinghub-approved-home-art">
<img className="hub-approved-neon-art" src="https://everythinghub-search-engine-4x25f8.v2.appdeploy.ai/resources/everythinghub-approved-octopus.png" alt="EverythingHub approved homepage artwork with eight labeled discovery sections, central search bar, and baby octopus" />
              <div className="home-baby-octopus" aria-label="Blinking baby octopus guide">
                <svg viewBox="0 0 180 150" role="img" aria-label="Baby octopus looks at you, then toward the search bar, and blinks">
                  <g className="baby-arms" fill="none" stroke="#a978df" strokeWidth="12" strokeLinecap="round">
                    <path className="baby-arm a1" d="M57 99 Q30 94 20 116 Q15 132 34 134"/><path className="baby-arm a2" d="M67 108 Q48 120 54 142"/><path className="baby-arm a3" d="M78 112 Q68 130 76 143"/><path className="baby-arm a4" d="M91 113 Q91 130 100 144"/><path className="baby-arm a5" d="M105 109 Q126 119 122 141"/><path className="baby-arm a6" d="M119 99 Q148 92 159 115 Q163 131 145 134"/><path className="baby-arm a7" d="M48 86 Q20 75 19 53"/><path className="baby-arm a8" d="M132 85 Q158 75 160 53"/>
                  </g>
                  <path d="M43 78 C34 48 48 15 87 12 C126 9 148 39 138 78 C132 101 115 111 90 112 C64 112 49 101 43 78Z" fill="#a978df" stroke="#59358d" strokeWidth="2"/>
                  <g className="baby-eyes"><ellipse cx="69" cy="70" rx="17" ry="20" fill="#fff8ef"/><ellipse cx="110" cy="70" rx="17" ry="20" fill="#fff8ef"/></g>
                  <g className="baby-pupils"><ellipse cx="72" cy="72" rx="9" ry="12" fill="#173d59"/><ellipse cx="107" cy="72" rx="9" ry="12" fill="#173d59"/><circle cx="75" cy="65" r="4.2" fill="#fff"/><circle cx="110" cy="65" r="4.2" fill="#fff"/></g>
                  <g className="baby-blink"><ellipse cx="69" cy="70" rx="17" ry="20" fill="#8750c7"/><ellipse cx="110" cy="70" rx="17" ry="20" fill="#8750c7"/></g>
                  <path className="baby-smile" d="M81 94 Q90 101 99 94" fill="none" stroke="#59358d" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              <form className="everythinghub-live-search homepage-live-search" role="search" onSubmit={event => runSearch(event)}>
                <Search className="everythinghub-search-icon" size={22} aria-hidden="true" />
                <input aria-label="Search EverythingHub" autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search anything on the web" />
                {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>×</button>}
                <button type="submit" aria-label="Search" disabled={busy}>{busy ? <span className="button-spinner" /> : <Search size={23} />}</button>
              </form>
              <svg className="hub-approved-neon-art" style={{display:"none"}} viewBox="0 0 1648 928" role="img" aria-label="Hidden vector fallback" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="hubNight" cx="50%" cy="42%" r="75%"><stop stopColor="#123c5b"/><stop offset="1" stopColor="#020a18"/></radialGradient>
                  <linearGradient id="hubNeon" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#73fff0"/><stop offset=".5" stopColor="#19c8c0"/><stop offset="1" stopColor="#1765a4"/></linearGradient>
                  <radialGradient id="hubGreen"><stop stopColor="#f2ffb1"/><stop offset=".5" stopColor="#83ff54"/><stop offset="1" stopColor="#16a879"/></radialGradient>
                  <filter id="hubGlowFx" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <rect width="1648" height="928" fill="url(#hubNight)"/>
                <g opacity=".18" fill="none" stroke="#4ab9d8"><path d="M0 160H1648M0 760H1648M180 0V928M1468 0V928"/><circle cx="824" cy="390" r="330"/><circle cx="824" cy="390" r="410"/></g>
                <text x="824" y="76" fill="#e7faff" textAnchor="middle" fontSize="35" fontWeight="800" letterSpacing="8">EVERYTHING HUB</text>
                <text x="824" y="119" fill="#9cefdc" textAnchor="middle" fontSize="19" fontWeight="700" letterSpacing="5">EVERYTHING WITHIN YOUR REACH</text>
                <g className="hub-art-tentacles" fill="none" stroke="url(#hubNeon)" strokeWidth="35" strokeLinecap="round" filter="url(#hubGlowFx)">
                  <path d="M720 385C600 340 545 260 420 230S270 210 185 245"/>
                  <path d="M700 420C555 415 500 390 385 395S260 410 165 455"/>
                  <path d="M715 455C595 520 530 600 420 650S285 690 190 675"/>
                  <path d="M755 485C675 610 620 690 520 760S395 790 300 825"/>
                  <path d="M928 385C1050 340 1105 260 1230 230S1380 210 1465 245"/>
                  <path d="M948 420C1093 415 1148 390 1263 395S1388 410 1483 455"/>
                  <path d="M933 455C1053 520 1118 600 1228 650S1363 690 1458 675"/>
                  <path d="M893 485C973 610 1028 690 1128 760S1253 790 1348 825"/>
                </g>
                <g fill="url(#hubGreen)" stroke="#d7ff9b" strokeWidth="4" filter="url(#hubGlowFx)">
                  <circle cx="185" cy="245" r="28"/><circle cx="165" cy="455" r="28"/><circle cx="190" cy="675" r="28"/><circle cx="300" cy="825" r="28"/>
                  <circle cx="1465" cy="245" r="28"/><circle cx="1483" cy="455" r="28"/><circle cx="1458" cy="675" r="28"/><circle cx="1348" cy="825" r="28"/>
                </g>
                <g fill="#e5fff0" fontSize="26" fontWeight="800" letterSpacing="2">
                  <text x="232" y="190">PEOPLE</text><text x="220" y="405">PLACES</text><text x="240" y="635">RESOURCES</text><text x="345" y="790">KNOWLEDGE</text>
                  <text x="1415" y="190" textAnchor="end">NEWS</text><text x="1405" y="405" textAnchor="end">VIDEOS</text><text x="1380" y="635" textAnchor="end">IMAGES</text><text x="1295" y="790" textAnchor="end">SOLUTIONS</text>
                </g>
                <g filter="url(#hubGlowFx)">
                  <path d="M824 170C700 170 660 260 675 365C685 470 735 515 824 530C913 515 963 470 973 365C988 260 948 170 824 170Z" fill="url(#hubNeon)" stroke="#b5fff5" strokeWidth="7"/>
                  <ellipse cx="770" cy="365" rx="28" ry="38" fill="#f5ffff"/><ellipse cx="878" cy="365" rx="28" ry="38" fill="#f5ffff"/>
                  <g className="hub-art-pupils" fill="#082d48"><ellipse cx="778" cy="370" rx="13" ry="20"/><ellipse cx="886" cy="370" rx="13" ry="20"/></g>
                  <g fill="#fff"><circle cx="783" cy="357" r="7"/><circle cx="891" cy="357" r="7"/></g>
                  <path d="M790 440Q824 464 858 440" fill="none" stroke="#07364a" strokeWidth="7" strokeLinecap="round"/>
                  <path d="M755 250Q824 190 893 250" fill="none" stroke="#d5fff1" strokeWidth="8" opacity=".65"/>
                </g>
                <g fill="url(#hubGreen)" stroke="#d9ffad" strokeWidth="4" filter="url(#hubGlowFx)"><ellipse cx="824" cy="235" rx="70" ry="34"/></g>
                <path d="M770 235q18-28 36 0t36 0t36 0" fill="none" stroke="#f3ffd2" strokeWidth="6" strokeLinecap="round"/>
                <g transform="translate(1320 650)">
                  <g fill="none" stroke="#ae8bff" strokeWidth="19" strokeLinecap="round" className="hub-baby-arms">
                    <path d="M-48 35Q-100 5 -112 65"/><path d="M-30 55Q-68 95 -54 125"/><path d="M-10 62Q-25 105 -4 130"/><path d="M15 62Q35 105 55 126"/><path d="M35 50Q82 82 94 115"/><path d="M50 28Q110 8 120 54"/>
                  </g>
                  <path d="M-67 20C-80 -30 -48 -80 0 -82C52 -82 82 -34 67 20C56 58 35 74 0 76C-35 74 -56 58 -67 20Z" fill="#a98bff" stroke="#dfd2ff" strokeWidth="5"/>
                  <ellipse cx="0" cy="-60" rx="29" ry="15" fill="url(#hubGreen)" stroke="#d9ffad" strokeWidth="3"/>
                  <g className="hub-baby-eyes"><ellipse cx="-25" cy="5" rx="16" ry="21" fill="#fff"/><ellipse cx="25" cy="5" rx="16" ry="21" fill="#fff"/></g>
                  <g className="hub-baby-pupils" fill="#183d66"><ellipse cx="-21" cy="8" rx="8" ry="12"/><ellipse cx="29" cy="8" rx="8" ry="12"/></g>
                  <g className="hub-baby-blink" fill="#8a6bd4"><ellipse cx="-25" cy="5" rx="16" ry="21"/><ellipse cx="25" cy="5" rx="16" ry="21"/></g>
                  <path d="M-12 42Q0 51 12 42" fill="none" stroke="#523b9b" strokeWidth="4" strokeLinecap="round"/>
                </g>
                <text x="1320" y="790" fill="#e8ddff" textAnchor="middle" fontSize="22" fontWeight="700">LITTLE HUB GUIDE</text>
              </svg>
              <form className="everythinghub-live-search" onSubmit={event => runSearch(event)}>
                <input
                  id="hub-search"
                  aria-label="Search EverythingHub"
                  autoComplete="off"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search anything on the web"
                />
                {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>×</button>}
                <button type="submit" aria-label="Search" disabled={busy}>
                  {busy ? <span className="button-spinner" /> : <Search size={23} />}
                </button>
              </form>
              <nav className="hub-hero-divisions" aria-label="Explore the eight EverythingHub divisions">
                {divisions.map(division => (
                  <button key={division.name} type="button" aria-label={division.name} onClick={() => exploreDivision(division)}>
                    <span>{division.name}</span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="approved-everythinghub-banner vector-octopus-banner home-art-shell retired-embedded-search-art" style={{display:"none"}}><img src="https://everythinghub-search-engine-4x25f8.v2.appdeploy.ai/resources/everythinghub-approved-octopus.png" alt="Everything Hub interactive octopus home screen" style={{display:"block",width:"100%",height:"auto"}}/><div className="home-art-hotspots" aria-label="Explore EverythingHub categories"><button type="button" aria-label="News" onClick={() => exploreDivision(divisions[4])}/><button type="button" aria-label="Learning" onClick={() => exploreDivision(divisions[3])}/><button type="button" aria-label="Business" onClick={() => exploreDivision(divisions[2])}/><button type="button" aria-label="Shopping" onClick={() => exploreDivision(divisions[6])}/><button type="button" aria-label="Health" onClick={() => exploreDivision(divisions[7])}/><button type="button" aria-label="Travel" onClick={() => exploreDivision(divisions[1])}/><button type="button" aria-label="Entertainment" onClick={() => exploreDivision(divisions[5])}/><button type="button" aria-label="People and Services" onClick={() => exploreDivision(divisions[0])}/></div>{false && <div className="home-art-search-row"><div className="home-baby-octopus" aria-label="Baby octopus guide"><svg viewBox="0 0 180 150" role="img" aria-label="Purple baby octopus blinking and looking between you and the search field"><g className="baby-arms" fill="none" stroke="#a978df" strokeWidth="12" strokeLinecap="round"><path className="baby-arm a1" d="M57 99 Q30 94 20 116 Q15 132 34 134"/><path className="baby-arm a2" d="M67 108 Q48 120 54 142"/><path className="baby-arm a3" d="M78 112 Q68 130 76 143"/><path className="baby-arm a4" d="M91 113 Q91 130 100 144"/><path className="baby-arm a5" d="M105 109 Q126 119 122 141"/><path className="baby-arm a6" d="M119 99 Q148 92 159 115 Q163 131 145 134"/><path className="baby-arm a7" d="M48 86 Q20 75 19 53"/><path className="baby-arm a8" d="M132 85 Q158 75 160 53"/></g><path d="M43 78 C34 48 48 15 87 12 C126 9 148 39 138 78 C132 101 115 111 90 112 C64 112 49 101 43 78Z" fill="#a978df" stroke="#59358d" strokeWidth="2"/><path d="M54 47 Q65 20 91 20 Q119 20 130 49" fill="none" stroke="#fff3e5" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round"/><g className="baby-eyes"><ellipse cx="69" cy="70" rx="17" ry="20" fill="#fff8ef"/><ellipse cx="110" cy="70" rx="17" ry="20" fill="#fff8ef"/></g><g className="baby-pupils"><ellipse cx="72" cy="72" rx="9" ry="12" fill="#173d59"/><ellipse cx="107" cy="72" rx="9" ry="12" fill="#173d59"/><circle cx="75" cy="65" r="4.2" fill="#fff"/><circle cx="110" cy="65" r="4.2" fill="#fff"/></g><g className="baby-blink"><ellipse cx="69" cy="70" rx="17" ry="20" fill="#8750c7"/><ellipse cx="110" cy="70" rx="17" ry="20" fill="#8750c7"/></g><path d="M81 94 Q90 101 99 94" fill="none" stroke="#59358d" strokeWidth="3" strokeLinecap="round"/></svg></div><form className="home-art-search" onSubmit={event => runSearch(event)}><input id="hub-search" aria-label="Search EverythingHub" autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search"/>{query && <button className="clear-button" type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={16}/></button>}<button type="submit" aria-label="Search" disabled={busy}>{busy ? <span className="button-spinner"/> : <Search size={22}/>}</button></form></div>}<svg style={{display:"none"}} viewBox="0 0 1100 560" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <radialGradient id="hubSea" cx="50%" cy="42%" r="70%"><stop offset="0" stopColor="#153d70"/><stop offset=".65" stopColor="#071b3b"/><stop offset="1" stopColor="#020b20"/></radialGradient>
                  <linearGradient id="hubSkin" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c4a2ff"/><stop offset=".5" stopColor="#7355d9"/><stop offset="1" stopColor="#273f9e"/></linearGradient>
                  <radialGradient id="hubBrain"><stop stopColor="#d7ff8a"/><stop offset=".55" stopColor="#75e85d"/><stop offset="1" stopColor="#168c75"/></radialGradient>
                  <filter id="hubGlow"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <rect width="1100" height="560" rx="28" fill="url(#hubSea)"/>
                <g fill="none" stroke="#3b9de9" strokeWidth="2" opacity=".25"><path d="M40 80H1060M40 480H1060M180 25V535M920 25V535"/><circle cx="550" cy="265" r="220"/><circle cx="550" cy="265" r="270"/></g>
                <g fill="none" stroke="url(#hubSkin)" strokeWidth="42" strokeLinecap="round" filter="url(#hubGlow)">
                  <path d="M450 305C350 350 330 450 220 430S130 370 95 390"/><path d="M460 325C390 420 420 485 350 510S280 490 255 520"/>
                  <path d="M490 340C470 430 520 470 490 520"/><path d="M530 350C550 430 620 460 610 520"/>
                  <path d="M650 330C740 405 700 485 790 500S860 470 900 505"/><path d="M680 300C800 330 820 430 930 420S980 370 1030 385"/>
                  <path d="M430 245C320 205 300 120 205 115S150 145 115 115"/><path d="M675 245C785 205 800 120 900 115S970 150 1005 115"/>
                </g>
                <g fill="url(#hubBrain)" stroke="#c7ff91" strokeWidth="2" filter="url(#hubGlow)">
                  <circle cx="95" cy="390" r="17"/><circle cx="255" cy="520" r="17"/><circle cx="490" cy="520" r="17"/><circle cx="610" cy="520" r="17"/><circle cx="900" cy="505" r="17"/><circle cx="1030" cy="385" r="17"/><circle cx="115" cy="115" r="17"/><circle cx="1005" cy="115" r="17"/>
                  <path d="M550 78C455 78 405 145 410 238C414 305 462 340 550 352C638 340 686 305 690 238C695 145 645 78 550 78Z" fill="url(#hubSkin)" stroke="#d8c7ff" strokeWidth="5"/>
                </g>
                <g fill="#07152c" stroke="#e8f5ff" strokeWidth="5"><ellipse cx="510" cy="270" rx="15" ry="21"/><ellipse cx="590" cy="270" rx="15" ry="21"/></g><g fill="#ffffff"><circle cx="514" cy="263" r="5"/><circle cx="594" cy="263" r="5"/></g><path d="M525 310Q550 326 575 310" fill="none" stroke="#efffe0" strokeWidth="5" strokeLinecap="round"/><ellipse cx="550" cy="177" rx="77" ry="47" fill="url(#hubBrain)" stroke="#d7ff9a" strokeWidth="3" filter="url(#hubGlow)"/><g fill="none" stroke="#eaffc7" strokeWidth="5" opacity=".8"><path d="M470 180q20-38 40 0t40 0t40 0"/><path d="M470 225q20-38 40 0t40 0t40 0"/><path d="M485 270q18-30 36 0t36 0t36 0"/></g>
                <g fill="#d7f5ff" opacity=".9"><circle cx="150" cy="245" r="4"/><circle cx="935" cy="250" r="5"/><circle cx="280" cy="65" r="3"/><circle cx="820" cy="65" r="4"/><circle cx="760" cy="470" r="3"/></g>
                <text x="550" y="42" textAnchor="middle" fill="#f4f7ff" fontSize="32" fontWeight="800" letterSpacing="5">EVERYTHING HUB</text>
                <text x="550" y="430" textAnchor="middle" fill="#baff83" fontSize="27" fontWeight="700" letterSpacing="2">EVERYTHING WITHIN YOUR REACH</text>
                <text x="550" y="466" textAnchor="middle" fill="#d8e8ff" fontSize="15" letterSpacing="4">ONE CENTRAL BRAIN · EIGHT SPECIALIZED DISCOVERY ARMS</text>
              </svg>
            </div>
            {/* Approved octopus brain-network artwork with eight clickable discovery arms. */}
            {activeWorkspace && (
              <section className="division-workspace" aria-labelledby="division-workspace-title">
                <div className="division-workspace-heading">
                  <div><span className="section-kicker">YOUR {activeWorkspace.name.toUpperCase()} WORKSPACE</span><h2 id="division-workspace-title">Explore {activeWorkspace.name}</h2><p>{activeWorkspace.intro}</p></div>
                  <button className="workspace-close" type="button" onClick={() => { setActiveWorkspaceName(''); setSelectedDivision(''); }} aria-label="Close workspace"><X size={18}/></button>
                </div>
                <div className="workspace-focus-grid">{activeWorkspace.focus.map((focus, index) => <article className="workspace-focus-card" key={focus}><span>0{index + 1}</span><strong>{focus}</strong></article>)}</div>
                <div className="workspace-actions"><strong>Start exploring</strong><div className="workspace-action-list">{activeWorkspace.actions.map(action => <button type="button" key={action.label} onClick={() => { setActiveWorkspaceName(''); void runSearch(undefined, action.query, action.mode); }}>{action.label}<ArrowUpRight size={14}/></button>)}{activeWorkspace.name === 'Knowledge' && <button type="button" onClick={() => { setActiveWorkspaceName(''); setLibraryOpen(true); setSearched(false); }}>Open searchable Library <BookOpen size={14}/></button>}</div></div>
              </section>
            )}
            <div className="octopus-stage interactive-octopus-stage" style={{display:"none"}}>
              <img className="network-octopus-art" src="https://everythinghub-search-engine-4x25f8.v2.appdeploy.ai/resources/everythinghub-approved-octopus.png" alt="EverythingHub approved octopus brain-network artwork" />
              <svg className="brain-network-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="One prominent central brain with eight subtle neural centers at the roots of the octopus arms">
                <defs>
                  <filter id="brainGlow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="1.1" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <g id="smallBrain">
                    <path d="M-4.5 .1 C-5.8-1.2-5.1-3.1-3.7-3.6 C-3.5-5.1-1.8-5.7-.5-4.8 C.7-6 2.5-5.2 2.6-3.9 C4.5-4 5.4-2.2 4.3-.9 C5.5 .5 4.4 2.3 2.8 2.2 C2.2 4-0 4.6-1.1 3.2 C-2.8 4.1-4.5 2.8-4.1 1.5 C-5.1 1.2-5.2 .5-4.5 .1Z" fill="#b879a8" stroke="#f2c66f" strokeWidth=".58"/>
                    <path d="M-.2-4.8 C-1.4-4.1-.3-3.1-1.2-2.4 M1.8-4.2 C.7-3.4 2.1-2.7 1.2-1.8 M-3.8-2.9 C-2.6-2.4-3.5-1.5-2.4-.9 M-.4-2.2 C.5-1.4-.8-.8-.1 .1 M3.4-2.8 C2.4-2 3.6-1.1 2.5-.5 M-3.8 .1 C-2.5 .2-3.1 1.1-2 1.7 M-.8 .7 C.3 1.1-.8 2.1 .1 2.8 M2 .4 C1 1.2 2.4 1.8 1.6 2.6 M-.3-4.1 C.2-3.3-.1-2.8 .5-2.2" fill="none" stroke="#512b62" strokeWidth=".48" strokeLinecap="round"/>
                    <path d="M0-4.8 C-.5-3.1 .6-2.5 0-1.2 C-.5 .2 .5 1.2 0 3.3" fill="none" stroke="#f8dfaa" strokeWidth=".38" strokeLinecap="round"/>
                  </g>
                </defs>
                <g className="central-brain" transform="translate(54 23) scale(2.55)" filter="url(#brainGlow)">
                  <path d="M-4.5 .1 C-5.8-1.2-5.1-3.1-3.7-3.6 C-3.5-5.1-1.8-5.7-.5-4.8 C.7-6 2.5-5.2 2.6-3.9 C4.5-4 5.4-2.2 4.3-.9 C5.5 .5 4.4 2.3 2.8 2.2 C2.2 4-0 4.6-1.1 3.2 C-2.8 4.1-4.5 2.8-4.1 1.5 C-5.1 1.2-5.2 .5-4.5 .1Z" fill="#b879a8" stroke="#f2c66f" strokeWidth=".58"/>
                  <path d="M-.2-4.8 C-1.4-4.1-.3-3.1-1.2-2.4 M1.8-4.2 C.7-3.4 2.1-2.7 1.2-1.8 M-3.8-2.9 C-2.6-2.4-3.5-1.5-2.4-.9 M-.4-2.2 C.5-1.4-.8-.8-.1 .1 M3.4-2.8 C2.4-2 3.6-1.1 2.5-.5 M-3.8 .1 C-2.5 .2-3.1 1.1-2 1.7 M-.8 .7 C.3 1.1-.8 2.1 .1 2.8 M2 .4 C1 1.2 2.4 1.8 1.6 2.6 M-.3-4.1 C.2-3.3-.1-2.8 .5-2.2" fill="none" stroke="#512b62" strokeWidth=".48" strokeLinecap="round"/>
                  <path d="M0-4.8 C-.5-3.1 .6-2.5 0-1.2 C-.5 .2 .5 1.2 0 3.3" fill="none" stroke="#f8dfaa" strokeWidth=".38" strokeLinecap="round"/>
                </g>
                <g className="arm-brains" filter="url(#brainGlow)">
                  <use href="#smallBrain" transform="translate(43 29) scale(.66)"/>
                  <use href="#smallBrain" transform="translate(39 36) scale(.66)"/>
                  <use href="#smallBrain" transform="translate(40 47) scale(.66)"/>
                  <use href="#smallBrain" transform="translate(46 56) scale(.66)"/>
                  <use href="#smallBrain" transform="translate(62 56) scale(.66)"/>
                  <use href="#smallBrain" transform="translate(68 47) scale(.66)"/>
                  <use href="#smallBrain" transform="translate(69 36) scale(.66)"/>
                  <use href="#smallBrain" transform="translate(65 29) scale(.66)"/>
                </g>
              </svg>
              <div className="tentacle-hotspots" aria-label="Explore the eight discovery arms">
                {divisions.map((item,index) => <button key={item.name} type="button" className={`tentacle-hotspot tentacle-hotspot-${index+1}`} onClick={() => exploreDivision(item)} aria-label={`Explore ${item.name}`}><span>{item.name}</span></button>)}
              </div>
            </div>
            <form className="search-form home-search-form" onSubmit={event => runSearch(event)}>
              <Search className="search-icon" size={20} strokeWidth={1.8} />
              <input id="hub-search" aria-label="Search EverythingHub" autoComplete="off" value={query}
                onChange={event => setQuery(event.target.value)} placeholder={selectedDivision ? `Search ${selectedDivision}…` : 'Search anything…'} />
              {query && <button className="clear-button" type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={16}/></button>}
              <button className="search-button" type="submit" disabled={busy}>{busy ? <span className="button-spinner" /> : <>Search <ArrowUpRight size={16}/></>}</button>
            </form>
            <div className="search-row search-row-with-mascot" style={{display:"none"}}><div className="baby-octopus" aria-label="Baby octopus guide">
                <svg viewBox="0 0 180 150" role="img" aria-label="A cute purple baby octopus with eight gently moving arms, blinking and glancing toward the search field">
                  <defs>
                    <radialGradient id="babyMantle" cx="34%" cy="18%" r="82%">
                      <stop offset="0" stopColor="#f7eaff"/><stop offset=".28" stopColor="#c99af5"/><stop offset=".68" stopColor="#8750c7"/><stop offset="1" stopColor="#48266f"/>
                    </radialGradient>
                    <linearGradient id="babyArm" x1="0" y1="0" x2=".2" y2="1">
                      <stop offset="0" stopColor="#e7c8ff"/><stop offset=".48" stopColor="#a978df"/><stop offset="1" stopColor="#59358d"/>
                    </linearGradient>
                    <radialGradient id="babyEye" cx="38%" cy="28%" r="72%">
                      <stop offset="0" stopColor="#5b9ab5"/><stop offset=".38" stopColor="#173d59"/><stop offset=".78" stopColor="#071827"/><stop offset="1" stopColor="#020912"/>
                    </radialGradient>
                    <filter id="babySoftShadow" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="2.2"/></filter>
                  </defs>
                  <g className="baby-arms" fill="none" stroke="url(#babyArm)" strokeWidth="12" strokeLinecap="round">
                    <path className="baby-arm a1" d="M57 99 Q37 94 24 104 Q11 115 18 128 Q24 138 36 132"/>
                    <path className="baby-arm a2" d="M67 108 Q49 117 47 133 Q47 143 58 145"/>
                    <path className="baby-arm a3" d="M78 112 Q68 128 75 143"/>
                    <path className="baby-arm a4" d="M91 113 Q91 130 100 144"/>
                    <path className="baby-arm a5" d="M105 109 Q125 118 127 135 Q127 145 116 146"/>
                    <path className="baby-arm a6" d="M119 99 Q144 93 157 108 Q167 120 157 132 Q150 139 141 131"/>
                    <path className="baby-arm a7" d="M48 86 Q25 78 17 62 Q11 49 20 43"/>
                    <path className="baby-arm a8" d="M132 85 Q153 76 160 59 Q165 47 155 40"/>
                  </g>
                  <g fill="#ffd1ad" stroke="#b95a43" strokeWidth="1.2" opacity=".95">
                    <circle cx="20" cy="115" r="3.1"/><circle cx="25" cy="128" r="2.8"/><circle cx="48" cy="132" r="2.7"/>
                    <circle cx="57" cy="140" r="2.6"/><circle cx="74" cy="137" r="2.7"/><circle cx="99" cy="137" r="2.7"/>
                    <circle cx="126" cy="135" r="2.8"/><circle cx="154" cy="119" r="3"/><circle cx="159" cy="107" r="2.8"/>
                    <circle cx="18" cy="59" r="2.8"/><circle cx="22" cy="47" r="2.6"/><circle cx="158" cy="56" r="2.8"/>
                  </g>
                  <ellipse cx="90" cy="110" rx="48" ry="8" fill="#160e12" opacity=".25" filter="url(#babySoftShadow)"/>
                  <path d="M43 78 C34 48 48 15 87 12 C126 9 148 39 138 78 C132 101 115 111 90 112 C64 112 49 101 43 78Z" fill="url(#babyMantle)" stroke="#a64c36" strokeWidth="1.8"/>
                  <path d="M54 47 Q65 20 91 20 Q119 20 130 49" fill="none" stroke="#fff3e5" strokeOpacity=".62" strokeWidth="4.5" strokeLinecap="round"/>
                  <g fill="#ffd9bd" opacity=".58">
                    <circle cx="57" cy="37" r="2"/><circle cx="70" cy="26" r="1.7"/><circle cx="112" cy="28" r="2"/><circle cx="126" cy="43" r="1.8"/>
                    <circle cx="47" cy="67" r="1.7"/><circle cx="132" cy="68" r="1.8"/><circle cx="60" cy="91" r="1.6"/><circle cx="119" cy="91" r="1.7"/>
                  </g>
                  <g className="baby-eyes">
                    <ellipse cx="69" cy="70" rx="17" ry="20" fill="#fff8ef"/>
                    <ellipse cx="110" cy="70" rx="17" ry="20" fill="#fff8ef"/>
                  </g>
                  <g className="baby-blink">
                    <ellipse cx="69" cy="70" rx="17" ry="20" fill="#9b65d0"/>
                    <ellipse cx="110" cy="70" rx="17" ry="20" fill="#9b65d0"/>
                  </g>
                  <g className="baby-pupils">
                    <ellipse cx="72" cy="72" rx="9" ry="12" fill="url(#babyEye)"/>
                    <ellipse cx="107" cy="72" rx="9" ry="12" fill="url(#babyEye)"/>
                    <circle cx="75" cy="65" r="4.2" fill="#fff"/><circle cx="110" cy="65" r="4.2" fill="#fff"/>
                    <circle cx="68" cy="77" r="1.7" fill="#9fd8ed"/><circle cx="103" cy="77" r="1.7" fill="#9fd8ed"/>
                  </g>
                  <path className="baby-smile" d="M81 94 Q90 101 99 94" fill="none" stroke="#743529" strokeWidth="2.8" strokeLinecap="round"/>
                  <ellipse cx="52" cy="88" rx="7" ry="4" fill="#f39a88" opacity=".62"/><ellipse cx="127" cy="88" rx="7" ry="4" fill="#f39a88" opacity=".62"/>
                </svg>
                <span className="baby-caption">Your AI guide</span>
              </div>

            </div>
          </section>
        )}

        {!libraryOpen && !searched && (
          <section className="top-news" aria-label="Latest news headlines">

            <div className="top-news-heading">
              <div>
                <span className="top-news-kicker"><span className="top-news-live-dot" /> LIVE NEWS</span>
                <h2>Top Stories</h2>
                <p>{newsStatus}{newsUpdatedAt ? ' · Updated ' + new Date(newsUpdatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}</p>
              </div>
              <button className="top-news-refresh" type="button" onClick={() => setNewsRefresh(value => value + 1)} aria-label="Refresh top news">
                <Compass size={14} /> Refresh
              </button>
            </div>
            <div className="discover-filters" role="group" aria-label="Filter Discover feed">
              {[['ALL','For you'],['WORLD','World'],['TECHNOLOGY','Technology'],['BUSINESS','Business'],['SCIENCE','Science'],['VIDEO','Videos']].map(([value,label]) => (
                <button key={value} type="button" className={feedFilter === value ? 'selected' : ''} onClick={() => setFeedFilter(value)}>{label}</button>
              ))}
            </div>
            {topStories.length > 0 || topVideos.length > 0 ? (
              <div className="discover-feed">
                {feedItems.map((story, index) => {
                  const thumbnail = story.thumbnailUrl || youtubeVideoThumbnail(story.url) || '';
                  const published = story.publishedAt && Number.isFinite(Date.parse(story.publishedAt))
                    ? new Date(story.publishedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                    : '';
                  return (
                    <article className="discover-card" key={story.url + index}>
                      {thumbnail && <a className="discover-media" href={story.url} target="_blank" rel="noopener noreferrer"
                        aria-label={(story.feedType === 'VIDEO' ? 'Watch: ' : 'Read: ') + story.title}
                        onClick={() => { void api.post('/api/insights/click', { query: 'top headlines', domain: story.source }).catch(() => undefined); }}>
                        <img src={thumbnail} alt={story.title} loading="lazy" onError={event => event.currentTarget.closest('.discover-media')?.remove()} />
                        {story.feedType === 'VIDEO' && <span className="discover-video-label"><PlaySquare size={15}/> WATCH VIDEO</span>}
                      </a>}
                      <div className="discover-story-body">
                        <span className="discover-story-type">{story.feedType === 'VIDEO' ? 'WATCH' : story.feedCategory + ' · TOP STORY'}</span>
                        <h3><a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a></h3>
                        {story.snippet && <p>{story.snippet}</p>}
                        <div className="discover-story-meta">
                          <span>{story.source}</span>
                          {published && <time>{published}</time>}
                          <a href={story.url} target="_blank" rel="noopener noreferrer">Open story <ExternalLink size={12}/></a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="top-news-empty">Stories and videos will appear here when public sources respond.</div>
            )}
          </section>
        )}

        {!libraryOpen && searched && (
        <div className="results-search-row">
          <form className="search-form" onSubmit={event => runSearch(event)}>
            <svg className="search-octopus" viewBox="0 0 120 92" role="img" aria-label="Baby octopus mascot">
              <defs>
                <linearGradient id="resultsOctopusHead" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e0d8ff"/><stop offset="1" stopColor="#806be8"/></linearGradient>
                <linearGradient id="resultsOctopusArm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9aaff"/><stop offset="1" stopColor="#6855d0"/></linearGradient>
              </defs>
              <g fill="none" stroke="url(#resultsOctopusArm)" strokeWidth="11" strokeLinecap="round">
                <path d="M27 57 Q10 53 11 69 Q12 81 23 79"/><path d="M39 66 Q27 78 35 86"/><path d="M51 69 Q45 84 55 87"/><path d="M69 69 Q75 84 65 87"/><path d="M81 66 Q93 78 85 86"/><path d="M93 57 Q110 53 109 69 Q108 81 97 79"/>
              </g>
              <path d="M20 49 C18 26 33 8 60 8 C87 8 102 26 100 49 C98 69 83 75 60 75 C37 75 22 69 20 49Z" fill="url(#resultsOctopusHead)" stroke="#5746b8" strokeWidth="2.8"/>
              <ellipse cx="43" cy="44" rx="10" ry="13" fill="#fff"/><ellipse cx="77" cy="44" rx="10" ry="13" fill="#fff"/>
              <g className="search-octopus-eyes"><ellipse cx="44" cy="45" rx="5" ry="8" fill="#142b45"/><ellipse cx="76" cy="45" rx="5" ry="8" fill="#142b45"/><circle cx="46" cy="41" r="2.6" fill="#fff"/><circle cx="78" cy="41" r="2.6" fill="#fff"/></g>
              <path d="M53 59 Q60 66 67 59" fill="none" stroke="#473b98" strokeWidth="2.8" strokeLinecap="round"/>
              <circle cx="30" cy="57" r="4.5" fill="#ef9cbe"/><circle cx="90" cy="57" r="4.5" fill="#ef9cbe"/>
            </svg>
            <Search className="search-icon" size={22} strokeWidth={1.8}/>
            <input aria-label="Search EverythingHub" autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search anything…"/>
            {query && <button className="clear-button" type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={16}/></button>}
            <button className="search-button" type="submit" disabled={busy}>{busy ? <span className="button-spinner"/> : <>Search <ArrowUpRight size={16}/></>}</button>
          </form>
        </div>
      )}

      <nav className="search-tabs" aria-label="Search type">
          <button className={mode === 'web' ? 'search-tab active' : 'search-tab'} onClick={() => chooseMode('web')} type="button"><Globe2 size={15}/> All</button>
          <button className={mode === 'images' ? 'search-tab active' : 'search-tab'} onClick={() => chooseMode('images')} type="button"><ImageIcon size={15}/> Images</button>
          <button className={mode === 'media' ? 'search-tab active' : 'search-tab'} onClick={() => chooseMode('media')} type="button"><PlaySquare size={15}/> Videos</button>
          <button className={mode === 'news' ? 'search-tab active' : 'search-tab'} onClick={() => chooseMode('news')} type="button"><Newspaper size={15}/> News</button>
          <button className={mode === 'ai' ? 'search-tab active' : 'search-tab'} onClick={() => chooseMode('ai')} type="button"><Sparkles size={15}/> Ask AI</button>
          <button className={mode === 'veterans' ? 'search-tab active' : 'search-tab'} onClick={() => chooseMode('veterans')} type="button"><HeartHandshake size={15}/> Veterans</button>
        </nav>

        {!searched && (
          <>
            <section className="suggestions">
              <span className="suggestion-label">START WITH SOMETHING</span>
              <div className="suggestion-list">
                {suggestions.map(item => <button key={item} type="button" onClick={() => runSearch(undefined, item)}>{item}<ArrowUpRight size={12}/></button>)}
              </div>
            </section>

            <section className="division-section" id="divisions">
              <div className="section-heading">
                <div><span className="section-kicker">THE PLATFORM</span><h2>Explore EverythingHub</h2></div>
                <span className="section-aside">A growing world of discovery</span>
              </div>
              <div className="division-grid">
                {divisions.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button className="division-card" key={item.name} type="button" onClick={() => exploreDivision(item)}>
                      <span className="division-icon"><Icon size={19}/></span>
                      <span className="division-copy"><strong>{item.name}</strong>
                        <small className="division-arm">ARM {String(index + 1).padStart(2, '0')} · CONNECTED</small><small>{item.detail}</small></span>
                      <ArrowUpRight className="division-arrow" size={15}/>
                    </button>
                  );
                })}
              </div>
              <div className="platform-note"><Layers3 size={16}/><span>One connected destination. New capabilities will be added in stages.</span></div>
            </section>

              <section className="ecosystem-section" id="ecosystem">
                <div className="section-heading">
                  <div><span className="section-kicker">THE BIGGER PICTURE</span><h2>One platform. Many businesses.</h2></div>
                  <span className="section-aside">Built to expand</span>
                </div>
                <p className="ecosystem-intro">EverythingHub is the front door. Each division can grow into a deeper service, product or business while sharing one connected discovery experience.</p>
                <div className="ecosystem-grid">
                  <article className="ecosystem-card">
                    <span className="ecosystem-number">01</span>
                    <strong>Discovery Network</strong>
                    <p>Search, research, news, images and global information in one place.</p>
                    <span className="ecosystem-status live">LIVE FOUNDATION</span>
                  </article>
                  <article className="ecosystem-card">
                    <span className="ecosystem-number">02</span>
                    <strong>Business & Commerce</strong>
                    <p>Company discovery, local businesses, services and opportunities.</p>
                    <span className="ecosystem-status">EXPANSION TRACK</span>
                  </article>
                  <article className="ecosystem-card">
                    <span className="ecosystem-number">03</span>
                    <strong>Places & Experiences</strong>
                    <p>Explore destinations, mapped places, events and things to do.</p>
                    <span className="ecosystem-status">EXPANSION TRACK</span>
                  </article>
                  <article className="ecosystem-card">
                    <span className="ecosystem-number">04</span>
                    <strong>Media Network</strong>
                    <p>Video, audio, creators and useful visual storytelling.</p>
                    <span className="ecosystem-status">EXPANSION TRACK</span>
                  </article>
                  <article className="ecosystem-card">
                    <span className="ecosystem-number">05</span>
                    <strong>Community & Impact</strong>
                    <p>Connect people to causes, public resources and year-round recognition.</p>
                    <span className="ecosystem-status live">MISSION PILLAR</span>
                  </article>
                </div>
                <div className="ecosystem-principle"><Layers3 size={17}/><span><strong>One connected ecosystem:</strong> shared discovery, clear divisions, room for new products and services.</span></div>
                <div className="foundation-partnership">
                  <div className="foundation-partnership-mark"><HeartHandshake size={22}/></div>
                  <div className="foundation-partnership-copy">
                    <span className="section-kicker">BUILT WITH A PURPOSE</span>
                    <h3>Technology with a mission behind it.</h3>
                    <p>EverythingHub is being developed as a subsidiary initiative of Dog Tag Day Foundation. The long-term purpose is to direct the value it creates toward the Foundation’s work honoring veterans and keeping their stories and service visible year-round.</p>
                    <a href="https://dogtagday.org/" target="_blank" rel="noopener noreferrer">Meet Dog Tag Day Foundation <ArrowUpRight size={14}/></a>
                  </div>
                </div>
              </section>


            <section className="research-band" id="how-it-works">
              <div className="research-band-icon"><Sparkles size={20}/></div>
              <div><span className="section-kicker">ASK. LEARN. VERIFY.</span><h2>Go beyond a list of links.</h2><p>Use EverythingHub AI to explore a question, get a clear explanation and review the public sources used to build the answer.</p></div>
              <button type="button" onClick={() => { setMode('ai'); document.getElementById('hub-search')?.focus(); }}>Try research <ArrowUpRight size={15}/></button>
            </section>
          </>
        )}

        {!libraryOpen && <section className="results-section" aria-live="polite">
          {searched && (
            <div className="results-heading">
              <div>
                <div className="results-kicker">{mode === 'ai' ? 'AI RESEARCH' : mode === 'images' ? 'IMAGE RESULTS' : mode === 'news' ? 'NEWS RESULTS' : mode === 'veterans' ? 'VETERAN RESOURCES' : mode === 'business' ? 'BUSINESS DISCOVERY' : mode === 'places' ? 'PLACE DISCOVERY' : mode === 'media' ? 'MEDIA DISCOVERY' : mode === 'world' ? 'WORLD INFORMATION' : 'SEARCH RESULTS'} <span> / </span> {mode.toUpperCase()}</div>
                <h2>{submittedQuery}</h2>
              </div>
              {(results.length > 0 || images.length > 0 || places.length > 0 || businesses.length > 0) && <div className="result-total"><strong>{mode === 'images' ? images.length : mode === 'places' ? places.length : mode === 'business' ? businesses.length : results.length}</strong><span>RESULTS</span></div>}
            </div>
          )}
          <div className={busy ? 'status-line loading' : 'status-line'}>
            <span className="status-indicator" />
            <span>{message}</span>
          </div>

          {mode === 'ai' && aiAnswer && (
            <div className="ai-answer-card">
              <div className="ai-answer-heading"><Sparkles size={16}/> EVERYTHINGHUB AI</div>
              <div className="ai-answer-text">{aiAnswer}</div>
              <div className="provider-row">
                <ShieldCheck size={14}/>
                <span>Public research sources checked; review the links before relying on an answer.</span>
                <span className="provider-detail">{providers.join(' · ')}{providerIssues.length > 0 ? ' · ' + providerIssues.length + ' unavailable' : ''}</span>
              </div>
              {aiSources.length > 0 && <div className="ai-source-list"><strong>Sources consulted</strong>{aiSources.map((source, index) => <a key={source.url + index} href={source.url} target="_blank" rel="noopener noreferrer" onClick={() => { void api.post('/api/insights/click', { query: submittedQuery, domain: source.source }).catch(() => undefined); }}>{source.title} <span>{source.source}</span></a>)}</div>}
            </div>
          )}

          {mode === 'business' && businesses.length > 0 && (
            <div className="place-results">
              {businesses.map(company => (
                <article className="place-result" key={company.cik}>
                  <div className="place-result-heading">
                    <BriefcaseBusiness size={17}/>
                    <div><strong>{company.name}</strong><span>{company.category} · {company.ticker}</span></div>
                  </div>
                  <p>SEC Central Index Key: {company.cik}<br />Directory: {company.source}</p>
                  <a href={company.url} target="_blank" rel="noopener noreferrer" onClick={() => { void api.post('/api/insights/click', { query: submittedQuery, domain: 'sec.gov' }).catch(() => undefined); }}>Open SEC company filings <ExternalLink size={12}/></a>
                </article>
              ))}
              <p className="place-attribution">{businessScope} Company data from the U.S. Securities and Exchange Commission. This directory does not cover every private company or nonprofit.</p>
            </div>
          )}

          {mode === 'places' && places.length > 0 && (
            <div className="place-results">
              {places.map(place => (
                <article className="place-result" key={place.id}>
                  <div className="place-result-heading">
                    <MapPinned size={17}/>
                    <div><strong>{place.name}</strong><span>{place.category || 'Mapped place'}</span></div>
                  </div>
                  <p>{place.address}</p>
                  <a href={place.mapUrl} target="_blank" rel="noopener noreferrer" onClick={() => { void api.post('/api/insights/click', { query: submittedQuery, domain: 'openstreetmap.org' }).catch(() => undefined); }}>Open map <ExternalLink size={12}/></a>
                </article>
              ))}
              <p className="place-attribution">Place data © OpenStreetMap contributors. Verify details with the location before travelling.</p>
            </div>
          )}

          {mode === 'images' && images.length > 0 && (
            <div className="image-results-grid">
              {images.map((item, index) => (
                <a className="image-result" href={item.pageUrl} target="_blank" rel="noopener noreferrer" key={item.pageUrl + index}
                  onClick={() => { void api.post('/api/insights/click', { query: submittedQuery, domain: 'commons.wikimedia.org' }).catch(() => undefined); }}>
                  <img src={item.imageUrl} alt={item.title} loading="lazy" />
                  <span className="image-result-title">{item.title}</span>
                  <span className="image-result-source">WIKIMEDIA COMMONS</span>
                </a>
              ))}
            </div>
          )}

          {mode !== 'images' && mode !== 'places' && results.length > 0 && (
            <>
              <div className="provider-row">
                <ShieldCheck size={14}/>
                <span>{mode === 'news' ? 'News-focused results from available public web sources' : mode === 'veterans' ? 'Veteran-focused search across government and established service organizations; sources are not endorsements' : mode === 'business' ? 'Company and market information from public websites; verify details with the organization' : mode === 'places' ? 'Location and destination information from public websites; verify hours and availability' : mode === 'media' ? 'Media discovery from public websites; playback and availability depend on the publisher' : mode === 'world' ? 'Global information aggregated from public websites' : 'Aggregated from available public search sources'}</span>
                <span className="provider-detail">{providers.join(' · ')}{providerIssues.length > 0 ? ' · ' + providerIssues.length + ' unavailable' : ''}</span>
              </div>
              <div className="result-list">
                {results.map((result, index) => (
                  <article className="result-card" key={result.url + index}>
                    <div className="result-main">
                      {(() => {
                        const videoThumbnail = youtubeVideoThumbnail(result.url);
                        const thumbnail = result.thumbnailUrl || videoThumbnail || resultImages[result.url];
                        const isVideo = Boolean(result.thumbnailUrl) || /youtube\.com|youtu\.be|vimeo\.com|archive\.org\/details/i.test(result.url);
                        return thumbnail ? <a className="result-thumbnail" href={result.url} target="_blank" rel="noopener noreferrer" aria-label={(isVideo ? 'Watch video: ' : 'Open image result: ') + result.title}>
                          <img src={thumbnail} alt={result.title} loading="lazy" onError={event => event.currentTarget.closest('.result-thumbnail')?.remove()} />
                          {isVideo && <span className="result-thumbnail-play"><PlaySquare size={23}/> WATCH</span>}
                        </a> : null;
                      })()}
                      <div className="result-url">
                        <span className="favicon-placeholder">{result.source.slice(0, 1).toUpperCase()}</span>
                        <span className="result-domain">{result.source}</span>
                        <span className="domain-separator">·</span>
                        <span className="result-label">{result.source === 'dogtagday.org' ? 'FOUNDATION' : mode === 'news' ? 'NEWS SOURCE' : mode === 'veterans' ? 'VETERAN RESOURCE SOURCE' : 'WEB RESULT'}</span>
                      </div>
                      <a className="result-title" href={result.url} target="_blank" rel="noopener noreferrer" onClick={() => { void api.post('/api/insights/click', { query: submittedQuery, domain: result.source }).catch(() => undefined); }}>{result.title}</a>
                      {result.publishedAt && Number.isFinite(Date.parse(result.publishedAt)) && <p className="result-source-date">Published {new Date(result.publishedAt).toLocaleString()}</p>}
                      {result.snippet && <p className="result-snippet">{result.snippet}</p>}
                      <a className="result-visit" href={result.url} target="_blank" rel="noopener noreferrer" onClick={() => { void api.post('/api/insights/click', { query: submittedQuery, domain: result.source }).catch(() => undefined); }}>Visit website <ExternalLink size={12}/></a>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {searched && !busy && results.length === 0 && images.length === 0 && places.length === 0 && businesses.length === 0 && !aiAnswer && (
            <div className="empty-state">
              <div className="empty-icon"><Search size={21}/></div>
              <h3>No results found</h3>
              <p>{mode === 'ai' ? 'EverythingHub AI could not prepare an answer. Try again.' : mode === 'images' ? 'Wikimedia Commons did not return matching images. Try a broader phrase.' : mode === 'business' ? 'No SEC-listed company matched. Try a ticker symbol, a shorter company name, or switch to All Search for private businesses and broader information.' : mode === 'veterans' ? 'The veteran-focused public search did not return readable results. Try another phrase or check back in a moment.' : 'The public search sources did not return readable results. Try another phrase or check back in a moment.'}</p>
            </div>
          )}
        </section>}
      </main>

      <section className="system-pulse" aria-label="EverythingHub system status">
        <div className="system-pulse-heading">
          <div><span className="section-kicker">THE ENGINE ROOM</span><h2>EverythingHub system pulse</h2><p>Live index and anonymous activity counters · refreshes every minute</p></div>
          <span className="system-live-state"><i /> {indexStatus?.running ? 'CRAWLER ACTIVE' : 'STATUS CHECK'}</span>
        </div>
        {systemStatusError ? <p className="system-pulse-error">{systemStatusError}</p> : <>
          <div className="system-pulse-grid">
            <article><span>PUBLIC SEED SITES</span><strong>{indexStatus?.seedSites ?? '—'}</strong><small>Starting domains</small></article>
            <article><span>PAGES INDEXED</span><strong>{(indexStatus?.pagesIndexed ?? 0).toLocaleString()}</strong><small>Internal searchable index</small></article>
            <article><span>QUEUE</span><strong>{(indexStatus?.queuedPages ?? 0).toLocaleString()}</strong><small>Pages awaiting crawl</small></article>
            <article><span>CRAWL CAPACITY</span><strong>{(indexStatus?.maxPagesPerRun ?? ((indexStatus?.workers ?? 8) * (indexStatus?.maxPagesPerWorkerPerRun ?? 10))).toLocaleString()}</strong><small>Page attempts every 5 minutes</small></article>
            <article><span>VISITS · 60 MIN</span><strong>{(trafficStatus?.totals?.visits ?? 0).toLocaleString()}</strong><small>Anonymous page loads</small></article>
            <article><span>SEARCHES · 60 MIN</span><strong>{(trafficStatus?.totals?.searches ?? 0).toLocaleString()}</strong><small>Successful searches</small></article>
            <article><span>EVENTS / MIN</span><strong>{(trafficStatus?.averageTrackedEventsPerMinute ?? 0).toFixed(2)}</strong><small>Includes crawler runs</small></article>
          </div>
          <div className="system-pulse-foot"><span>{indexStatus?.crawler || 'Crawler'} · {indexStatus?.schedule || 'Schedule checking'}</span><span>{indexStatus?.lastCrawledAt ? 'Last crawl ' + new Date(indexStatus.lastCrawledAt).toLocaleString() : 'Awaiting first crawl record'}</span></div>
          <p className="system-pulse-disclaimer">{trafficStatus?.measurement || 'Activity totals are anonymous tracked events, not unique people or raw server requests.'} The internal index grows gradually; public search providers also supply live web results.</p>
          {indexStatus?.lastError && <p className="system-pulse-error">Latest crawler issue: {indexStatus.lastError}</p>}
        </>}
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand"><Compass size={15}/><span>everything<span>hub</span></span></div>
          <p>OPEN WEB <b>·</b> RESEARCH <b>·</b> DISCOVERY <b>·</b> FREE-FIRST</p>
          <span className="footer-note">Search results link to original publishers. Images are served by Wikimedia Commons and link to their source pages. Provider coverage and capabilities vary as the platform grows.</span>
          <span className="sponsor-note">Proudly presented by <strong>Dog Tag Day Foundation</strong>.</span>
          <span className="sponsor-founder">Ronnie Shure, Founder &amp; CEO</span>
          <a className="sponsor-visit-link" href="https://dogtagday.org/" target="_blank" rel="noopener noreferrer">Visit DogTagDay.org <ExternalLink size={11} /></a>
        </div>
      </footer>
    </div>
  );
}