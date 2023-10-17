import { Song } from "../models/song"

class SpotifyHandler extends Handler {
    constructor() {
        this.prev_track_id = undefined
    }

    listenSong() {
        this._getPlaybackState()
            .then(this._handlePlaybackState)
            .then(temp => {
                console.log(temp)
            })
            .catch(err => {
                console.log(err)
            })
    }

    getAccessToken() {
        return fetch("https://open.spotify.com/get_access_token")
            .then(response => response.json())
            .then(access => access.accessToken);
    }

    _getPlaybackState() {
        return this.getAccessToken()
            .then(accessToken =>
                fetch("https://api.spotify.com/v1/me/player", {
                    method: "GET",
                    headers: new Headers({
                        'Authorization': 'Bearer ' + accessToken,
                    })
                }))
            .then(response => response.json())
    }

    _handlePlaybackState(state) {
        if (state.currently_playing_type == "track") {
            let track = state.item
            if (state.progress_ms == null || state.progress_ms < MIN_LISTEN_TIME) {
                setTimeout(handleNewState, MIN_LISTEN_TIME + 1)
                return Promise.reject("Not satisfy MIN_LISTEN_TIME")
            }
            else if (this.prev_track_id != track.id) {
                this.prev_track_id = track.id
                return Promise.resolve(new Song(track.name, track.album.name, track.artists.map(artist => artist.name), track.external_ids.isrc))
            }
        }
        return Promise.reject("Invalid Playback state to consider")
    }
}
