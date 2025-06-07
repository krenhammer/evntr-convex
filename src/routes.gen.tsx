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
const events = createRoute({ getParentRoute: () => root, path: "events" }).lazy(
  () =>
    import("./pages/events/_layout").then((m) =>
      createLazyRoute("/events")({ component: m.default }),
    ),
);
const eventsid = createRoute({
  getParentRoute: () => events,
  path: "$id",
  // @ts-ignore
  loader: (...args) =>
    import("./pages/events/[id]").then((m) => m.Loader(...args)),
}).lazy(() =>
  import("./pages/events/[id]").then((m) =>
    createLazyRoute("/events/$id")({ component: m.default }),
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
  events.addChildren([eventsid]),
  auth.addChildren([authwaitlist, authsignup]),
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
