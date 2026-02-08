//保存されているデータを取得
let workoutDebt = Number(localStorage.getItem('workoutDebt')) || 0; //借金
let moneySchedule = Number(localStorage.getItem('moneySchedule')) || 0; //入金予定
let moneyTotal = Number(localStorage.getItem('moneyTotal')) || 0; //累計
let dateContinuation = Number(localStorage.getItem('dateContinuation')) || 1; //継続日数
let lastUpdateDate = localStorage.getItem('lastUpdateDate') || ""; //最終実行日

let workoutMinutes = 0; //今日分

//画面読み込み時処理
window.onload = function() {
  //日付取得
  const dateDisplay = document.getElementById('yesterdayDate'); //HTML要素
  const now = new Date(); //今日日付
  const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`; //形式変換
  
  if (dateDisplay) {
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1); //昨日日付取得
    dateDisplay.innerText = `${yesterday.getMonth() + 1}/${yesterday.getDate()}`; //形式変換
  }
  
  //継続日数カウント
  if (lastUpdateDate !== todayStr) {
    if (lastUpdateDate !== "") {
      dateContinuation++;
      
      if (workoutMinutes > 0) {
        const result = confirm(`昨日分のノルマが ${workoutMinutes}分 残っています。\nペナ(1.5倍)を加えて借金に回しますか？`);
        
        if (result) {
          workoutDebt += Math.ceil(workoutMinutes * 1.5);
          workoutMinutes = 0;
          alert("昨日の残りを借金に計上しました。");
        } else {
          alert("昨日分のノルマを継続します。今日中に終わらせましょう！");
        }
      }
    }
    
    //ここに機能分は借金ですか？的な質問をすればいいのね
    skipWork(); //前日分の残りを借金とする
    
    localStorage.setItem('lastUpdateDate', todayStr); //最終実行日
    localStorage.setItem('dateContinuation', dateContinuation); //継続日数
  }
  
  updateDisplay(); //画面表示更新処理
};

//手動追加
function addPost() {
  workoutMinutes += 10; //
  moneySchedule += 100;
  saveAndSync();
  updateDisplay();
}

//借金ボタン
function skipWork() {
  if (workoutMinutes > 0) {
    //借金していいのか注意文表示したい
    workoutDebt += Math.ceil(workoutMinutes * 1.5);
    workoutMinutes = 0;
    alert("サボりペナルティ！ノルマが1.5倍になりました。"); //借金しちゃった画面
    saveAndSync();
    updateDisplay();
  }
}

//10分減らすボタン
function doWorkout() {
  if (workoutMinutes > 0) {
    workoutMinutes = Math.max(0, workoutMinutes - 10);
  } else if (workoutDebt > 0) {
    workoutDebt = Math.max(0, workoutDebt - 10);
  }
  saveAndSync();
  updateDisplay();
}

//入金ボタン
function doPayment() {
  moneyTotal += moneySchedule;
  moneySchedule = 0;
  saveAndSync();
  updateDisplay();
}

//データの保存処理
function saveAndSync() {
  localStorage.setItem('workoutDebt', workoutDebt); //借金
  localStorage.setItem('moneySchedule', moneySchedule); //入金予定
  localStorage.setItem('moneyTotal', moneyTotal); //累計
}

//画面表示更新処理
function updateDisplay() {
  //HTML要素取得
  const todayWorkoutDisplay = document.getElementById('todayWorkout'); //今日分
  const debtWorkoutDisplay = document.getElementById('debtWorkout'); //借金
  const scheduleMoneyDisplay = document.getElementById('scheduleMoney'); //入金予定
  const totalMoneyDisplay = document.getElementById('totalMoney'); //累計
  const continuationDateDisplay = document.getElementById('continuationDate'); //継続日数
  
  //内容置き換え
  if (todayWorkoutDisplay) todayWorkoutDisplay.innerText = workoutMinutes;
  if (debtWorkoutDisplay) debtWorkoutDisplay.innerText = workoutDebt;
  if (scheduleMoneyDisplay) scheduleMoneyDisplay.innerText = moneySchedule;
  if (totalMoneyDisplay) totalMoneyDisplay.innerText = moneyTotal;
  if (continuationDateDisplay) continuationDateDisplay.innerText = dateContinuation;
}
