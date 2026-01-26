// utils/getActiveRoute.js
import { matchPath } from 'react-router-dom';

export function getActiveRouteName(routes, pathname) {
  let active = 'Default Brand Text';

  const walk = (nodes) => {
    for (const r of nodes) {
      if (r.collapse || r.category) {
        if (r.items && r.items.length) {
          const child = walk(r.items);
          if (child !== active) return child;
        }
        continue;
      }

      // if (r.layout !== '/') continue;

      const fullPath = `${r.layout || ''}${r.path || ''}` || '/';

      const matched =
        matchPath({ path: fullPath, end: true }, pathname) ||
        matchPath({ path: fullPath, end: false }, pathname);

      if (matched) return r.name || active;
    }
    return active;
  };

  return walk(routes);
}
