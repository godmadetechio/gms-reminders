const fetch = require('node-fetch');

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID  = process.env.SLACK_CHANNEL_ID;
const CALL_LINK   = 'https://ro.am/join/kgfonwwx-dbfqysjw';

const reminderType = process.argv[2];

if (!SLACK_TOKEN || !CHANNEL_ID) {
  console.error('❌  Missing SLACK_BOT_TOKEN or SLACK_CHANNEL_ID env vars');
  process.exit(1);
}
if (!['3hr', '1hr', '5min'].includes(reminderType)) {
  console.error('❌  Usage: node index.js 3hr | 1hr | 5min');
  process.exit(1);
}

// Updated schedule — matches GMS Call Schedule
const CALLS = {
  1: { name: 'Discovery Mastery',   lead: 'Isaac',        access: 'ALL'      },
  2: { name: 'Sales Training',      lead: 'Jaka',         access: 'ALL'      },
  3: { name: 'Objection Gauntlet',  lead: 'Isaac',        access: 'ALL'      },
  4: { name: 'Hiring & Placement',  lead: 'Jackson',      access: 'ALL'      },
  5: { name: 'Pitch Perfect + AMA', lead: 'Piotr',        access: 'ALL'      },
  6: { name: 'Game Tape Day',       lead: 'Senior Coach', access: 'FOUNDERS' },
  0: { name: 'Mindset & Health',    lead: 'Christian',    access: 'FOUNDERS' },
};

// Resolve today's day in UK time (Railway runs in UTC)
const ukDateStr = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', weekday: 'short' });
const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const ukDay  = dayMap[ukDateStr.trim()];

const call = CALLS[ukDay];
if (!call) {
  console.log(`ℹ️  No GMS call today. Nothing sent.`);
  process.exit(0);
}

const accessTag = call.access === 'FOUNDERS' ? ' *(Founders Club)*' : '';

const MESSAGES = {
  '3hr':  `⏰ *Reminder — 3 hours to go!*\n*${call.name}*${accessTag} kicks off at 6:00pm UK\nLead: ${call.lead}\n🔗 ${CALL_LINK}`,
  '1hr':  `🔔 *1 hour left — get ready!*\n*${call.name}*${accessTag} starts at 6:00pm UK\nLead: ${call.lead}\n🔗 ${CALL_LINK}`,
  '5min': `🚨 *5 MINUTES — WE ARE LIVE!* 🚨\n*${call.name}*${accessTag} is starting NOW\nLead: ${call.lead}\n👉 Jump in: ${CALL_LINK}`,
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
