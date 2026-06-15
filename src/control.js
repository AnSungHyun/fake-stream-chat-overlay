const rangeIds = [
  'chatPopulation',
  'intervalMs',
  'animationSpeed',
  'maxMessages',
  'opacity',
  'fontSize',
  'viewerCount',
  'viewerVariance',
  'donationIntervalMinutes',
  'donationDurationSec',
  'donationOpacity',
  'donationMinAmount',
  'donationMaxAmount'
];
const checkboxIds = [
  'alwaysOnTop',
  'clickThrough',
  'compactMode',
  'showViewerCount',
  'showPlatformIcon',
  'randomNameColors',
  'donationEnabled'
];
const platforms = ['youtube', 'chzzk', 'soop'];
const tones = ['hype', 'question', 'gameplay', 'casual'];

let settings = {};

function byId(id) {
  return document.getElementById(id);
}

function formatValue(id, value) {
  if (id === 'intervalMs' || id === 'animationSpeed') return `${value}ms`;
  if (id === 'donationIntervalMinutes') return `${value}분`;
  if (id === 'donationDurationSec') return `${value}초`;
  if (id === 'opacity' || id === 'donationOpacity' || id.includes('Percent')) return `${value}%`;
  if (id === 'fontSize') return `${value}px`;
  if (id.includes('Amount')) return `${Number(value).toLocaleString('ko-KR')}원`;
  return Number(value).toLocaleString('ko-KR');
}

function syncOutputs() {
  rangeIds.forEach((id) => {
    const input = byId(id);
    const output = document.querySelector(`output[for="${id}"]`);
    if (output) output.value = formatValue(id, input.value);
  });
}

function collectSettings() {
  const next = { ...settings };
  rangeIds.forEach((id) => {
    next[id] = Number(byId(id).value);
  });
  checkboxIds.forEach((id) => {
    next[id] = byId(id).checked;
  });
  next.platforms = {};
  platforms.forEach((platform) => {
    next.platforms[platform] = byId(`platform-${platform}`).checked;
  });
  next.tones = {};
  tones.forEach((tone) => {
    next.tones[tone] = byId(`tone-${tone}`).checked;
  });
  next.keywords = byId('keywords').value;
  next.streamerName = byId('streamerName').value;
  if (next.donationMaxAmount < next.donationMinAmount) {
    next.donationMaxAmount = next.donationMinAmount;
    byId('donationMaxAmount').value = next.donationMaxAmount;
  }
  return next;
}

function publish() {
  settings = collectSettings();
  syncOutputs();
  localStorage.setItem('fake-stream-chat-settings', JSON.stringify(settings));
  window.streamChat.updateSettings(settings);
}

function hydrate(nextSettings) {
  settings = nextSettings;
  rangeIds.forEach((id) => {
    byId(id).value = settings[id];
  });
  checkboxIds.forEach((id) => {
    byId(id).checked = Boolean(settings[id]);
  });
  platforms.forEach((platform) => {
    byId(`platform-${platform}`).checked = Boolean(settings.platforms[platform]);
  });
  tones.forEach((tone) => {
    byId(`tone-${tone}`).checked = Boolean(settings.tones[tone]);
  });
  byId('keywords').value = settings.keywords;
  byId('streamerName').value = settings.streamerName;
  syncOutputs();
}

function wireInputs() {
  [...rangeIds, ...checkboxIds].forEach((id) => {
    byId(id).addEventListener('input', publish);
    byId(id).addEventListener('change', publish);
  });

  platforms.forEach((platform) => {
    byId(`platform-${platform}`).addEventListener('change', publish);
  });
  tones.forEach((tone) => {
    byId(`tone-${tone}`).addEventListener('change', publish);
  });

  byId('keywords').addEventListener('input', publish);
  byId('streamerName').addEventListener('input', publish);

  byId('burstButton').addEventListener('click', () => window.streamChat.sampleBurst());
  byId('resetButton').addEventListener('click', () => window.streamChat.resetOverlay());
  byId('visibilityButton').addEventListener('click', () => window.streamChat.toggleVisibility());
  byId('recenterButton').addEventListener('click', () => window.streamChat.recenterOverlay());
  byId('donationButton').addEventListener('click', () => window.streamChat.manualDonation());
  byId('donationRecenterButton').addEventListener('click', () => window.streamChat.recenterDonation());
}

async function boot() {
  const defaults = await window.streamChat.getDefaults();
  const saved = localStorage.getItem('fake-stream-chat-settings');
  const parsed = saved ? JSON.parse(saved) : {};
  hydrate({
    ...defaults,
    ...parsed,
    platforms: { ...defaults.platforms, ...(parsed.platforms || {}) },
    tones: { ...defaults.tones, ...(parsed.tones || {}) }
  });
  wireInputs();
  publish();
}

boot();
