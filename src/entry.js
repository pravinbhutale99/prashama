// Entry point for the bundled build.
//
// app.js (the actual Prashama application) was written assuming React and
// ReactDOM are available as global variables — that was true when they were
// loaded via <script> tags from a CDN. To bundle everything locally without
// touching a single line of app.js, we import the real npm packages here
// and attach them to `window` ourselves, replicating exactly what the CDN
// scripts used to do.
//
// IMPORTANT: static `import` statements are hoisted above all other code by
// the JS spec, regardless of where they're written in the file. A previous
// version of this file wrote `import './app.js'` after the `window.React =
// ...` assignments, expecting it to run after them — but because static
// imports are hoisted, app.js actually executed FIRST, before window.React
// was ever set, causing "ReferenceError: React is not defined".
//
// Fix: use a dynamic import() for app.js. Dynamic imports are NOT hoisted —
// they run exactly where they appear in the code, as a normal expression.
// This guarantees window.React/window.ReactDOM are set before app.js loads.

import React from 'react';
import ReactDOM from 'react-dom/client';

window.React = React;
window.ReactDOM = ReactDOM;

import('./app.js');
