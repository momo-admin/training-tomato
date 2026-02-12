export default async function handler(req, res) {
  const API_KEY = process.env.VITE_TomatoYoutubeAPI;
  const CHANNEL_ID = 'UC1YDj4nSuCIpHmv984mdggQ';
  
  // チャンネルIDの2文字目を'U'に変えると「アップロード済み動画」のプレイリストIDになる
  const UPLOAD_PLAYLIST_ID = CHANNEL_ID.replace(/^UC/, 'UU');

  // searchではなく playlistItems を使う (100倍エコ)
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${UPLOAD_PLAYLIST_ID}&part=snippet&maxResults=10`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(data.error.code).json(data);
    }

    // --- ここで「昨日」の範囲を判定して絞り込む ---
    const nowJST = new Date(Date.now() + (9 * 60 * 60 * 1000));
    const yesterday = new Date(nowJST.getFullYear(), nowJST.getMonth(), nowJST.getDate() - 1);
    const targetDateStr = yesterday.toISOString().split('T')[0]; // "YYYY-MM-DD" 形式

    // 投稿日が「昨日」と一致するものだけを抽出
    const filteredItems = data.items.filter(item => {
      const publishedAt = item.snippet.publishedAt; // UTC時間
      const pubDateJST = new Date(new Date(publishedAt).getTime() + (9 * 60 * 60 * 1000));
      const pubDateStr = pubDateJST.toISOString().split('T')[0];
      return pubDateStr === targetDateStr;
    });

    // 構造を search API に似せて返すとフロントの修正が楽
    res.status(200).json({
      items: filteredItems.map(item => ({
        id: { videoId: item.snippet.resourceId.videoId },
        snippet: item.snippet
      }))
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}