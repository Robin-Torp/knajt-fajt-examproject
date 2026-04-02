# Phaser Fighting Game - Knajt Fajt

[Hosted Version](https://knajt-fajt-host.vercel.app/)

[FIGMA](https://www.figma.com/design/AZcazDpaYfDsgHNqnUV0lu/Knajt-Fajt---Exam?node-id=0-1&t=mPvvLcTAUP3pgFnF-1)

---

## About The Project

This is a 2D fighting game built with Phaser inside a React + Vite setup. The project includes player controls, AI opponents, a combat system, visual effects, and a Supabase backend for authentication and leaderboard functionality.

The structure is split into clear parts:

* Phaser scenes (Boot, Preload, Menu, Fight, Pause)
* Game logic (combat, AI, fighters)
* Services (auth, leaderboard, audio storage)

---

## Tech Stack

### Frontend

* React (19.2.0)
* Vite
* Phaser (3.90.0)

### Backend

* Supabase

  * Authentication
  * Database (leaderboard)
  * Storage (audio)

---

## Dependencies

```json
{
  "@supabase/supabase-js"
  "phaser"
  "react"
  "react-dom"
}
```

---

## Getting Started

To run this project locally, you need to install dependencies and configure environment variables.

---

## Prerequisites

Make sure you have the following installed:

* Node.js (latest LTS recommended)
* npm or yarn
* A Supabase project

---
Installation

Clone the repository:

git clone https://github.com/Robin-Torp/knajt-fajt-examproject.git

Navigate into the project folder:

cd knajt-fajt-examproject

Install dependencies:

```bash
npm install @supabase/supabase-js phaser react-dom
```

---

## Environment Variables

Create a `.env` file in the root of the project and add:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

You can find these in your Supabase dashboard:

Settings → API

---

## Run Locally

Start the development server:

```bash
npm run dev
```

---

## Assets

The following assets are used in this project:

* Characters
  https://gandalfhardcore.itch.io/2d-pixel-art-male-and-female-character

* Environment
  https://gandalfhardcore.itch.io/free-pixel-art-sidescroller-asset-pack-32x32-overworld

* Music
  https://fablefly-music.itch.io/daydream-of-a-deity

* Sound Effects
  https://leohpaz.itch.io/minifantasy-dungeon-sfx-pack

* Canterbury Font
  https://www.1001fonts.com/canterbury-font.html

* Yoster Island Font
  https://www.1001fonts.com/yoster-island-font.html

---

## Notes

* Phaser runs inside a React environment via a custom setup
* Game logic is separated from rendering where possible
* Supabase is used for auth, leaderboard, and audio storage

---

## Future Improvement? (Most likely not)

* More characters with different difficulties 
* Improved AI behavior
* Multiplayer support

---

## Author

Robin 

---
