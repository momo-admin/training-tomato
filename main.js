let workoutDebt = Number(localStorage.getItem('workoutDebt')) || 0;
let moneySchedule = Number(localStorage.getItem('moneySchedule')) || 0;
let moneyTotal = Number(localStorage.getItem('moneyTotal')) || 0;
let dateContinuation = Number(localStorage.getItem('dateContinuation')) || 1;
let lastUpdateDate = localStorage.getItem('lastUpdateDate') || "";
let workoutMinutes = 0;

// YouTube Data API設定
const API_KEY = import.meta.env.VITE_TomatoYoutubeAPI || ''; 
const CHANNEL_ID = 'UC1YDj4nSuCIpHmv984mdggQ'; // ﾄﾏﾀﾝのID

async function fetchYesterdayVideos() {
  const container = document.getElementById('videoList');
  if (!container) return;

  //判定範囲：一昨日の0時から
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
  const publishedAfter = yesterday.toISOString();

  try {
    // プレイリストIDではなく、チャンネルID指定の「検索(search)」に戻します
    // type=video にすることで、動画とライブアーカイブの両方を検索対象にします
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&publishedAfter=${publishedAfter}&type=video`;
    
    const response = await fetch(url);
    const data = await response.json();
    console.log("YouTubeデータ詳細(3日):", JSON.stringify(data, null, 2));

    if (data.error) {
      container.innerHTML = `<p style="color:red; font-size:12px;">理由: ${data.error.message}</p>`;
      return;
    }

    if (!data.items || data.items.length === 0) {
      container.innerHTML = '<p style="text-align:center;">昨日の投稿はありません</p>';
      return;
    }

    // 表示生成
    container.innerHTML = data.items.map(v => {
      const videoId = v.id.videoId;
      const title = v.snippet.title;
      const thumb = v.snippet.thumbnails.medium.url;

      return `
        <div class="video-item" onclick="window.open('https://youtube.com/watch?v=${videoId}')">
          <img src="${thumb}">
          <p>${title}</p>
        </div>
      `;
    }).join('');

  } catch (error) {
    container.innerHTML = '<p style="text-align:center;">通信エラーが発生しました</p>';
  }
}

// --- 以下、タブ切り替えとロジック（変更なし） ---

document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('.tab-btn a');
  const contents = document.querySelectorAll('.tab-contents-item');

  if(tabs[0]) tabs[0].classList.add('is-active');
  if(contents[0]) contents[0].classList.add('is-active');

  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('is-active'));
      contents.forEach(c => c.classList.remove('is-active'));
      this.classList.add('is-active');
      const target = document.querySelector(targetId);
      if(target) target.classList.add('is-active');
      if(targetId === '#menu2') fetchYesterdayVideos();
    });
  });
  updateDisplay();
});

function addPost() { workoutMinutes += 10; moneySchedule += 100; saveAndSync(); updateDisplay(); }
function doWorkout() {
  if (workoutMinutes > 0) workoutMinutes = Math.max(0, workoutMinutes - 10);
  else if (workoutDebt > 0) workoutDebt = Math.max(0, workoutDebt - 10);
  saveAndSync(); updateDisplay();
}
function skipWork() {
  if (workoutMinutes > 0) {
    workoutDebt += Math.ceil(workoutMinutes * 1.5);
    workoutMinutes = 0; alert("サボりペナルティ！");
    saveAndSync(); updateDisplay();
  }
}
function doPayment() { moneyTotal += moneySchedule; moneySchedule = 0; saveAndSync(); updateDisplay(); }
function saveAndSync() {
  localStorage.setItem('workoutDebt', workoutDebt);
  localStorage.setItem('moneySchedule', moneySchedule);
  localStorage.setItem('moneyTotal', moneyTotal);
}
function updateDisplay() {
  if(document.getElementById('todayWorkout')) document.getElementById('todayWorkout').innerText = workoutMinutes;
  if(document.getElementById('debtWorkout')) document.getElementById('debtWorkout').innerText = workoutDebt;
  if(document.getElementById('scheduleMoney')) document.getElementById('scheduleMoney').innerText = moneySchedule;
  if(document.getElementById('totalMoney')) document.getElementById('totalMoney').innerText = moneyTotal;
  if(document.getElementById('continuationDate')) document.getElementById('continuationDate').innerText = dateContinuation;
}

window.addPost = addPost;
window.doWorkout = doWorkout;
window.skipWork = skipWork;
window.doPayment = doPayment;
