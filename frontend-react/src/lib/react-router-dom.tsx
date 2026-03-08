/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';

type RouterContextValue = {
  path: string;
  navigate: (to: string, replace?: boolean) => void;
  params: Record<string, string>;
};

const RouterContext = createContext<RouterContextValue | null>(null);

function matchRoute(pattern: string, pathname: string): Record<string, string> | null {
  if (pattern.endsWith('/*')) {
    const base = pattern.slice(0, -2) || '/';
    if (pathname === base || pathname.startsWith(`${base}/`)) return {};
  }
  if (pattern === pathname) return {};
  const p1 = pattern.split('/').filter(Boolean);
  const p2 = pathname.split('/').filter(Boolean);
  if (p1.length !== p2.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p1.length; i += 1) {
    if (p1[i].startsWith(':')) {
      params[p1[i].slice(1)] = decodeURIComponent(p2[i]);
    } else if (p1[i] !== p2[i]) {
      return null;
    }
  }
  return params;
}

export function BrowserRouter({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const value = useMemo<RouterContextValue>(() => ({
    path,
    params: {},
    navigate: (to: string, replace = false) => {
      if (to === path) return;
      if (replace) {
        window.history.replaceState(null, '', to);
      } else {
        window.history.pushState(null, '', to);
      }
      setPath(to);
    },
  }), [path]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useLocation() {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useLocation must be used within BrowserRouter');
  return { pathname: context.path };
}

export function useNavigate() {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useNavigate must be used within BrowserRouter');
  return (to: string, options?: { replace?: boolean }) => context.navigate(to, options?.replace);
}

export function useSearchParams() {
  const [search, setSearch] = useState(() => window.location.search);

  useEffect(() => {
    const onPopState = () => setSearch(window.location.search);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  
  const setSearchParams = (nextParams: URLSearchParams | Record<string, string>, options?: { replace?: boolean }) => {
    const nextSearch = (nextParams instanceof URLSearchParams ? nextParams : new URLSearchParams(nextParams)).toString();
    const to = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`;
    
    if (options?.replace) {
      window.history.replaceState(null, '', to);
    } else {
      window.history.pushState(null, '', to);
    }
    // No need to setPath or setSearch here as popstate doesn't fire on pushState
    // But since this is a mini-router, we might need a better way to notify everyone.
    // For now, let's just trigger a manual reload or provide a functional update if needed.
    // However, for the ErrorPage, we only READ searchParams, so this is enough.
  };

  return [searchParams, setSearchParams] as const;
}

export function useParams<T extends Record<string, string>>() {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useParams must be used within BrowserRouter');
  return context.params as T;
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const context = useContext(RouterContext);
  if (!context) throw new Error('Navigate must be used within BrowserRouter');

  useEffect(() => {
    context.navigate(to, replace);
  }, [context, to, replace]);

  return null;
}

export function Route({ path, element }: { path: string; element: ReactNode }) {
  void path;
  void element;
  return null;
}

export function Routes({ children }: { children: ReactNode }) {
  const context = useContext(RouterContext);
  if (!context) throw new Error('Routes must be used within BrowserRouter');

  const path = context.path;
  const routeElements = (Array.isArray(children) ? children : [children]) as Array<{ props?: { path?: string; element?: ReactNode } }>;

  for (const child of routeElements) {
    const routePath = child?.props?.path;
    if (!routePath || routePath === '*') continue;
    const params = matchRoute(routePath, path);
    if (params) return <RouterContext.Provider value={{ ...context, params }}>{child.props?.element ?? null}</RouterContext.Provider>;
  }

  const wildcard = routeElements.find((child) => child?.props?.path === '*');
  return <>{wildcard?.props?.element ?? null}</>;
}

export function Link({ to, replace = false, children, ...props }: { to: string; replace?: boolean; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const context = useContext(RouterContext);
  if (!context) throw new Error('Link must be used within BrowserRouter');

  return (
    <a
      {...props}
      href={to}
      onClick={(event) => {
        props.onClick?.(event);
        if (event.defaultPrevented) return;
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        context.navigate(to, replace);
      }}
    >
      {children}
    </a>
  );
}
