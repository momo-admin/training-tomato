// 保存されているデータを取得
let workoutDebt = Number(localStorage.getItem('workoutDebt')) || 0;
let moneySchedule = Number(localStorage.getItem('moneySchedule')) || 0;
let moneyTotal = Number(localStorage.getItem('moneyTotal')) || 0;
let dateContinuation = Number(localStorage.getItem('dateContinuation')) || 1;
let lastUpdateDate = localStorage.getItem('lastUpdateDate') || "";

let workoutMinutes = 0;

window.onload = function() {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  
  if (lastUpdateDate !== todayStr && lastUpdateDate !== "") {
    dateContinuation++;
    localStorage.setItem('dateContinuation', dateContinuation);
    localStorage.setItem('lastUpdateDate', todayStr);
  }
  updateDisplay();
};

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
    alert("サボりペナルティ！借金に計上しました。");
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
}

function updateDisplay() {
  document.getElementById('todayWorkout').innerText = workoutMinutes;
  document.getElementById('debtWorkout').innerText = workoutDebt;
  document.getElementById('scheduleMoney').innerText = moneySchedule;
  document.getElementById('totalMoney').innerText = moneyTotal;
  document.getElementById('continuationDate').innerText = dateContinuation;
}

// タブ切り替え機能
$(function() {
    $('#tab-btn .btn:first-of-type a').addClass("is-active");
    $('#tab-contents .tab-contents-item:first-of-type').addClass("is-active");
    
    $('#tab-btn a').click(function(){
        $('#tab-btn a').removeClass("is-active");
        $(this).addClass("is-active");
        $('#tab-contents .tab-contents-item').removeClass("is-active");
        $($(this).attr('data-tab')).addClass("is-active");
        return false;
    });
});
