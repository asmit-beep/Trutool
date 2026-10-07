'use client';

import {usePathname} from 'next/navigation';
import {MotionSymbol,type MotionKind} from './motion-symbol';
import {useState, useRef, useEffect} from 'react';
import {ChevronDown, Layers, BriefcaseBusiness, ArrowUpRight} from 'lucide-react';
import Link from './site-link';
import {ProviderLogo} from './provider-logo';
import {serviceCategories} from '@/lib/services';

type Category = {slug:string; short:string; name:string; count:number; color:string};
type Menu = 'categories' | 'services' | null;

export function Navigation({categories}:{categories:Category[]}) {
  const pathname=usePathname();
  const current=(href:string)=>pathname===href||pathname.startsWith(href+'/');
  const navSymbols:Record<string,MotionKind>={Compare:'compare',Alternatives:'shuffle',Guides:'book',Community:'conversation'};
  const [menu, setMenu] = useState<Menu>(null);
  const [service, setService] = useState(serviceCategories[0].slug);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }
  function openMenu(next:Menu) {
    cancelClose();
    setMenu(next);
  }
  function leaveMenu() {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      if (!ref.current?.contains(document.activeElement)) setMenu(null);
    }, 180);
  }
  useEffect(() => () => {if (closeTimer.current) clearTimeout(closeTimer.current)}, []);
  useEffect(() => {
    if (!menu) return;
    const close = (e:PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setMenu(null);
      }
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [menu]);

  return <div className="navigation-wrap" ref={ref}
    onPointerLeave={leaveMenu}
    onBlur={e => {if (!e.currentTarget.contains(e.relatedTarget as Node)) openMenu(null)}}
    onKeyDown={e => {if (e.key === 'Escape') {e.preventDefault(); openMenu(null)}}}>
    <nav aria-label="Main navigation">
      <Link href="/tools" aria-current={current('/tools')?'page':undefined} onPointerEnter={() => openMenu(null)} onClick={() => openMenu(null)}><MotionSymbol kind="compass" size={15}/>Browse tools</Link>
      <button className="nav-capsule" aria-expanded={menu === 'categories'} aria-controls="category-mega" data-current={current('/categories')}
        onPointerEnter={e => {if (e.pointerType === 'mouse') openMenu('categories')}}
        onClick={() => openMenu(menu === 'categories' ? null : 'categories')}
        onKeyDown={e => {if (e.key === 'ArrowDown') {e.preventDefault(); openMenu('categories'); requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>('#category-mega a')?.focus())}}}>
        <MotionSymbol kind="layers" size={15}/>All categories <ChevronDown size={13}/>
      </button>
      <button className="nav-capsule" aria-expanded={menu === 'services'} aria-controls="services-mega" data-current={current('/services')}
        onPointerEnter={e => {if (e.pointerType === 'mouse') openMenu('services')}}
        onClick={() => openMenu(menu === 'services' ? null : 'services')}
        onKeyDown={e => {if (e.key === 'ArrowDown') {e.preventDefault(); openMenu('services'); requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>('#services-mega a')?.focus())}}}>
        <MotionSymbol kind="service" size={15}/>Services <ChevronDown size={13}/>
      </button>
      {['Compare','Alternatives','Guides','Community'].map(label => <Link key={label} href={'/'+label.toLowerCase()} aria-current={current('/'+label.toLowerCase())?'page':undefined} onPointerEnter={() => openMenu(null)} onClick={() => openMenu(null)}><MotionSymbol kind={navSymbols[label]} size={15}/>{label}</Link>)}
    </nav>
    {menu === 'categories' && <div className="mega-menu" id="category-mega" onPointerEnter={cancelClose}>
      <div className="mega-heading"><div><Layers size={21}/><strong>Find your next category.</strong></div><Link href="/categories" onClick={() => openMenu(null)}>Explore all categories <ArrowUpRight size={15}/></Link></div>
      <div className="mega-categories">{categories.map(c => <Link key={c.slug} href={'/categories/'+c.slug} onClick={() => openMenu(null)}><span className="mega-dot" style={{background:c.color}}/><span>{c.short}</span><ArrowUpRight size={13}/></Link>)}</div>
    </div>}
    {menu === 'services' && <div className="mega-menu" id="services-mega" onPointerEnter={cancelClose}>
      <div className="mega-heading"><div><BriefcaseBusiness size={21}/><strong>Expertise for the next step.</strong></div><Link href="/services" onClick={() => openMenu(null)}>Explore all services <ArrowUpRight size={15}/></Link></div>
      <div className="services-mega-body">
        <div className="services-mega-tabs">{serviceCategories.map(c => <button key={c.slug} onMouseEnter={() => setService(c.slug)} onFocus={() => setService(c.slug)} onClick={() => setService(c.slug)} aria-pressed={service === c.slug}>{c.name}</button>)}</div>
        <div className="services-mega-content">{serviceCategories.filter(c => c.slug === service).map(c => <div key={c.slug}><span className="eyebrow">{c.name}</span><p>{c.description}</p><div>{c.providers.map(([name,url]) => <Link key={name} href={'/services/'+c.slug} onClick={() => openMenu(null)}><ProviderLogo name={name} url={url}/><span>{name}</span><ArrowUpRight size={14}/></Link>)}</div><Link className="text-link" href={'/services/'+c.slug} onClick={() => openMenu(null)}>Compare providers and evaluation questions</Link></div>)}</div>
      </div>
    </div>}
  </div>;
}
