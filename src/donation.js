const donationOverlay = document.querySelector('#donationOverlay');
const donationCard = document.querySelector('#donationCard');
const donationName = document.querySelector('#donationName');
const donationAmount = document.querySelector('#donationAmount');
const donationText = document.querySelector('#donationText');

let settings = {};
let donationTimer;
let donationHideTimer;

const nameParts = [
  '민트', '구름', '새벽', '버튼', '제로', '라임', '달빛', '초코', '버섯', '연어',
  '도넛', '수박', '감자', '고수', '회피', '에임', '킹', '냥', '불꽃', '바람'
];
const nameSuffixes = ['장인', '빌런', '요정', '모드', '99', '777', 'TV', '짱', '러버', ''];

const donationMessages = [
  '짜라랑~ 이 장면 클립 갑시다',
  '오늘 폼 미쳤어요',
  '방금 플레이 보고 후원 안 할 수가 없네',
  '다음 판도 갑시다',
  '이 텐션 유지해주세요',
  '편집자님 여기입니다',
  '보스전 응원합니다'
];

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomName() {
  return `${pick(nameParts)}${pick(nameSuffixes)}`;
}

function playDonationSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const audio = new AudioContextClass();
  const start = audio.currentTime;
  const notes = [1046.5, 1318.5, 1568, 2093];

  notes.forEach((frequency, index) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'triangle';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start + index * 0.08);
    gain.gain.linearRampToValueAtTime(0.12, start + index * 0.08 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + index * 0.08 + 0.24);
    osc.connect(gain).connect(audio.destination);
    osc.start(start + index * 0.08);
    osc.stop(start + index * 0.08 + 0.26);
  });

  setTimeout(() => audio.close(), 900);
}

function randomDonationAmount() {
  const min = Number(settings.donationMinAmount || 1000);
  const max = Math.max(min, Number(settings.donationMaxAmount || 20000));
  const raw = min + Math.floor(Math.random() * (max - min + 1));
  return Math.max(1000, Math.round(raw / 1000) * 1000);
}

function showDonation() {
  if (!settings.donationEnabled) return;
  donationName.textContent = randomName();
  donationAmount.textContent = `${randomDonationAmount().toLocaleString('ko-KR')}원 후원!`;
  donationText.textContent = pick(donationMessages);
  donationCard.classList.add('show');
  playDonationSound();
  clearTimeout(donationHideTimer);
  donationHideTimer = setTimeout(() => {
    donationCard.classList.remove('show');
  }, Number(settings.donationDurationSec || 6) * 1000);
}

function scheduleDonation() {
  clearInterval(donationTimer);
  if (!settings.donationEnabled) return;
  const minutes = Math.max(1, Number(settings.donationIntervalMinutes || 3));
  donationTimer = setInterval(showDonation, minutes * 60 * 1000);
}

function applySettings(nextSettings) {
  const scheduleChanged =
    nextSettings.donationEnabled !== settings.donationEnabled ||
    Number(nextSettings.donationIntervalMinutes) !== Number(settings.donationIntervalMinutes);

  settings = { ...settings, ...nextSettings };
  donationOverlay.style.setProperty('--donation-opacity', String(Number(settings.donationOpacity || 0) / 100));
  if (scheduleChanged || !donationTimer) scheduleDonation();
}

window.streamChat.onApplySettings(applySettings);
window.streamChat.onManualDonation(showDonation);

window.streamChat.getDefaults().then((defaults) => {
  applySettings(defaults);
});
