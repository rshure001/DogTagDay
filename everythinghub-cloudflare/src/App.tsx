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

function BabyOctopus() { return <div className="baby-octopus" aria-label="Baby octopus mascot"><svg viewBox="0 0 140 118" aria-hidden="true"><defs><radialGradient id="babyOrange" cx="35%" cy="20%"><stop stopColor="#ffc18b"/><stop offset="1" stopColor="#d96d42"/></radialGradient></defs><g className="octo-legs" fill="none" stroke="#df8051" strokeWidth="13" strokeLinecap="round"><path className="leg leg1" d="M53 72Q29 83 18 98Q9 102 13 91"/><path className="leg leg2" d="M66 78Q52 100 39 108Q29 111 31 101"/><path className="leg leg3" d="M78 78Q82 100 99 107Q110 109 107 98"/><path className="leg leg4" d="M91 70Q115 81 126 93Q136 96 132 84"/><path className="leg leg5" d="M49 65Q26 64 18 73Q9 75 13 64"/><path className="leg leg6" d="M94 62Q116 59 126 67Q136 68 132 57"/></g><path d="M39 61Q29 35 47 16Q67 -1 91 13Q112 27 105 54Q99 79 75 81Q51 82 39 61Z" fill="url(#babyOrange)" stroke="#bd603e" strokeWidth="1.5"/><ellipse cx="59" cy="23" rx="17" ry="7" fill="#fff0dc" opacity=".38"/><g className="octo-eyes"><ellipse cx="59" cy="48" rx="9" ry="12" fill="#fffdf8"/><ellipse cx="85" cy="48" rx="9" ry="12" fill="#fffdf8"/><g className="octo-pupils"><ellipse cx="62" cy="50" rx="4" ry="6" fill="#263443"/><ellipse cx="88" cy="50" rx="4" ry="6" fill="#263443"/><circle cx="63" cy="47" r="1.5" fill="white"/><circle cx="89" cy="47" r="1.5" fill="white"/></g><path className="octo-blink" d="M50 48Q59 59 68 48M76 48Q85 59 94 48" fill="none" stroke="#a94e36" strokeWidth="3.5" strokeLinecap="round"/></g><path d="M68 65Q74 71 81 65" fill="none" stroke="#9e4935" strokeWidth="2.3" strokeLinecap="round"/><circle cx="47" cy="62" r="3" fill="#ffd0a5"/><circle cx="98" cy="62" r="3" fill="#ffd0a5"/></svg></div>; }


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
          <span className="brand-word">everything<span>hub</span></span>
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