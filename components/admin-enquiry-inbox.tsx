'use client';

import { Download, Inbox, LoaderCircle, Mail, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Message = {
  id: string;
  name: string;
  email: string;
  topic: 'conversation' | 'correction' | 'suggestion' | 'privacy';
  message: string;
  createdAt: string;
  product?: { name: string; url: string; category: string };
};

const topicLabel: Record<Message['topic'], string> = {
  conversation: 'Conversation',
  correction: 'Correction',
  suggestion: 'Tool suggestion',
  privacy: 'Privacy question',
};
// Historical counts confirmed by an administrative database read on 2026-10-27.
// They are a dated source audit, NOT currently accessible inbox records.
// Display them only while the Supabase REST API is restricted.
const preservedSupabaseBaseline = { toolSubmissions: 25, otherMessages: 2, verifiedAt: '27 Oct 2026' } as const;
const displayDate = (value: string) =>
  Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Date unavailable';

export function AdminEnquiryInbox({ onlyTools = false }: { onlyTools?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState(onlyTools ? 'suggestion' : 'all');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [truncated, setTruncated] = useState(false);
  const [partialLegacy, setPartialLegacy] = useState(false);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/enquiries', { credentials: 'same-origin', cache: 'no-store', signal });
      const result = await response.json() as { messages?: Message[]; truncated?: boolean; partialLegacy?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || 'Messages could not be loaded.');
      const items = result.messages || [];
      setMessages(items);
      setTruncated(Boolean(result.truncated));
      setPartialLegacy(Boolean(result.partialLegacy));
      setSelectedId(current => items.some(m => m.id === current) ? current : items[0]?.id || '');
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') setError(e.message);
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => { void refresh(controller.signal); }, 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [refresh]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return messages.filter(m =>
      (!onlyTools || Boolean(m.product)) && (topic === 'all' || m.topic === topic) &&
      (!query || [m.name, m.email, m.topic, m.message, m.product?.name || '', m.id]
        .some(value => value.toLowerCase().includes(query))));
  }, [messages, search, topic, onlyTools]);
  const selected = filtered.find(m => m.id === selectedId) || filtered[0];
  const replyTo = selected && 'mailto:' + selected.email + '?subject=' +
    encodeURIComponent('Re: Your TruTool message (' + selected.id.slice(0, 8) + ')');

  return <>
    <div className="studio-page-heading">
      <div><span className="studio-kicker">PRIVATE TEAM INBOX</span>
        <h1>{onlyTools ? 'Tool listing requests.' : 'Messages from your readers.'}</h1>
        <p>{onlyTools ? 'Review new tool requests now. Historical requests will reappear when Supabase API access returns.' : 'Review available messages. Older Supabase records are preserved separately until its API is restored.'}</p>
      </div>
      <div className="studio-inbox-actions">
        <button type="button" className="studio-btn studio-outline" onClick={() => void refresh()} disabled={busy}>
          {busy ? <LoaderCircle className="studio-spin" size={16}/> : <RefreshCw size={16}/>} Refresh
        </button>
        <a className="studio-btn studio-dark" href="/api/admin/enquiries?export=csv"><Download size={17}/> Export CSV</a>
      </div>
    </div>
    <div className="studio-stat-grid studio-two-stats">
      <div className="studio-stat"><span>{onlyTools ? 'Tool submissions available now' : 'Messages available now'}</span><strong>{onlyTools ? messages.filter(m => Boolean(m.product)).length : messages.length}</strong><small>Currently readable from private storage</small></div>
      <div className="studio-stat"><span>Showing</span><strong>{filtered.length}</strong><small>Matching your current filters</small></div>
    </div>
    {error && <div className="studio-error studio-global-error" role="alert">{error}</div>}
    {partialLegacy && <div className="studio-info-note" role="status">
      <strong>{onlyTools ? preservedSupabaseBaseline.toolSubmissions + ' older tool submissions are preserved in Supabase.' :
        preservedSupabaseBaseline.toolSubmissions + ' older tool submissions and ' + preservedSupabaseBaseline.otherMessages + ' other messages are preserved in Supabase.'}</strong>
      {' '}Verified {preservedSupabaseBaseline.verifiedAt}. This is a historical database count, not an export or a list of accessible records.
      Supabase currently blocks the live REST API (HTTP 402), so their full details cannot appear in Studio yet.
      New submissions remain available below from private Vercel Blob storage.
      Nothing has been removed, and these older records will be included when Supabase access returns.
    </div>}
    {truncated && <p className="studio-info-note" role="status">The inbox is showing the first 10,000 stored messages. Export or archive older records before this limit is reached.</p>}
    <section className="studio-panel studio-inbox-panel" aria-label="Contact messages">
      <div className="studio-inbox-filters">
        <label className="studio-inbox-search"><Search size={18}/>
          <span className="sr-only">Search contact messages</span>
          <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search names, emails or message text"/>
        </label>
        <label className="studio-inbox-topic">
          <span className="sr-only">Filter by message topic</span>
          <select value={topic} onChange={event => setTopic(event.target.value)}>
            {onlyTools ? <option value="suggestion">Tool listing requests</option> : <><option value="all">All topics</option>{Object.entries(topicLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</>}
          </select>
        </label>
      </div>
      {busy && !messages.length ? <div className="studio-empty"><LoaderCircle className="studio-spin" size={28}/><p>Loading private messages…</p></div>
        : messages.length === 0 ? <div className="studio-empty"><Inbox size={34}/><h2>{partialLegacy ? 'No new requests in the available inbox.' : onlyTools ? 'Your listing queue is ready.' : 'Your contact inbox is ready.'}</h2><p>{partialLegacy ? 'Older records are preserved in Supabase but cannot be displayed until its API restriction is lifted. New submissions will appear here.' : onlyTools ? 'Requests from the List your product form will appear here.' : 'New messages submitted through the contact page will appear here.'}</p></div>
        : filtered.length === 0 ? <div className="studio-empty"><Search size={30}/><h2>No messages match your filters.</h2><p>Clear the search or choose another topic.</p></div>
        : <div className="studio-inbox-grid">
          <div className="studio-inbox-list" aria-label="Received messages">
            {filtered.map(message => <button key={message.id} type="button"
              className={'studio-inbox-row' + (selected?.id === message.id ? ' active' : '')}
              aria-pressed={selected?.id === message.id}
              onClick={() => setSelectedId(message.id)}>
              <span className="studio-inbox-row-head"><strong>{message.name}</strong><small>{displayDate(message.createdAt)}</small></span>
              <span className="studio-inbox-row-meta">{topicLabel[message.topic]} · {message.email}</span>
              <span className="studio-inbox-row-preview">{message.message}</span>
            </button>)}
          </div>
          {selected && <article className="studio-inbox-detail" key={selected.id}>
            <span className="studio-kicker">{topicLabel[selected.topic]}</span>
            <h2>{selected.name}</h2>
            <p className="studio-inbox-message-meta">Received {displayDate(selected.createdAt)} · Reference {selected.id.slice(0, 8)}</p>
            <div className="studio-inbox-contact"><strong>Reply address</strong><a href={'mailto:' + selected.email}>{selected.email}</a></div>
            <div className="studio-inbox-message"><strong>Message</strong><p>{selected.message}</p></div>
            {selected.product && <div className="studio-inbox-product">
              <strong>Suggested product</strong><p>{selected.product.name} · {selected.product.category}</p>
              {/^https?:\/\//i.test(selected.product.url) && <a href={selected.product.url} target="_blank" rel="noopener noreferrer">Official website ↗</a>}
            </div>}
            <div className="studio-inbox-reply">
              <a className="studio-btn studio-dark" href={replyTo}><Mail size={17}/> Reply by email</a>
            </div>
          </article>}
        </div>}
    </section>
  </>;
}
