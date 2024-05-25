(function removeRecentlyPlayedTracks() {
  const {
    CosmosAsync,

    URI,
  } = Spicetify;
  if (!(CosmosAsync && URI)) {
    setTimeout(removeRecentlyPlayedTracks, 300);
    return;
  }

  const buttontxt = "Remove Recently Played Tracks";

  async function reducePlaylist(uris) {
    async function getRecentlyPlayedTrackURIs() {
      const response = await CosmosAsync.get(
        "https://api.spotify.com/v1/me/player/recently-played",
        {
          limit: 50,
          before: new Date().getTime(), // Current time as a unicode timestamp
        }
      );
      console.log("Recently Played:", response);
      const recentlyPlayedTrackURIs = response.map((i) => i.items.track.uri);

      return recentlyPlayedTrackURIs;
    }

    async function getPlaylistTrackURIs() {
      const uri = uris[0];
      const uriFinal = uri.split(":")[2];

      const response = await CosmosAsync.get(
        "https://api.spotify.com/v1/playlists/" + uriFinal + "/tracks"
      );

      console.log("Playlist Tracks:", response);

      const playlistItems = response.map((i) => i.items.track.uri);

      return playlistItems;
    }

    async function removeRecentlyPlayedFromPlaylist() {
      async function removeTracksFromPlaylist() {
        const trackURIs = await getPlaylistTrackURIs();
        const uri = uris[0];
        const uriFinal = uri.split(":")[2];

        const response = await CosmosAsync.del(
          "https://api.spotify.com/v1/playlists/" + uriFinal + "/tracks",
          { tracks: trackURIs }
        );
      }

      return;
    }
    // Execution
    try {
      removeRecentlyPlayedFromPlaylist();
      Spicetify.showNotification("Removed Recently Played Tracks");
    } catch (e) {
      console.error(e);
      Spicetify.showNotification("Failed to remove Recently Played Tracks");
    }
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
