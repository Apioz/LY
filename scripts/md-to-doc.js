/**
 * 将 Markdown 转为 Word 可打开的 .doc（HTML 格式）
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const input = process.argv[2] || 'PRD-告警中心与设施工单'
const mdPath = path.join(__dirname, `../docs/${input}.md`)
const outPath = path.join(__dirname, `../docs/${input}.doc`)

const md = fs.readFileSync(mdPath, 'utf8')

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inlineFormat(s) {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

function mdToHtml(text) {
  const lines = text.split('\n')
  const out = []
  let inTable = false
  let tableRows = []

  const flushTable = () => {
    if (!tableRows.length) return
    out.push('<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">')
    tableRows.forEach((row, i) => {
      const tag = i === 1 && row.every((c) => /^-+$/.test(c.trim())) ? 'skip' : i === 0 ? 'th' : 'td'
      if (tag === 'skip') return
      const cellTag = i === 0 ? 'th' : 'td'
      out.push('<tr>' + row.map((c) => `<${cellTag}>${inlineFormat(c.trim())}</${cellTag}>`).join('') + '</tr>')
    })
    out.push('</table>')
    tableRows = []
    inTable = false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true
      const cells = line.slice(1, -1).split('|')
      if (cells.every((c) => /^-+$/.test(c.trim()))) continue
      tableRows.push(cells)
      continue
    } else if (inTable) {
      flushTable()
    }

    if (line.startsWith('# ')) {
      out.push(`<h1>${inlineFormat(line.slice(2))}</h1>`)
    } else if (line.startsWith('## ')) {
      out.push(`<h2>${inlineFormat(line.slice(3))}</h2>`)
    } else if (line.startsWith('### ')) {
      out.push(`<h3>${inlineFormat(line.slice(4))}</h3>`)
    } else if (line.startsWith('#### ')) {
      out.push(`<h4>${inlineFormat(line.slice(5))}</h4>`)
    } else if (line.startsWith('- ')) {
      out.push(`<li>${inlineFormat(line.slice(2))}</li>`)
    } else if (line.trim() === '---') {
      out.push('<hr/>')
    } else if (line.trim() === '') {
      out.push('<br/>')
    } else {
      out.push(`<p>${inlineFormat(line)}</p>`)
    }
  }
  if (inTable) flushTable()

  return out.join('\n')
}

const body = mdToHtml(md)

const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="Microsoft Word">
<title>告警中心与设施工单PRD</title>
<!--[if gte mso 9]><xml>
<w:WordDocument><w:View>Print</w:View></w:WordDocument>
</xml><![endif]-->
<style>
body { font-family: 宋体, SimSun, serif; font-size: 12pt; line-height: 1.6; margin: 2cm; }
h1 { font-size: 22pt; font-weight: bold; margin-top: 18pt; }
h2 { font-size: 16pt; font-weight: bold; margin-top: 14pt; border-bottom: 1px solid #ccc; padding-bottom: 4pt; }
h3 { font-size: 14pt; font-weight: bold; margin-top: 12pt; }
h4 { font-size: 12pt; font-weight: bold; margin-top: 10pt; }
p { margin: 6pt 0; }
table { margin: 10pt 0; font-size: 11pt; }
th { background: #f0f0f0; font-weight: bold; }
li { margin-left: 20pt; }
code { font-family: Consolas, monospace; background: #f5f5f5; padding: 1pt 4pt; }
hr { border: none; border-top: 1px solid #ddd; margin: 16pt 0; }
</style>
</head>
<body>
${body}
</body>
</html>`

fs.writeFileSync(outPath, '\ufeff' + doc, 'utf8')
console.log('Written:', outPath)
