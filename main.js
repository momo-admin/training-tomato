// --- 状態管理 ---
let workoutDebt = Number(localStorage.getItem('workoutDebt')) || 0;
let moneySchedule = Number(localStorage.getItem('moneySchedule')) || 0;
let moneyTotal = Number(localStorage.getItem('moneyTotal')) || 0;
let dateContinuation = Number(localStorage.getItem('dateContinuation')) || 1;
let lastUpdateDate = localStorage.getItem('lastUpdateDate') || ""; // 動画取得日の記録
let workoutMinutes = 0;

/**
 * YouTube動画取得（1日1回だけAPIを叩くエコ仕様）
 */
async function fetchYesterdayVideos() {
  const container = document.getElementById('videoList');
  if (!container) return;

  const STORAGE_KEY = 'cached_videos';
  // 日本時間(JST)で今日の日付を取得
  const nowJST = new Date(Date.now() + (9 * 60 * 60 * 1000));
  const todayStr = nowJST.toISOString().split('T')[0];

  // 1. ストレージ確認：今日すでに取得済みならキャッシュを使う
  const cachedData = localStorage.getItem(STORAGE_KEY);
  if (lastUpdateDate === todayStr && cachedData) {
    console.log("ストレージから動画を読み込みました");
    renderVideos(JSON.parse(cachedData));
    return;
  }

  // 2. API呼び出し：日付が違う、またはキャッシュがない場合のみ
  console.log("APIから新しい動画を取得します");
  try {
    const response = await fetch('/api/youtube');
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      container.innerHTML = '<p style="text-align:center; grid-column: span 2;">最近の投稿はありません</p>';
      return;
    }

    // データの保存
    localStorage.setItem('lastUpdateDate', todayStr);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.items));
    lastUpdateDate = todayStr;

    renderVideos(data.items);

  } catch (error) {
    console.error("通信エラー:", error);
    // エラーでもキャッシュがあれば一応出す
    if (cachedData) {
      renderVideos(JSON.parse(cachedData));
    } else {
      container.innerHTML = '<p style="text-align:center; grid-column: span 2;">動画を読み込めませんでした</p>';
    }
  }
}

/**
 * 動画の描画処理（2列デザイン対応）
 */
function renderVideos(items) {
  const container = document.getElementById('videoList');
  if (!container) return;

  container.innerHTML = items.map(v => {
    const videoId = v.id.videoId;
    const title = v.snippet.title;
    const thumb = v.snippet.thumbnails.medium.url;

    // iPhoneでアプリっぽく開くための設定
    return `
      <div class="video-item" onclick="window.location.href='https://www.youtube.com/watch?v=${videoId}'">
        <img src="${thumb}" alt="thumbnail">
        <p>${title}</p>
      </div>
    `;
  }).join('');
}

// --- 初期化処理 ---
document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('.tab-btn a');
  const contents = document.querySelectorAll('.tab-contents-item');

  // 初期タブの設定
  if(tabs[0]) tabs[0].classList.add('is-active');
  if(contents[0]) contents[0].classList.add('is-active');

  // タブ切り替えイベント
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('data-tab');
      
      tabs.forEach(t => t.classList.remove('is-active'));
      contents.forEach(c => c.classList.remove('is-active'));
      
      this.classList.add('is-active');
      const target = document.querySelector(targetId);
      if(target) target.classList.add('is-active');
      
      // 動画タブが選ばれた時だけ関数を実行
      if(targetId === '#menu2') fetchYesterdayVideos();
    });
  });

  updateDisplay();
});

// --- ロジック関数 ---
function addPost() { 
  workoutMinutes += 10; 
  moneySchedule += 100; 
  saveAndSync(); 
  updateDisplay(); 
}

function doWorkout() {
  if (workoutMinutes > 0) {
    workoutMinutes = Math.max(0, workoutMinutes - 10);
  } else if (workoutDebt > 0) {
    workoutDebt = Math.max(0, workoutDebt - 10);
  }
  saveAndSync(); 
  updateDisplay();
}

function skipWork() {
  if (workoutMinutes > 0) {
    workoutDebt += Math.ceil(workoutMinutes * 1.5);
    workoutMinutes = 0; 
    alert("サボりペナルティ！債務が増えました");
    saveAndSync(); 
    updateDisplay();
  }
}

function doPayment() { 
  moneyTotal += moneySchedule; 
  moneySchedule = 0; 
  saveAndSync(); 
  updateDisplay(); 
}

function saveAndSync() {
  localStorage.setItem('workoutDebt', workoutDebt);
  localStorage.setItem('moneySchedule', moneySchedule);
  localStorage.setItem('moneyTotal', moneyTotal);
  // lastUpdateDate は fetchYesterdayVideos 内で保存されるためここでは不要
}

function updateDisplay() {
  const ids = {
    'todayWorkout': workoutMinutes,
    'debtWorkout': workoutDebt,
    'scheduleMoney': moneySchedule,
    'totalMoney': moneyTotal,
    'continuationDate': dateContinuation
  };

  for (const [id, value] of Object.entries(ids)) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
  }
}

// HTMLのonclickから呼べるようにwindowオブジェクトに登録
window.addPost = addPost;
window.doWorkout = doWorkout;
window.skipWork = skipWork;
window.doPayment = doPayment;