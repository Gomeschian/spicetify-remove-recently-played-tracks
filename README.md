# Spicetify Remove Recently Played Tracks from Playlist

Spicetify context menu extension that removes from the selected playlist any tracks among the user's 50 most recently played, per Spotify's Web API Get Recently Played Tracks endpoint (https://developer.spotify.com/documentation/web-api/reference/get-recently-played). Very gratefully created using Feature Shuffle by CharlieS1103 as a template (https://github.com/CharlieS1103/spicetify-extensions).

![sample](/sample1.png)
![sample](/sample2.png)

## Manual Installation

1. Install Spicetify: (https://spicetify.app/docs/getting-started)
2. Download removeRecentlyPlayedTracks.js and put it in the Spicetify Extensions folder (https://spicetify.app/docs/advanced-usage/extensions)
3. Open a terminal and run: spicetify config extensions removeRecentlyPlayedTracks.js
4. In the terminal, run: spicetify apply

## Updating

1. Download the new version of removeRecentlyPlayedTracks.js and put it in the Spicetify Extensions folder, overwriting the old version
2. Open a terminal and run: spicetify apply

## Manual Uninstallation

1. Open a terminal and run: spicetify config extensions removeRecentlyPlayedTracks.js-
2. In the terminal, run: spicetify apply
3. Delete removeRecentlyPlayedTracks.js from the Spicetify Extensions folder (if not deleted it will still no longer load in Spicetify at this point)

## Usage

Right click a playlist, or left click the three dots on an open playlist, to bring up the context menu, and select "Remove recently played tracks".

A notification should appear to indicate that the script has started. After completion, another notification will appear indicating success or failure.

There is an artificial delay of five seconds to limit API calls, so running should take about five seconds.

## Notes

This will only work on playlists you own.

The recently played tracks list is per the Web API endpoint linked above. The results seem to differ from both the list you can see in the Spotify desktop app and the one on mobile, which seem to differ from each other as well...

To see the list of recently played tracks referenced, you can open the console by pressing ctrl+shift+i in Spicetify after opening a terminal and running: spicetify enable-devtools. You can also use this other Spicetify extension to make a playlist of the tracks: https://github.com/Gomeschian/spicetify-playlist-from-recently-played-tracks
