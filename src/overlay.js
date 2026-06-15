const chatList = document.querySelector('#chatList');
const overlay = document.querySelector('#overlay');
const viewerStrip = document.querySelector('.viewer-strip');
const viewerCountElement = document.querySelector('#viewerCount');

let settings = {};
let messageTimer;
let viewerTimer;
let currentViewerCount = 127;
let chatters = [];

const nameParts = [
  '민트', '구름', '새벽', '버튼', '제로', '라임', '달빛', '초코', '버섯', '연어',
  '도넛', '수박', '감자', '고수', '회피', '에임', '킹', '냥', '불꽃', '바람'
];
const nameSuffixes = ['장인', '빌런', '요정', '모드', '99', '777', 'TV', '짱', '러버', ''];

const nameColors = ['#f97316', '#22c55e', '#38bdf8', '#f472b6', '#a78bfa', '#facc15', '#2dd4bf', '#fb7185', '#c4b5fd'];

const platformMeta = {
  youtube: { label: 'Y', className: 'youtube' },
  chzzk: { label: 'C', className: 'chzzk' },
  soop: { label: 'S', className: 'soop' }
};

const messagePools = {
  hype: [
    '와 이걸 사네', '미쳤다 진짜', '방금 뭐임?', '이건 클립각인데', '레전드 ㅋㅋㅋ',
    '소리 질렀다', '폼 올라왔다', '와 판단 빠르다', '방금 반응속도 뭐야', '이 맛에 보지'
  ],
  question: [
    '{streamer} 이거 무슨 캐릭이에요?', '지금 난이도 몇이에요?', '저 스킬 왜 안 써요?',
    '이거 패치 된 건가?', '다음 판 랭크 가나요?', '세팅 공유 가능?', '왜 저기로 가는 거예요?',
    '방금 아이템 뭐 먹은 거임?'
  ],
  gameplay: [
    '{keyword} 타이밍 좋았다', '{keyword} 각 보는 중', '지금 {keyword} 조심해야 됨',
    '상대 {keyword} 노리는 듯', '{keyword} 때문에 분위기 바뀜', '이 판은 {keyword} 싸움이다',
    '{keyword}만 넘기면 이긴다'
  ],
  casual: [
    '오늘 텐션 좋네', '편집본 기대된다', '처음 왔는데 재밌네요', '밥 먹으면서 보는 중',
    '오늘 몇 시까지 해요?', '채팅창 속도 좋다', '브금 좋다', '이 분위기 좋음',
    '다들 물 마시고 봐요'
  ]
};

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomName() {
  return `${pick(nameParts)}${pick(nameSuffixes)}`;
}

function enabledPlatforms() {
  const active = Object.entries(settings.platforms || {})
    .filter(([, enabled]) => enabled)
    .map(([platform]) => platform);
  return active.length ? active : ['youtube'];
}

function buildChatters() {
  const count = Math.max(1, Number(settings.chatPopulation || 34));
  chatters = Array.from({ length: count }, () => ({
    name: randomName(),
    color: pick(nameColors),
    platform: pick(enabledPlatforms())
  }));
}

function enabledTones() {
  const active = Object.entries(settings.tones || {})
    .filter(([, enabled]) => enabled)
    .map(([tone]) => tone);
  return active.length ? active : ['hype', 'question', 'gameplay', 'casual'];
}

function keywords() {
  return String(settings.keywords || '')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function buildText() {
  const tone = pick(enabledTones());
  const pool = messagePools[tone] || messagePools.hype;
  const keywordList = keywords();
  return pick(pool)
    .replaceAll('{streamer}', settings.streamerName || '형')
    .replaceAll('{keyword}', keywordList.length ? pick(keywordList) : '장면');
}

function addMessage(text = buildText()) {
  if (!chatters.length || chatters.length !== Number(settings.chatPopulation || 34)) {
    buildChatters();
  }
  const chatter = pick(chatters);
  const meta = platformMeta[chatter.platform] || platformMeta.youtube;
  const message = document.createElement('article');
  message.className = `message${settings.compactMode ? ' compact' : ''}`;

  const color = settings.randomNameColors ? chatter.color : '#e2e8f0';
  const badge = settings.showPlatformIcon
    ? `<span class="badge ${meta.className}">${meta.label}</span>`
    : '';

  message.innerHTML = `
    <div class="meta">
      ${badge}
      <span class="name" style="color:${color}">${chatter.name}</span>
    </div>
    <div class="text">${text}</div>
  `;

  chatList.appendChild(message);
  while (chatList.children.length > Number(settings.maxMessages || 38)) {
    chatList.removeChild(chatList.firstElementChild);
  }
}

function scheduleMessages() {
  clearInterval(messageTimer);
  messageTimer = setInterval(addMessage, Number(settings.intervalMs || 900));
}

function updateViewerCount() {
  const variance = Number(settings.viewerVariance || 0);
  const delta = Math.floor(Math.random() * (variance + 3)) - Math.floor(variance / 2);
  currentViewerCount = Math.max(0, currentViewerCount + delta);
  viewerCountElement.textContent = currentViewerCount.toLocaleString('ko-KR');
}

function scheduleViewerCount() {
  clearInterval(viewerTimer);
  currentViewerCount = Number(settings.viewerCount || 0);
  updateViewerCount();
  viewerTimer = setInterval(updateViewerCount, 1600);
}

function applySettings(nextSettings) {
  const populationChanged = Number(nextSettings.chatPopulation) !== Number(settings.chatPopulation);
  const platformsChanged = JSON.stringify(nextSettings.platforms || {}) !== JSON.stringify(settings.platforms || {});

  settings = { ...settings, ...nextSettings };
  if (populationChanged || platformsChanged || !chatters.length) {
    buildChatters();
  }

  overlay.style.setProperty('--panel-opacity', String(Number(settings.opacity || 0) / 100));
  overlay.style.setProperty('--font-size', `${settings.fontSize || 15}px`);
  overlay.style.setProperty('--animation-speed', `${settings.animationSpeed || 420}ms`);
  viewerStrip.classList.toggle('hidden', !settings.showViewerCount);
  scheduleMessages();
  scheduleViewerCount();
}

function resetChat() {
  chatList.replaceChildren();
}

function sampleBurst() {
  for (let index = 0; index < 12; index += 1) {
    setTimeout(() => addMessage(), index * 75);
  }
}

function setupResizeHandles() {
  document.querySelectorAll('[data-resize]').forEach((handle) => {
    handle.addEventListener('mousedown', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const direction = handle.dataset.resize;
      const startBounds = await window.streamChat.getOverlayBounds();
      if (!startBounds) return;
      const startX = event.screenX;
      const startY = event.screenY;

      function move(moveEvent) {
        const dx = moveEvent.screenX - startX;
        const dy = moveEvent.screenY - startY;
        const next = { ...startBounds };

        if (direction.includes('e')) next.width = Math.max(300, startBounds.width + dx);
        if (direction.includes('s')) next.height = Math.max(360, startBounds.height + dy);
        if (direction.includes('w')) {
          const width = Math.max(300, startBounds.width - dx);
          next.x = startBounds.x + startBounds.width - width;
          next.width = width;
        }
        if (direction.includes('n')) {
          const height = Math.max(360, startBounds.height - dy);
          next.y = startBounds.y + startBounds.height - height;
          next.height = height;
        }

        window.streamChat.setOverlayBounds(next);
      }

      function up() {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      }

      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    });
  });
}

window.streamChat.onApplySettings(applySettings);
window.streamChat.onResetChat(resetChat);
window.streamChat.onSampleBurst(sampleBurst);

setupResizeHandles();

window.streamChat.getDefaults().then((defaults) => {
  applySettings(defaults);
  sampleBurst();
});
