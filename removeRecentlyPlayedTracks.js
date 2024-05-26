/*
 * Spicetify Remove Recently Played Tracks from Playlist
 *
 * MIT License
 *
 * Copyright (c) 2024 Gomeschian
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *-----------------------------------------------------------------------------
 * This Spicetify extension was created by heavily modifying the following Spicetify extension (enormous thanks):
 *
 * NAME: Feature Shuffle
 * AUTHOR: CharlieS1103
 * DESCRIPTION: Create a playlist based on the average features of a playlist
 *
 * Found at: https://github.com/CharlieS1103/spicetify-extensions
 *
 * Original MIT License:
 *
 * MIT License
 *
 * Copyright (c) 2021 CharlieS1103
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function removeRecentlyPlayedTracks() {
  const {
    CosmosAsync,

    URI,
  } = Spicetify;
  if (!(CosmosAsync && URI)) {
    setTimeout(removeRecentlyPlayedTracks, 300);
    return;
  }

  const MAX_RECENT_TRACKS_REQUESTABLE = 50; // Spotify Get Recently Played API max tracks per request (https://developer.spotify.com/documentation/web-api/reference/get-recently-played)
  const API_DELAY = 5000; // Artificial delay in milliseconds between API calls

  const buttontxt = "Remove recently played tracks";

  async function reducePlaylist(uris) {
    // Definitions

    async function getRecentlyPlayedTrackURIs() {
      const numberOfRecentlyPlayedTracks = MAX_RECENT_TRACKS_REQUESTABLE;

      const response = await CosmosAsync.get(
        "https://api.spotify.com/v1/me/player/recently-played",
        {
          limit: numberOfRecentlyPlayedTracks,
          before: new Date().getTime(), // Current time as a unicode timestamp
        }
      );
      console.log("Recently played tracks (full details):", response);
      const recentlyPlayedTracks = response.items;
      // Console log recently played tracks artist - name (album name)
      console.log(
        "Recently played tracks artist - name (album name):",
        recentlyPlayedTracks.map(
          (recentlyPlayedTrack) =>
            recentlyPlayedTrack.track.artists[0].name +
            " - " +
            recentlyPlayedTrack.track.name +
            " (" +
            recentlyPlayedTrack.track.album.name +
            ")"
        )
      );
      const recentlyPlayedTrackURIs = recentlyPlayedTracks.map(
        (recentlyPlayedTrack) => recentlyPlayedTrack.track.uri
      );

      return recentlyPlayedTrackURIs;
    }

    /* Can be used to read the playlist's tracks at the expense of an extra API call. Only gets the first 20 as is (https://developer.spotify.com/documentation/web-api/reference/get-playlists-tracks).

    async function getPlaylistTrackURIs() {
      const uri = uris[0];
      const uriFinal = uri.split(":")[2];

      const response = await CosmosAsync.get(
        "https://api.spotify.com/v1/playlists/" + uriFinal + "/tracks"
      );

      const playlistTracks = response.items;

      const playlistTrackURIs = playlistTracks.map(
        (playlistTrack) => playlistTrack.track.uri
      );

      return playlistTrackURIs;
    }
    */

    async function deleteTracksFromPlaylist() {
      const recentlyPlayedTrackURIs = await getRecentlyPlayedTrackURIs();
      const jsonURIs = JSON.stringify({
        tracks: recentlyPlayedTrackURIs.map((uri) => ({ uri: uri })),
      });

      const uri = uris[0];
      const uriFinal = uri.split(":")[2]; // Get Playlist ID

      const requestURL = `https://api.spotify.com/v1/playlists/${uriFinal}/tracks`;
      const response = await CosmosAsync.del(requestURL, jsonURIs);
      console.log(response);
      if (!response.snapshot_id) {
        throw new Error("Deletion request failed");
      }
      return response;
    }

    // Execution

    Spicetify.showNotification(
      "Removing recently played tracks (wait ~5 seconds)..."
    );
    await new Promise((resolve) => setTimeout(resolve, API_DELAY));

    deleteTracksFromPlaylist()
      .then(() => {
        Spicetify.showNotification("Removed recently played tracks");
      })
      .catch((error) => {
        console.error(error);
        Spicetify.showNotification("Failed to remove recently played tracks");
      });
  }

  function shouldDisplayContextMenu(uris) {
    if (uris.length > 1) {
      return false;
    }

    const uri = uris[0];
    const uriObj = Spicetify.URI.fromString(uri);

    if (uriObj.type === Spicetify.URI.Type.PLAYLIST_V2) {
      return true;
    }

    return false;
  }

  const cntxMenu = new Spicetify.ContextMenu.Item(
    buttontxt,
    reducePlaylist,
    shouldDisplayContextMenu
  );

  cntxMenu.register();
})();
