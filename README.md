# PEDAL

DISCLAIMER : This is not a completed project, it is currently a work in progress

## Huge Shoutout
I'd like to give a huge shoutout to the original creators of this repository for all that they did to make a game similar to Mario Kart running on the web using React and Three.js. It's really an amazing project.

## What did I do to this repo?
My step was to strip it down to the bear bones. I mostly just need the logic for kart and the models for the track and the Kart. I've removed several of the additional features like drifting, collision, and multiplayer compatability. With hopes of adding some of that again for the future.

## Why in the world would you do that?
Well aren't you just a nosey person? Jokes. My objective is to create a game that will connecto to my stationary bike trainer. That way I can hook my bike up to the internet and race on a track similar to MarioKart. Because I mean, how dope is that? 

## What is Pedal?
Pedal is a browser-based, Mario Kart–styled bike trainer. It makes indoor biking feel like a game.

## How does it work
You can still creep forward with the “W” key, but Pedal is built for a stationary trainer (like a Wahoo KICKR Core). Turn it on, click “Connect,” pick your trainer, and it links over Web Bluetooth to stream live power and cadence. Your watts drive kart speed—the harder you pedal, the faster you go.

## How it was made
Inspired by https://github.com/mustache-dev/Mario-Kart-3.js, then forked to simplify physics, hook up a bike, and build custom tracks. The site uses React + Vite with Three.js via React Three Fiber for 3D rendering.

## TO - DO
- [x] Get rid of drifing, multiplayer and collision logic
- [x] Create a basic straight track
- [x] Wire up a spline on the straight track that the Kart will follow
- [x] Get the Kart to follow the spline
- [x] Add capability for bluetooth connection
- [x] Add logic to determine speed based on the bike pedaling
- [x] Add button to watch a demo
- [ ] Add logic for laps and a timer to be able to do time trials and races
- [ ] Redo pedal logo
- [ ] Add Strava integration
- [ ] Create more tracks and give the user the option to select which one they want to ride on
- [ ] Add customizability to the kart
- [ ] Add Supabase to add authentication and a database for the customized karts and times for the time trials
- [ ] Switch the Kart model to be a bike
- [ ] and work up from there!

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
