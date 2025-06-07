// Generouted, changes to this file will be overridden
import { Fragment } from "react";
import {
  Outlet,
  RouterProvider,
  createLazyRoute,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import App from "./pages/_app";
import NoMatch from "./pages/404";

const root = createRootRoute({ component: App || Outlet });
const _404 = createRoute({
  getParentRoute: () => root,
  path: "*",
  component: NoMatch || Fragment,
});
const posts = createRoute({ getParentRoute: () => root, path: "posts" }).lazy(
  () =>
    import("./pages/posts/_layout").then((m) =>
      createLazyRoute("/posts")({ component: m.default }),
    ),
);
const postsindex = createRoute({ getParentRoute: () => posts, path: "/" }).lazy(
  () =>
    import("./pages/posts/index").then((m) =>
      createLazyRoute("/posts")({ component: m.default }),
    ),
);
const postsid = createRoute({
  getParentRoute: () => posts,
  path: "$id",
  // @ts-ignore
  loader: (...args) =>
    import("./pages/posts/[id]").then((m) => m.Loader(...args)),
}).lazy(() =>
  import("./pages/posts/[id]").then((m) =>
    createLazyRoute("/posts/$id")({ component: m.default }),
  ),
);
const auth = createRoute({ getParentRoute: () => root, path: "auth" }).lazy(
  () =>
    import("./pages/auth/_layout").then((m) =>
      createLazyRoute("/auth")({ component: m.default }),
    ),
);
const authwaitlist = createRoute({
  getParentRoute: () => auth,
  path: "waitlist",
}).lazy(() =>
  import("./pages/auth/waitlist").then((m) =>
    createLazyRoute("/auth/waitlist")({ component: m.default }),
  ),
);
const authsignup = createRoute({
  getParentRoute: () => auth,
  path: "sign-up",
}).lazy(() =>
  import("./pages/auth/sign-up").then((m) =>
    createLazyRoute("/auth/sign-up")({ component: m.default }),
  ),
);
const authsignin = createRoute({
  getParentRoute: () => auth,
  path: "sign-in",
}).lazy(() =>
  import("./pages/auth/sign-in").then((m) =>
    createLazyRoute("/auth/sign-in")({ component: m.default }),
  ),
);
const app = createRoute({ getParentRoute: () => root, path: "app" }).lazy(() =>
  import("./pages/app/_layout").then((m) =>
    createLazyRoute("/app")({ component: m.default }),
  ),
);
const appevents = createRoute({
  getParentRoute: () => app,
  path: "events",
}).lazy(() =>
  import("./pages/app/events/_layout").then((m) =>
    createLazyRoute("/app/events")({ component: m.default }),
  ),
);
const appeventsindex = createRoute({
  getParentRoute: () => appevents,
  path: "/",
  // @ts-ignore
  loader: (...args) =>
    import("./pages/app/events/index").then((m) => m.Loader(...args)),
}).lazy(() =>
  import("./pages/app/events/index").then((m) =>
    createLazyRoute("/app/events")({ component: m.default }),
  ),
);
const appeventsid = createRoute({
  getParentRoute: () => appevents,
  path: "$id",
  // @ts-ignore
  loader: (...args) =>
    import("./pages/app/events/[id]").then((m) => m.Loader(...args)),
}).lazy(() =>
  import("./pages/app/events/[id]").then((m) =>
    createLazyRoute("/app/events/$id")({ component: m.default }),
  ),
);
const about = createRoute({ getParentRoute: () => root, path: "about" }).lazy(
  () =>
    import("./pages/about").then((m) =>
      createLazyRoute("/about")({ component: m.default }),
    ),
);
const index = createRoute({
  getParentRoute: () => root,
  path: "/",
  // @ts-ignore
  loader: (...args) => import("./pages/index").then((m) => m.Loader(...args)),
}).lazy(() =>
  import("./pages/index").then((m) =>
    createLazyRoute("/")({
      component: m.default,
      pendingComponent: m.Pending,
      errorComponent: m.Catch,
    }),
  ),
);

const config = root.addChildren([
  posts.addChildren([postsindex, postsid]),
  auth.addChildren([authwaitlist, authsignup, authsignin]),
  app.addChildren([appevents.addChildren([appeventsindex, appeventsid])]),
  about,
  index,
  _404,
]);

const router = createRouter({ routeTree: config });
export const routes = config;
export const Routes = () => <RouterProvider router={router} />;

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
