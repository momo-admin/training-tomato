let workoutDebt = Number(localStorage.getItem('workoutDebt')) || 0;
let moneySchedule = Number(localStorage.getItem('moneySchedule')) || 0;
let moneyTotal = Number(localStorage.getItem('moneyTotal')) || 0;
let dateContinuation = Number(localStorage.getItem('dateContinuation')) || 1;
let lastUpdateDate = localStorage.getItem('lastUpdateDate') || "";
let workoutMinutes = 0;

// YouTube Data API設定
const API_KEY = 'AIzaSyA0w8EBurxGe264lBzBxRG-bsHdE3nI_iU'; 
const CHANNEL_ID = 'UCt0yUptX9oR2T28Ua54pD3g'; // とまとなべさんのID

async function fetchYesterdayVideos() {
  const container = document.getElementById('videoList');
  
  // 昨日の日付（0時0分0秒）を計算
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const publishedAfter = yesterday.toISOString(); 

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&publishedAfter=${publishedAfter}&type=video`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      container.innerHTML = '<p style="text-align:center;">昨日の投稿はありません</p>';
      return;
    }

    container.innerHTML = data.items.map(v => `
      <div class="video-item" onclick="window.open('https://youtube.com/watch?v=${v.id.videoId}')">
        <img src="${v.snippet.thumbnails.medium.url}">
        <p>${v.snippet.title}</p>
      </div>
    `).join('');

  } catch (error) {
    container.innerHTML = '<p style="text-align:center;">動画の取得に失敗しました</p>';
  }
}

// iPhone用タブ切り替え
document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('.tab-btn a');
  const contents = document.querySelectorAll('.tab-contents-item');

  tabs[0].classList.add('is-active');
  contents[0].classList.add('is-active');

  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('is-active'));
      contents.forEach(c => c.classList.remove('is-active'));

      this.classList.add('is-active');
      const target = document.querySelector(targetId);
      target.classList.add('is-active');

      if(targetId === '#menu2') fetchYesterdayVideos();
    });
  });
  updateDisplay();
});

// 筋トレ・貯金ロジック
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
  document.getElementById('todayWorkout').innerText = workoutMinutes;
  document.getElementById('debtWorkout').innerText = workoutDebt;
  document.getElementById('scheduleMoney').innerText = moneySchedule;
  document.getElementById('totalMoney').innerText = moneyTotal;
  document.getElementById('continuationDate').innerText = dateContinuation;
}
