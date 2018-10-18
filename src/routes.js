import pathToRegexp from 'path-to-regexp';

import EnterpriseApp from './containers/EnterpriseApp';
import EnterpriseIndexPage from './containers/EnterpriseIndexPage';
import SupportPage from './containers/SupportPage';

/* eslint-disable no-underscore-dangle */
class RouteConfiguration {
  constructor(routes) {
    this._allRoutes = new Map();
    this._publicRoutes = new Map();
    this._privateRoutes = new Map();
    routes.forEach((route) => {
      this._allRoutes.set(route.path, route);
      if (route.private) {
        this._privateRoutes.set(route.path, route);
      } else {
        this._publicRoutes.set(route.path, route);
      }
    });
  }

  get publicRoutes() {
    return Array.from(this._publicRoutes.values());
  }

  set publicRoutes(routes) {
    this._publicRoutes = routes;
  }

  get privateRoutes() {
    return Array.from(this._privateRoutes.values());
  }

  set privateRoutes(routes) {
    this._privateRoutes = routes;
  }

  isCurrentRoutePublic() {
    const currentPath = window.location.pathname;
    for (let i = 0; i < this.privateRoutes.length; i += 1) {
      const route = this.privateRoutes[i];
      const re = pathToRegexp(route.path);
      if (re.test(currentPath)) {
        return false;
      }
    }
    return true;
  }
}
/* eslint-enable no-underscore-dangle */

export default function getRouteConfig() {
  return new RouteConfiguration([
    { path: '/support', component: SupportPage, private: false },
    { path: '/enterprises', component: EnterpriseIndexPage, private: true },
    { path: '/:enterpriseSlug', component: EnterpriseApp, private: true },
    { path: '/', component: EnterpriseIndexPage, private: true },
  ]);
}
