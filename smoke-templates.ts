import { renderCard, templates } from './index.js'
import { writeFileSync } from 'node:fs'

const F = '"Hiragino Sans GB"'

// ── listCard ──────────────────────────────────────────────────────────────────
const list = await renderCard(templates.listCard({
  title: '睡前必做的 5 件事',
  subtitle: '坚持一个月，整个人都会不一样',
  items: [
    { title: '写下明天三件最重要的事', desc: '清空大脑，不带焦虑入睡' },
    { title: '手机放到床外充电', desc: '减少蓝光干扰，提升睡眠质量' },
    { title: '拉伸 10 分钟', desc: '放松一天积累的肌肉紧张' },
    { title: '回顾今天一件感恩的事', desc: '培养积极心态，平衡情绪' },
    { title: '固定时间上床', desc: '稳定生物钟，越睡越好' },
  ],
  accentColor: '#FF6B9D',
  fontFamily: F,
}))
writeFileSync('out-list.png', list)

// ── stepCard ──────────────────────────────────────────────────────────────────
const step = await renderCard(templates.stepCard({
  title: '如何快速学会一项新技能',
  subtitle: '亲测有效的 4 步学习法',
  steps: [
    { title: '明确目标', desc: '用一句话描述你想达到的程度，越具体越好' },
    { title: '找到最小可行练习', desc: '把技能拆解成可以每天 15 分钟练习的单元' },
    { title: '刻意练习 + 即时反馈', desc: '专注练习薄弱环节，每次练习后复盘' },
    { title: '输出倒逼输入', desc: '教别人或公开展示，是最快的提升方式' },
  ],
  accentColor: '#818cf8',
  fontFamily: F,
}))
writeFileSync('out-step.png', step)

// ── diaryCard ─────────────────────────────────────────────────────────────────
const diary = await renderCard(templates.diaryCard({
  date: '2024.03.30',
  weekday: '周六',
  weather: '晴天',
  mood: '开心',
  content: '今天去了城郊的咖啡馆，点了一杯燕麦拿铁，坐在落地窗边读了两个小时的书。\n\n下午去公园散步，发现路边的樱花开了，粉粉嫩嫩的，忍不住拍了好多照片。\n\n傍晚和朋友视频聊了很久，分享了最近读的书，感觉整个人都充满了能量。',
  dayCount: 47,
  totalDays: 100,
  tags: ['日记', '打卡', '慢生活'],
  fontFamily: F,
}))
writeFileSync('out-diary.png', diary)

// ── gradientTextCard ──────────────────────────────────────────────────────────
const grad1 = await renderCard(templates.gradientTextCard({
  mainText: '你已经很努力了',
  subText: '不必事事完美，给自己一点温柔',
  caption: '今日份鼓励',
  bgGradient: 'aurora',
  fontFamily: F,
}))
writeFileSync('out-grad-aurora.png', grad1)

const grad2 = await renderCard(templates.gradientTextCard({
  mainText: '好事\n即将\n发生',
  bgGradient: 'night',
  textColor: '#fbbf24',
  caption: '相信自己',
  fontFamily: F,
}))
writeFileSync('out-grad-night.png', grad2)

console.log('✓ out-list.png')
console.log('✓ out-step.png')
console.log('✓ out-diary.png')
console.log('✓ out-grad-aurora.png')
console.log('✓ out-grad-night.png')
