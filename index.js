const fetch = require('node-fetch');

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID  = process.env.SLACK_CHANNEL_ID;
const CALL_LINK   = 'https://ro.am/join/kgfonwwx-dbfqysjw';

// Reminder type is passed as CLI arg by Railway cron
// e.g.  node index.js 3hr   |   node index.js 1hr   |   node index.js 5min
const reminderType = process.argv[2];

if (!SLACK_TOKEN || !CHANNEL_ID) {
  console.error('❌  Missing SLACK_BOT_TOKEN or SLACK_CHANNEL_ID env vars');
  process.exit(1);
}
if (!['3hr', '1hr', '5min'].includes(reminderType)) {
  console.error('❌  Usage: node index.js 3hr | 1hr | 5min');
  process.exit(1);
}

// All calls at 6:00pm UK — one call per weekday
const CALLS = {
  1: { name: 'Discovery Mastery',   lead: 'Isaac / Rotating' },
  2: { name: 'Pitch Perfect + AMA',                   lead: 'Piotr'            },
  3: { name: 'Objection Handling Gauntlet / Closing', lead: 'Isaac'            },
  4: { name: 'Sales Training',                        lead: 'Jaka'             },
  5: { name: 'Hiring Call',                           lead: 'Jackson'          },
};

// Resolve today's day in UK time (Railway runs in UTC)
const ukDateStr = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', weekday: 'short' });
const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5 };
const ukDay  = dayMap[ukDateStr.trim().split(',')[0]] ?? dayMap[ukDateStr.trim()];

const call = CALLS[ukDay];
if (!call) {
  console.log(`ℹ️  No GMS call today (UK day index: ${ukDay}). Nothing sent.`);
  process.exit(0);
}

const MESSAGES = {
  '3hr':  `⏰ *Reminder — 3 hours to go!*\n*${call.name}* kicks off at 6:00pm UK\nLead: ${call.lead}\n🔗 ${CALL_LINK}`,
  '1hr':  `🔔 *1 hour left — get ready!*\n*${call.name}* starts at 6:00pm UK\nLead: ${call.lead}\n🔗 ${CALL_LINK}`,
  '5min': `🚨 *5 MINUTES — WE ARE LIVE!* 🚨\n*${call.name}* is starting NOW\nLead: ${call.lead}\n👉 Jump in: ${CALL_LINK}`,
};

async function send() {
  const res  = await fetch('https://slack.com/api/chat.postMessage', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SLACK_TOKEN}` },
    body:    JSON.stringify({ channel: CHANNEL_ID, text: MESSAGES[reminderType], mrkdwn: true }),
  });
  const data = await res.json();
  if (!data.ok) { console.error('❌ Slack API error:', data.error); process.exit(1); }
  console.log(`✅ [${reminderType}] reminder sent → ${call.name}`);
}

send();
