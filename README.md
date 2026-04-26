# pb pasta

Little web app that turns LiveSplit splits into an ASCII art display.

```
========================================
Spyro: Year of the Dragon               
Any%                                    
----------------------------------------
Sunrise Spring                     -10.3
Midday Garden                       -1.0
Evening Lake                       -12.8
Scorch                             -13.7
Midnight Mountain                   +2.3
  Helmet Proxy                     -13.9
  Sorceress                        -11.3
----------------------------------------
                                 23:51.9
========================================
```

## Build instructions

You need to install [Rust](https://rustup.rs/) first and add the `wasm32-unknown-unknown` target:

```bash
rustup target add wasm32-unknown-unknown
```

You also need to install the `wasm-bindgen` CLI:

```bash
cargo install wasm-bindgen-cli
```

Install dependencies with your package manager of choice. e.g.

```bash
pnpm install
```

Then run the `build:core` script to build `livesplit-core` and generate the wasm + TypeScript bindings. These will go in `src/livesplit-core`.

```bash
pnpm run build:core
```

Now you can do the normal Angular stuff to build, run the dev server, etc.

Generic Angular info follows.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
