// Entry point for the bundled build.
//
// app.js uses React/ReactDOM as globals (CDN-era convention). We import them
// from npm and assign to window.* before app.js runs.
// IMPORTANT: dynamic import() is used for app.js so the window assignments
// above execute FIRST (static imports are hoisted, dynamic are not).
//
// Capacitor plugins (LocalNotifications, Share) are registered here so they
// are available as window.CapacitorLocalNotifications / window.CapacitorShare
// inside app.js, which accesses them via window.Capacitor.Plugins.*
// On the native Android WebView, window.Capacitor is already injected by the
// native bridge before this JS runs — registerPlugin() hooks into that.
// On the web, the plugin returns graceful "unavailable" stubs.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Share } from '@capacitor/share';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

window.React = React;
window.ReactDOM = ReactDOM;

// Expose plugins so app.js can access them without needing its own imports.
// app.js reads window.Capacitor.Plugins.* which is the standard Capacitor
// global bridge pattern — this ensures they are registered before app.js runs.
// (The plugins call registerPlugin() internally on import, which registers
// them with the native bridge; we also expose them explicitly for safety.)
window._PrashamaPlugins = { LocalNotifications, Share, TextToSpeech };

import('./app.js');
