// utils/getActiveRoute.js
import { matchPath } from 'react-router-dom';

/**
 * Trả về routes[i].name ứng với pathname hiện tại.
 * Hỗ trợ cấu trúc { collapse, category, items }.
 * Ưu tiên match chính xác; fallback "Default Brand Text".
 */
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

      // Bỏ qua route không thuộc layout chính (nếu bạn muốn)
      // if (r.layout !== '/') continue;

      const fullPath = `${r.layout || ''}${r.path || ''}` || '/';

      // match chính xác, không match nhầm chuỗi con
      const matched =
        matchPath({ path: fullPath, end: true }, pathname) ||
        // Nếu bạn muốn cho phép match "cha" (ví dụ /profile khớp /profile/edit):
        matchPath({ path: fullPath, end: false }, pathname);

      if (matched) return r.name || active;
    }
    return active;
  };

  return walk(routes);
}
