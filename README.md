# Big Red Button

A small realtime socket application inspired by jackbox games.

A host creates a room and invites people through a code. The guests have a big red button that they can press. The host will get on their screen who pressed the button first and can reset the room.

This can be used in many ways. For trivia games for example to figure out who gets to answer the question first.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
