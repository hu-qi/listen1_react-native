/* eslint no-bitwise: ["error", { "allow": ["&"] }] */
import queryString from 'query-string';

import AsyncStorage from '@react-native-async-storage/async-storage';

class MyStorage {
  static setData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      // console.log(error);
    }

    return null;
  };
  static getData = async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      // console.log(error);
      return null;
    }
  };
  static deleteData = async (key) => {
    try {
      return await AsyncStorage.removeItem(key);
    } catch (error) {
      // console.log(error);

      return null;
    }
  };
}

async function requestAPI(url, data, refreshToken = false) {
  const token = await getToken(refreshToken);
  return fetch(url, {
    method: 'get',
    headers: {
      referer: 'https://www.kuwo.cn/',
      csrf: token,
      Cookie: 'kw_token=' + token,
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    },
  })
    .then((response) => {
      // console.log('response', response);
      return response.json();
    })
    .then((response) => {
      if (response.success === false) {
        return requestAPI(url, data, true);
      }
      return response;
    })
    .catch(() => {
      // console.error(error);
    });
}
function getSmallImageUrl(url) {
  return `${url}?param=140y140`;
}
function showPlaylist(offset) {
  const url = `https://www.kuwo.cn/www/categoryNew/getPlayListInfoUnderCategory?type=taglist&digest=10000&id=37&start=${
    offset * 30
  }&count=30`;

  return fetch(url)
    .then((response) => {
      return response.json();
    })
    .then(({ data }) => {
      if (!data[0]) {
        return { result: [], hasNextPage: false };
      }
      const result = data[0].data.map((item) => ({
        cover_img_url: item.img,
        title: item.name,
        id: `kwplaylist_${item.id}`,
        source_url: `https://www.kuwo.cn/playlist/index?pid=${item.id}`,
      }));
      return { result, hasNextPage: true };
    })
    .catch(() => {
      // console.error(error);
    });
}
function getNEScore(song) {
  if (!song) {
    return 0;
  }
  const privilege = song.privilege;

  if (song.program) {
    return 0;
  }

  if (privilege) {
    if (privilege.st != null && privilege.st < 0) {
      return 100;
    }
    if (
      privilege.fee > 0 &&
      privilege.fee !== 8 &&
      privilege.payed === 0 &&
      privilege.pl <= 0
    ) {
      return 10;
    }
    if (
      privilege.fee === 16 ||
      (privilege.fee === 4 && privilege.flag & 2048)
    ) {
      return 11;
    }
    if (
      (privilege.fee === 0 || privilege.payed) &&
      privilege.pl > 0 &&
      privilege.dl === 0
    ) {
      return 1e3;
    }
    if (privilege.pl === 0 && privilege.dl === 0) {
      return 100;
    }

    return 0;
  }

  if (song.status >= 0) {
    return 0;
  }
  if (song.fee > 0) {
    return 10;
  }

  return 100;
}

function isPlayable(song) {
  return getNEScore(song) < 100;
}

function convert(allowAll) {
  return (songInfo) => ({
    id: `netrack_${songInfo.id}`,
    title: songInfo.name,
    artist: songInfo.ar[0].name,
    artist_id: `neartist_${songInfo.ar[0].id}`,
    album: songInfo.al.name,
    album_id: `nealbum_${songInfo.al.id}`,
    source: 'netease',
    source_url: `https://music.163.com/#/song?id=${songInfo.id}`,
    img_url: getSmallImageUrl(songInfo.al.picUrl),
    url: `netrack_${songInfo.id}`,
    disabled: allowAll ? false : !isPlayable(songInfo),
  });
}

function getPlaylist(playlistId) {
  const list_id = playlistId.split('_')[0];
  const d = playlistId.split('_').pop();
  switch (list_id) {
    case 'kwplaylist':
      return kw_get_playlist(d);
    // case 'kwalbum':
    //   return kw_album(d);
    // case 'kwartist':
    //   return kw_artist(d);
    default:
      return null;
  }
}

async function kw_get_playlist(playlistId) {
  const target_url = `https://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pn=0&rn=200&encode=utf-8&keyset=pl2012&pcmp4=1&pid=${playlistId}&vipver=MUSIC_9.0.2.0_W1&newver=1`;

  return await fetch(target_url)
    .then((response) => {
      return response.json();
    })
    .then(async (data) => {
      const info = {
        cover_img_url: data.pic,
        title: data.title,
        id: `kwplaylist_${data.id}`,
        source_url: `https://www.kuwo.cn/playlist/index?pid=${data.id}`,
      };

      const tracks = data.musiclist.map((t) =>
        kw_render_playlist_result_item(t)
      );
      return { info, tracks };
    });
}

function html_decode(str) {
  return str.replace(/(&nbsp;)/g, ' ');
}

function kw_render_playlist_result_item(item) {
  const tracks = {
    id: `kwtrack_${item.id}`,
    title: html_decode(item.name),
    artist: item.artist,
    artist_id: `kwartist_${item.artistid}`,
    album: html_decode(item.album),
    album_id: `kwalbum_${item.albumid}`,
    source: 'kuwo',
    source_url: `https://www.kuwo.cn/yinyue/${item.id}`,
    img_url: '',
    url: `xmtrack_${item.id}`,
    lyric_url: item.id,
  };
  const target_url = `https://artistpicserver.kuwo.cn/pic.web?type=rid_pic&pictype=url&size=240&rid=${item.id}`;
  fetch(target_url)
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      tracks.img_url = data;
    });
  return tracks;
}

function bootstrapTrack(trackId) {
  const songId = trackId.slice('kwtrack_'.length);

  const target_url = `${
    'https://antiserver.kuwo.cn/anti.s?' +
    'type=convert_url&format=mp3&response=url&rid='
  }${songId}`;

  return fetch(target_url, {
    headers: {
      referer: 'https://www.kuwo.cn/',
    },
  })
    .then((res) => {
      return res.text();
    })
    .then((res) => {
      return res;
    });
}

async function getToken(refresh) {
  const kgKey = 'kw_token';
  // let tokenString = await MyStorage.getData(kgKey);
  // if (tokenString && !refresh) {
  //   return JSON.parse(tokenString);
  // }
  const token_url = 'https://www.kuwo.cn/';
  const response = await fetch(token_url);
  const setCookieField = response.headers.get('set-cookie');
  // console.log(response.headers.get('set-cookie'));
  const token = getCookieValue(setCookieField, 'kw_token');
  await MyStorage.setData(kgKey, JSON.stringify(token));
  return token;
}

function getCookieValue(cookie, key) {
  const regex = new RegExp(`${key}=([^;]+);`);
  const result = regex.exec(cookie);

  if (result !== null && result.length > 1) {
    return result[1];
  }

  return null;
}

async function search(keyword, curpage) {
  // const target_url = `https://www.kuwo.cn/api/www/search/searchMusicBykeyWord?key=${keyword}&pn=${curpage}&rn=30`;
  const target_url = `https://www.kuwo.cn/search/searchMusicBykeyWord?all=${keyword}&pn=${curpage}&rn=30&vipver=1&client=kt&ft=music&cluster=0&strategy=2012&encoding=utf8&rformat=json&mobi=1&issubtitle=1&show_copyright_off=1`;

  return requestAPI(target_url).then((data) => {
    // console.log('data', data.abslist[0]);
    let tracks = data.abslist.map((item) => {
      const musicrid = item.DC_TARGETID;
      const track = {
        id: `kwtrack_${musicrid}`,
        title: html_decode(item.NAME),
        artist: item.ARTIST,
        artist_id: `kwartist_${item.ARTISTID}`,
        album: html_decode(item.ALBUM),
        album_id: `kwalbum_${item.ALBUMID}`,
        source: 'kuwo',
        source_url: `https://www.kuwo.cn/yinyue/${musicrid}`,
        img_url: item.web_artistpic_short? `https://img1.kuwo.cn/star/starheads/${item.web_artistpic_short}` : `https://img2.kuwo.cn/star/albumcover/${item.web_albumpic_short}`,
        url: `xmtrack_${musicrid}`,
        lyric_url: musicrid,
      };
      return track;
    });
    return { result: tracks, total: data.abslist.length };
  });
}

function parseUrl(url) {
  let result = null;

  const r = /\/\/music\.163\.com\/playlist\/([0-9]+)/g.exec(url);

  if (r !== null) {
    return {
      type: 'playlist',
      id: `neplaylist_${r[1]}`,
    };
  }

  if (
    url.search('//music.163.com/#/m/playlist') !== -1 ||
    url.search('//music.163.com/#/playlist') !== -1 ||
    url.search('//music.163.com/playlist') !== -1 ||
    url.search('//music.163.com/#/my/m/music/playlist') !== -1
  ) {
    const parsed = queryString.parseUrl(url);

    result = {
      type: 'playlist',
      id: `neplaylist_${parsed.query.id}`,
    };
  }

  return result;
}

const meta = { name: '酷我', platformId: 'kw', enName: 'kuwo' };

export default {
  meta,
  showPlaylist,
  getPlaylist,
  bootstrapTrack,
  search,
  parseUrl,
};
