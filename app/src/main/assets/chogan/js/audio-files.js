/* چوگان: میراث پارس — فهرست فایل‌های صوتی اختیاری
   برای استفاده از صداهای ضبط‌شدهٔ خودت (به‌جای صدای سنتز شده)،
   فایل صوتی را در پوشهٔ audio/sfx/ بگذار و خط مربوطه را از کامنت خارج کن.
   قالب پیشنهادی: OGG Vorbis (اندروید) یا MP3، تک‌کاناله، ۴۴۱۰۰ هرتز.

مثال:
window.CH_AUDIO_FILES = {
  goal:    'audio/sfx/goal.ogg',
  whistle: 'audio/sfx/whistle.ogg',
  hit:     'audio/sfx/hit.ogg',
  swing:   'audio/sfx/swing.ogg',
  coin:    'audio/sfx/coin.ogg',
  click:   'audio/sfx/click.ogg',
  quest:   'audio/sfx/quest.ogg'
};

صدای دیالوگ‌های گوینده‌ها به‌صورت خودکار از مسیر audio/vo/<شناسه‌خط>.ogg
خوانده می‌شود (مثال: audio/vo/ch1_grand_01.ogg) — فهرست کامل شناسه‌ها در
فایل «chogan-dialogues.md» آمده است.
*/
window.CH_AUDIO_FILES = {};
