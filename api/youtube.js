export default async function handler(req, res) {
  const API_KEY = process.env.VITE_TomatoYoutubeAPI;
  const CHANNEL_ID = 'UC1YDj4nSuCIpHmv984mdggQ';
  
  // --- 日本時間(JST)ベースでの「昨日」を計算 ---
  const nowJST = new Date(Date.now() + (9 * 60 * 60 * 1000)); // 現在時刻に9時間足す
  
  // 「昨日」の00:00:00 (JST)
  const yesterdayStart = new Date(nowJST.getFullYear(), nowJST.getMonth(), nowJST.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);
  // UTCに戻してAPIに送る必要があるため、さらに9時間引く
  const publishedAfter = new Date(yesterdayStart.getTime() - (9 * 60 * 60 * 1000)).toISOString();
  
  // 「昨日」の23:59:59 (JST)
  const yesterdayEnd = new Date(nowJST.getFullYear(), nowJST.getMonth(), nowJST.getDate() - 1);
  yesterdayEnd.setHours(23, 59, 59, 999);
  const publishedBefore = new Date(yesterdayEnd.getTime() - (9 * 60 * 60 * 1000)).toISOString();

  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&publishedAfter=${publishedAfter}&publishedBefore=${publishedBefore}&type=video`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
