//- 取得背景
function getBackground() {
    if (window.localStorage["randomImg"])
        return window.localStorage["randomImg"]
    else
        return "/og/og.png"
}
//- 取得封面
function getCover(type, info, artist_name, album_artist_name) {
    if (type == "album") {
        let q = ''
        q += info ? `&album_name=${encodeURIComponent(info)}` : ``
        q += artist_name ? `&artist_name=${encodeURIComponent(artist_name)}` : ``
        q += album_artist_name ? `&album_artist_name=${encodeURIComponent(album_artist_name)}` : `&album_artist_name=`
        let url = `/cover/album/` + ppEncode(q)
    } else {
        let url = `/cover/${encodeURIComponent(type)}/${encodeURIComponent(info)}`
    }
    if (window.localStorage["imgRes"] == "true")
        return getBackground()
    else
        return url
}

//- 取得歌詞
async function getLrc(artist, title) {
    let PARAMS_JSON = [
        { key: "additional", "value": "full_lyrics" },
        { key: "limit", "value": 1 }
    ]
    if (artist) PARAMS_JSON.push({ key: "artist", "value": artist })
    if (title) PARAMS_JSON.push({ key: "title", "value": title })
    let lrc = await getAPI("AudioStation/lyrics_search.cgi", "SYNO.AudioStation.LyricsSearch", "searchlyrics", PARAMS_JSON, 2)
    return lrc.data

}
async function getLrcByID(id) {
    let lrc = await getAPI("AudioStation/lyrics.cgi", "SYNO.AudioStation.Lyrics", "getlyrics", [{ key: "id", "value": id }], 2)
    return lrc.data
}


//- 取得歌曲連結
function getSong(song) {
    let id = song.id
    let res = window.localStorage["musicRes"]
    let bitrate = song.additional.song_audio.bitrate / 1000
    if (res == "wav" && bitrate > 320)
        res = "wav"
    else
        res = "original"
    return '/song/' + res + '/' + id
}

//- 取得專輯歌曲
async function getAlbumSong(album_name, album_artist_name, artist_name) {
    let PARAMS_JSON = [
        { key: "additional", "value": "song_tag,song_audio,song_rating" },
        { key: "library", "value": "shared" },
        { key: "limit", "value": 100000 },
        { key: "sort_by", "value": "title" },
        { key: "sort_direction", "value": "ASC" },
    ]
    if (album_name) PARAMS_JSON.push({ key: "album", "value": album_name })
    if (album_artist_name) PARAMS_JSON.push({ key: "album_artist", "value": album_artist_name })
    if (artist_name) PARAMS_JSON.push({ key: "artist", "value": artist_name })
    let info = await getAPI("AudioStation/song.cgi", "SYNO.AudioStation.Song", "list", PARAMS_JSON, 3)
    return info
}
//- 取得搜尋結果
async function searchAll(keyword) {
    let PARAMS_JSON = [
        { key: "additional", "value": "song_tag,song_audio,song_rating" },
        { key: "library", "value": "shared" },
        { key: "limit", "value": 1000 },
        { key: "sort_by", "value": "title" },
        { key: "sort_direction", "value": "ASC" },
        { key: "keyword", "value": keyword },
    ]
    let result = await getAPI("AudioStation/search.cgi", "SYNO.AudioStation.Search", "list", PARAMS_JSON, 1)
    return result.data
}
//- API 請求
async function getAPI(CGI_PATH, API_NAME, METHOD, PARAMS_JSON = [], VERSION = 1) {
    let PARAMS = ''
    for (i = 0; i < PARAMS_JSON.length; i++) {　
        PARAMS += '&' + PARAMS_JSON[i].key + '=' + encodeURIComponent(PARAMS_JSON[i].value)
    }
    let req_json = {
        "CGI_PATH": CGI_PATH,
        "API_NAME": API_NAME,
        "METHOD": METHOD,
        "VERSION": VERSION,
        "PARAMS": PARAMS
    }
    req_json = JSON.stringify(req_json)
    const response = await axios.get('/api/' + ppEncode(req_json));
    return response.data
}