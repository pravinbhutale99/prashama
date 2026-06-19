// Entry point for the bundled build.
//
// app.js (the actual Prashama application) was written assuming React and
// ReactDOM are available as global variables — that was true when they were
// loaded via <script> tags from a CDN. To bundle everything locally without
// touching a single line of app.js, we import the real npm packages here
// and attach them to `window` ourselves, replicating exactly what the CDN
// scripts used to do. app.js is then imported immediately after, so by the
// time it runs, `React`/`ReactDOM` already exist as globals exactly as before.

import React from 'react';
import ReactDOM from 'react-dom/client';

window.React = React;
window.ReactDOM = ReactDOM;

import './app.js';
