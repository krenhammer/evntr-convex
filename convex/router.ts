import { httpRouter } from "convex/server";

const http = httpRouter();

// Add your custom HTTP routes here
// Example:
// http.route({
//   path: "/api/example",
//   method: "POST",
//   handler: httpAction(async (ctx, request) => {
//     return new Response("Hello World", { status: 200 });
//   }),
// });

export default http;
