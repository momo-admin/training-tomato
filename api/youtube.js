export default async function handler(req, res) {
  // Vercelの環境変数からキーを読み込む（ブラウザからは絶対に見えない）
  const API_KEY = process.env.VITE_TomatoYoutubeAPI;
  const CHANNEL_ID = 'UC1YDj4nSuCIpHmv984mdggQ';
  
  // 3日前の日付を計算
  const now = new Date();
  const threeDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
  threeDaysAgo.setHours(0, 0, 0, 0);
  const publishedAfter = threeDaysAgo.toISOString();

  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&publishedAfter=${publishedAfter}&type=video`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // ブラウザに結果を返す
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
