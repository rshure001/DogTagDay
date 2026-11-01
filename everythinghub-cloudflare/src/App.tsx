import { useState } from 'react';
import { api } from './api';
import { ArrowUpRight, Search, Globe2, ShieldCheck, X, ExternalLink, Image as ImageIcon, Newspaper, HeartHandshake, Sparkles } from 'lucide-react';

type Result = { title: string; url: string; snippet: string; source: string };
type ImageResult = { title: string; pageUrl: string; imageUrl: string; description: string };
type SearchResponse = { results?: Result[]; count?: number; providers?: string[]; note?: string };
type ImageResponse = { results?: ImageResult[] };
type AiResponse = { answer?: string; sources?: Array<{ title: string; url: string; source: string }> };
type Mode = 'web' | 'images' | 'news' | 'veterans' | 'ai';
const suggestions = ['Rolex watches', 'veteran grants', 'small business funding', 'science news'];

function BabyOctopus() {
  return (
                  <div className="baby-octopus" aria-label="EverythingHub AI baby octopus mascot">
                    <svg viewBox="0 0 180 150" role="img" aria-label="A realistic orange baby octopus with eight moving arms">
                      <defs>
                        <radialGradient id="babyMantle" cx="34%" cy="18%" r="82%">
                          <stop offset="0" stopColor="#ffd6b5"/><stop offset=".28" stopColor="#f7a36f"/><stop offset=".68" stopColor="#d96b42"/><stop offset="1" stopColor="#8e382d"/>
                        </radialGradient>
                        <linearGradient id="babyArm" x1="0" y1="0" x2=".2" y2="1">
                          <stop offset="0" stopColor="#ffbd8c"/><stop offset=".48" stopColor="#e98758"/><stop offset="1" stopColor="#a74736"/>
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
                        <ellipse cx="69" cy="70" rx="17" ry="20" fill="#d87550"/>
                        <ellipse cx="110" cy="70" rx="17" ry="20" fill="#d87550"/>
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
                  <form className="search-form hero-search-overlay" onSubmit={event => runSearch(event)}>
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiSources, setAiSources] = useState<Array<{ title: string; url: string; source: string }>>([]);
  const [mode, setMode] = useState<Mode>('web');
  const [message, setMessage] = useState('Search the web. Find the answer, source, or place you need.');
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);

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
    setProviders([]);
    setAiAnswer('');
    setAiSources([]);
    setMessage(selectedMode === 'ai' ? 'EverythingHub AI is researching your question…' : selectedMode === 'images' ? 'Finding images from Wikimedia Commons…' : selectedMode === 'veterans' ? 'Searching veteran-service and government sources…' : 'Searching public web sources…');
    try {
      if (selectedMode === 'ai') {
        const response = await api.post('/api/ai/answer', { question: cleanQuery });
        const data = response.data as AiResponse;
        setAiAnswer(data.answer || 'I could not prepare an answer. Please try again.');
        setAiSources(data.sources || []);
        setMessage((data.sources || []).length + ' public sources considered');
      } else if (selectedMode === 'images') {
        const response = await api.get('/api/images?q=' + encodeURIComponent(cleanQuery));
        const data = response.data as ImageResponse;
        const found = data.results || [];
        setImages(found);
        setMessage(found.length ? found.length + ' images found from Wikimedia Commons' : 'No matching images were found. Try a broader phrase.');
        void api.post('/api/insights/search', { query: cleanQuery, resultCount: found.length }).catch(() => undefined);
      } else {
        const params = new URLSearchParams({ q: cleanQuery, limit: '10', vertical: selectedMode });
        const response = await api.get('/api/search?' + params.toString());
        const data = response.data as SearchResponse;
        const found = data.results || [];
        setResults(found);
        setProviders(data.providers || []);
        setMessage(found.length ? found.length + (selectedMode === 'news' ? ' news-focused results found' : ' results found') : 'No readable results came back. Try a different phrase.');
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
    else setMessage(next === 'images' ? 'Search images from Wikimedia Commons.' : next === 'news' ? 'Find news and current reporting across public sources.' : 'Search the public web.');
  }

  function resetSearch() {
    setQuery('');
    setSubmittedQuery('');
    setResults([]);
    setImages([]);
    setProviders([]);
    setAiAnswer('');
    setAiSources([]);
    setSearched(false);
    setBusy(false);
    setMode('web');
    setMessage('Search the web. Find the answer, source, or place you need.');
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={event => { event.preventDefault(); resetSearch(); }}>
          <span className="brand-mark"><Globe2 size={19} strokeWidth={1.9} /></span>
          <span className="brand-lockup"><span className="brand-word">EVERYTHING HUB</span><span className="brand-tagline">Everything within reach.</span></span>
        </a>
        <div className="topbar-right">
          <span className="availability"><i /> LIVE SEARCH</span>
          <span className="topbar-divider" />
          <span className="topbar-caption">An open view of the web</span>
        </div>
      </header>

      <main className={searched ? 'main-content results-mode' : 'main-content'}>
        {!searched && (
          <section className="hero">
            <div className="eyebrow"><span className="eyebrow-line" /> DISCOVER WHAT'S OUT THERE</div>
            <h1>A wider view<br /><em>of the world.</em></h1>
            <p className="hero-copy">One search. A world of information.</p>
            <p className="privacy-note">Search activity helps improve aggregated trends. No account or personal profile is created.</p>
          </section>
        )}

        <form className="search-form" onSubmit={event => runSearch(event)}>
          {!searched && <BabyOctopus />}
          <Search className="search-icon" size={20} strokeWidth={1.8} />
          <input aria-label="Search the web" autoComplete="off" value={query}
            onChange={event => setQuery(event.target.value)} placeholder="What are you looking for?" />
          {query && <button className="clear-button" type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={16}/></button>}
          <button className="search-button" type="submit" disabled={busy}>
            {busy ? <span className="button-spinner" /> : <>Search <ArrowUpRight size={16}/></>}
          </button>
        </form>

        <nav className="search-tabs" aria-label="Search type">
          <button className={mode === 'web' ? 'search-tab active' : 'search-tab'} onClick={() => chooseMode('web')} type="button"><Globe2 size={15}/> All</button>
          <button className={mode === 'images' ? 'search-tab active' : 'search-tab'} onClick={() => chooseMode('images')} type="button"><ImageIcon size={15}/> Images</button>
          <button className={mode === 'news' ? 'search-tab active' : 'search-tab'} onClick={() => chooseMode('news')} type="button"><Newspaper size={15}/> News</button>
          <button className={mode === 'veterans' ? 'search-tab active' : 'search-tab'} onClick={() => chooseMode('veterans')} type="button"><HeartHandshake size={15}/> Veterans</button>
          <button className={mode === 'ai' ? 'search-tab active' : 'search-tab'} onClick={() => chooseMode('ai')} type="button"><Sparkles size={15}/> Ask AI</button>
        </nav>

        {!searched && (
          <section className="suggestions">
            <span className="suggestion-label">EXPLORE A TOPIC</span>
            <div className="suggestion-list">
              {suggestions.map(item => <button key={item} type="button" onClick={() => runSearch(undefined, item)}>{item}<ArrowUpRight size={12}/></button>)}
            </div>
          </section>
        )}

        <section className="results-section" aria-live="polite">
          {searched && (
            <div className="results-heading">
              <div>
                <div className="results-kicker">{mode === 'ai' ? 'AI ANSWER' : mode === 'images' ? 'IMAGE RESULTS' : mode === 'news' ? 'NEWS RESULTS' : mode === 'veterans' ? 'VETERAN RESOURCES' : 'SEARCH RESULTS'} <span> / </span> {mode.toUpperCase()}</div>
                <h2>{submittedQuery}</h2>
              </div>
              {(results.length > 0 || images.length > 0) && <div className="result-total"><strong>{mode === 'images' ? images.length : results.length}</strong><span>RESULTS</span></div>}
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
              {aiSources.length > 0 && <div className="ai-source-list"><strong>Sources consulted</strong>{aiSources.map((source, index) => <a key={source.url + index} href={source.url} target="_blank" rel="noopener noreferrer" onClick={() => { void api.post('/api/insights/click', { query: submittedQuery, domain: source.source }).catch(() => undefined); }}>{source.title} <span>{source.source}</span></a>)}</div>}
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

          {mode !== 'images' && results.length > 0 && (
            <>
              <div className="provider-row">
                <ShieldCheck size={14}/>
                <span>{mode === 'news' ? 'News-focused results from available public web sources' : mode === 'veterans' ? 'Veteran-focused search across government and established service organizations; sources are not endorsements' : 'Aggregated from available public search sources'}</span>
                <span className="provider-detail">{providers.join(' · ')}</span>
              </div>
              <div className="result-list">
                {results.map((result, index) => (
                  <article className="result-card" key={result.url + index}>
                    <div className="result-main">
                      <div className="result-url">
                        <span className="favicon-placeholder">{result.source.slice(0, 1).toUpperCase()}</span>
                        <span className="result-domain">{result.source}</span>
                        <span className="domain-separator">·</span>
                        <span className="result-label">{result.source === 'dogtagday.org' ? 'FOUNDATION' : mode === 'news' ? 'NEWS SOURCE' : mode === 'veterans' ? 'VETERAN RESOURCE SOURCE' : 'WEB RESULT'}</span>
                      </div>
                      <a className="result-title" href={result.url} target="_blank" rel="noopener noreferrer" onClick={() => { void api.post('/api/insights/click', { query: submittedQuery, domain: result.source }).catch(() => undefined); }}>{result.title}</a>
                      {result.snippet && <p className="result-snippet">{result.snippet}</p>}
                      <a className="result-visit" href={result.url} target="_blank" rel="noopener noreferrer" onClick={() => { void api.post('/api/insights/click', { query: submittedQuery, domain: result.source }).catch(() => undefined); }}>Visit website <ExternalLink size={12}/></a>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {searched && !busy && results.length === 0 && images.length === 0 && !aiAnswer && (
            <div className="empty-state">
              <div className="empty-icon"><Search size={21}/></div>
              <h3>No results found</h3>
              <p>{mode === 'ai' ? 'EverythingHub AI could not prepare an answer. Try again.' : mode === 'images' ? 'Wikimedia Commons did not return matching images. Try a broader phrase.' : mode === 'veterans' ? 'The veteran-focused public search did not return readable results. Try another phrase or check back in a moment.' : 'The public search sources did not return readable results. Try another phrase or check back in a moment.'}</p>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand"><Globe2 size={15}/><span>everything<span>hub</span></span></div>
          <p>INDEPENDENT SEARCH <b>·</b> PUBLIC WEB SOURCES <b>·</b> FREE-FIRST</p>
          <span className="footer-note">Web and news results link to original publishers. Images are served by Wikimedia Commons and link to their source pages. Search trends are aggregated without account-level profiles. Provider coverage may vary.</span>
        </div>
      </footer>
    </div>
  );
}