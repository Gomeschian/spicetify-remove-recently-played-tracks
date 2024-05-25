(function removeRecentlyPlayedTracks() {
  const {
    CosmosAsync,

    URI,
  } = Spicetify;
  if (!(CosmosAsync && URI)) {
    setTimeout(removeRecentlyPlayedTracks, 300);
    return;
  }

  const MAX_RECENT_TRACKS_REQUESTABLE = 50; // Spotify Get Recently Played Tracks max tracks per request (https://developer.spotify.com/documentation/web-api/reference/get-recently-played)

  const buttontxt = "Remove Recently Played Tracks";

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
      const recentlyPlayedTracks = response.items;
      const recentlyPlayedTrackURIs = recentlyPlayedTracks.map(
        (recentlyPlayedTrack) => recentlyPlayedTrack.track.uri
      );

      return recentlyPlayedTrackURIs;
    }

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

    async function deleteTracksFromPlaylist() {
      const playlistTrackURIs = await getRecentlyPlayedTrackURIs();
      console.log("uris to delete", playlistTrackURIs);
      const uri = uris[0];
      const uriFinal = uri.split(":")[2];
      console.log(`https://api.spotify.com/v1/playlists/${uriFinal}/tracks`);
      const response = await CosmosAsync.del(
        `https://api.spotify.com/v1/playlists/${uriFinal}/tracks`,
        {
          tracks: playlistTrackURIs,
        }
      );

      console.log(response);
      return response;
    }
    // Execution
    const recentlyPlayedTrackURIs = await getRecentlyPlayedTrackURIs();

    const playlistTrackURIs = await getPlaylistTrackURIs();
    // console log list of tracks in common between the two lists
    const intersection = playlistTrackURIs.filter((value) =>
      recentlyPlayedTrackURIs.includes(value)
    );
    console.log("intersection", intersection);

    await deleteTracksFromPlaylist();
    Spicetify.showNotification("Removed Recently Played Tracks");
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
