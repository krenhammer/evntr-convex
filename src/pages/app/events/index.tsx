import { LoaderFnContext, useMatch } from '@tanstack/react-router'

export const Loader = (context: LoaderFnContext) => {
  console.log({ params: context.params })
  return context.params
}

export default function EventsIndex() {
  return <div>Welcome to Events</div>;
}