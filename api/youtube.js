export default async function handler(req, res) {
  const API_KEY = process.env.VITE_TomatoYoutubeAPI;
  const CHANNEL_ID = 'UC1YDj4nSuCIpHmv984mdggQ';
  
  const now = new Date();
  
  // 昨日の 00:00:00
  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);
  
  // 昨日の 23:59:59
  const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  yesterdayEnd.setHours(23, 59, 59, 999);

  // publishedAfter（以降）と publishedBefore（以前）を両方指定する
  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&publishedAfter=${yesterdayStart.toISOString()}&publishedBefore=${yesterdayEnd.toISOString()}&type=video`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
