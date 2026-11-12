/**
 * embed — responsive video player (live canon cmp-embed--youtube on /de/Service: a 16:9 YouTube
 * iframe across the column). New block (cluster-landing).
 *
 * Authoring: one paragraph with a link to the video's embed URL
 *   (`https://www.youtube.com/embed/<id>`); the link text is the player title (iframe title),
 *   the link title the accessible name the source gives the player (iframe aria-label).
 *
 * @ew-exempt <p> video source link (cell 1) — config, replaced by the player
 * @variants block class: none
 */
const YT = /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{6,})/;

export default function decorate(block) {
  const a = block.querySelector('a[href]');
  if (!a) return;
  const m = a.href.match(YT);
  const src = m
    ? `https://www.youtube.com/embed/${m[1]}?rel=0&hl=de&cc_lang_pref=de&cc_load_policy=1`
    : a.href;
  const frame = document.createElement('div');
  frame.className = 'embed-frame';
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = a.textContent.trim() || 'Video';
  if (a.title) iframe.setAttribute('aria-label', a.title);
  iframe.loading = 'lazy';
  iframe.allow = [
    'accelerometer', 'autoplay', 'clipboard-write', 'encrypted-media', 'gyroscope',
    'picture-in-picture', 'web-share',
  ].join('; ');
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allowFullscreen = true;
  frame.append(iframe);
  block.replaceChildren(frame);
}
