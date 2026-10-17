// Deterministic SVG diagrams for lesson markdown (```diagram fences).
// Three kinds cover what lessons need: `flow` (boxes + arrows), `steps`
// (numbered vertical guide) and `plot` (function graphs for math/physics).
// Everything is plain string SVG so the same input renders identically in
// the public lesson page, the dashboard preview and unit tests.

export type DiagramKind = 'flow' | 'steps' | 'plot';

const FONT = "Vazirmatn, Tahoma, sans-serif";
const PALETTE = ['#725bff', '#12b886', '#f59e0b', '#e25858'];

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function toLatinDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const code = digit.charCodeAt(0);
    const index = code >= 0x06f0 ? code - 0x06f0 : code - 0x0660;
    return String(index);
  });
}

/** `title|detail` boxes; arrows go right→left so the flow reads in RTL. */
function renderFlow(source: string) {
  const rows = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) =>
      line
        .split('->')
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .map((part) => {
          const [title, detail] = part.split('|').map((piece) => piece.trim());
          return { title, detail: detail || '' };
        }),
    )
    .filter((row) => row.length > 0);

  if (!rows.length) return '';

  const gap = 56;
  const box = (node: { title: string; detail: string }) => {
    const longest = Math.max(node.title.length, node.detail.length * 0.9);
    return {
      width: Math.max(116, Math.min(300, 24 + longest * 10)),
      height: node.detail ? 78 : 58,
    };
  };

  const rowWidths = rows.map((row) => {
    const boxes = row.map(box);
    return boxes.reduce((total, size) => total + size.width, 0) + gap * (row.length - 1);
  });
  const width = Math.max(560, Math.max(...rowWidths) + 56);
  const rowHeights = rows.map((row) => Math.max(...row.map((node) => box(node).height)));
  const rowGap = 46;
  const height = rowHeights.reduce((total, value) => total + value, 0) + rowGap * (rows.length - 1) + 36;

  const parts: string[] = [];
  parts.push(
    `<defs><marker id="codemage-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#7c6cf0"/></marker></defs>`,
  );

  let cursorY = 18;
  rows.forEach((row, rowIndex) => {
    const boxes = row.map(box);
    // RTL: the first node sits at the right edge.
    let cursorX = width - 28 - boxes[0].width;
    row.forEach((node, nodeIndex) => {
      const size = boxes[nodeIndex];
      const y = cursorY + (rowHeights[rowIndex] - size.height) / 2;
      const fill = nodeIndex === 0 ? '#725bff' : '#f4f2ff';
      const stroke = nodeIndex === 0 ? '#5b48e0' : '#c9c2f7';
      const ink = nodeIndex === 0 ? '#ffffff' : '#2f2a52';
      const detailInk = nodeIndex === 0 ? 'rgba(255,255,255,0.82)' : '#6b6590';
      parts.push(
        `<rect x="${cursorX}" y="${y}" width="${size.width}" height="${size.height}" rx="18" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`,
      );
      if (node.detail) {
        parts.push(
          `<text x="${cursorX + size.width / 2}" y="${y + 30}" text-anchor="middle" direction="rtl" style="font-family:${FONT};font-size:15px;font-weight:800;dominant-baseline:middle" fill="${ink}">${escapeXml(node.title)}</text>`,
          `<text x="${cursorX + size.width / 2}" y="${y + 55}" text-anchor="middle" direction="rtl" style="font-family:${FONT};font-size:11.5px;dominant-baseline:middle" fill="${detailInk}">${escapeXml(node.detail)}</text>`,
        );
      } else {
        parts.push(
          `<text x="${cursorX + size.width / 2}" y="${y + size.height / 2}" text-anchor="middle" direction="rtl" style="font-family:${FONT};font-size:15px;font-weight:800;dominant-baseline:middle" fill="${ink}">${escapeXml(node.title)}</text>`,
        );
      }

      const next = boxes[nodeIndex + 1];
      if (next) {
        const fromX = cursorX - 6;
        const toX = cursorX - gap + 6;
        const midY = cursorY + rowHeights[rowIndex] / 2;
        parts.push(
          `<line x1="${fromX}" y1="${midY}" x2="${toX}" y2="${midY}" stroke="#7c6cf0" stroke-width="2.5" marker-end="url(#codemage-arrow)"/>`,
        );
      }
      cursorX -= size.width + gap;
    });
    cursorY += rowHeights[rowIndex] + rowGap;
  });

  return `<svg class="lesson-diagram-svg" viewBox="0 0 ${width} ${height}" role="img" xmlns="http://www.w3.org/2000/svg" font-family="${FONT}">${parts.join('')}</svg>`;
}

/** `عنوان | توضیح` per line → a numbered vertical stepper. */
function renderSteps(source: string) {
  const items = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [title, detail] = line.split('|').map((piece) => piece.trim());
      return { title, detail: detail || '' };
    });

  if (!items.length) return '';

  const width = 720;
  const wrapAt = 52;
  const wrap = (text: string) => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      if (!current) current = word;
      else if (`${current} ${word}`.length <= wrapAt) current = `${current} ${word}`;
      else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [''];
  };
  const detailLines = items.map((item) => (item.detail ? wrap(item.detail) : []));
  const itemHeights = items.map((item, index) => 52 + detailLines[index].length * 22);
  const height = itemHeights.reduce((total, value) => total + value, 0) + 28;

  const parts: string[] = [];
  let y = 20;
  items.forEach((item, index) => {
    const centerY = y + 20;
    if (index < items.length - 1) {
      parts.push(`<line x1="${width - 34}" y1="${centerY + 22}" x2="${width - 34}" y2="${centerY + itemHeights[index] - 14}" stroke="#c9c2f7" stroke-width="2.5"/>`);
    }
    parts.push(
      `<circle cx="${width - 34}" cy="${centerY}" r="17" fill="${index === 0 ? '#725bff' : '#f4f2ff'}" stroke="#725bff" stroke-width="2"/>`,
      `<text x="${width - 34}" y="${centerY}" text-anchor="middle" style="font-family:${FONT};font-size:14px;font-weight:800;dominant-baseline:middle" fill="${index === 0 ? '#ffffff' : '#5b48e0'}">${index + 1}</text>`,
      `<text x="${width - 66}" y="${centerY}" text-anchor="end" direction="rtl" style="font-family:${FONT};font-size:15.5px;font-weight:800;dominant-baseline:middle" fill="#2f2a52">${escapeXml(item.title)}</text>`,
    );
    detailLines[index].forEach((line, lineIndex) => {
      parts.push(
        `<text x="${width - 66}" y="${centerY + 26 + lineIndex * 22}" text-anchor="end" direction="rtl" style="font-family:${FONT};font-size:12.5px;dominant-baseline:middle" fill="#6b6590">${escapeXml(line)}</text>`,
      );
    });
    y += itemHeights[index];
  });

  return `<svg class="lesson-diagram-svg" viewBox="0 0 ${width} ${height}" role="img" xmlns="http://www.w3.org/2000/svg" font-family="${FONT}">${parts.join('')}</svg>`;
}

// ── Plot: a tiny expression language so `y = x^2` works without dependencies ──

type Token = { type: 'num' | 'x' | 'const' | 'func' | 'op' | 'unary' | 'paren'; value: string };

function tokenizeExpression(source: string): Token[] {
  const text = toLatinDigits(source).replace(/\s+/g, '');
  const tokens: Token[] = [];
  let index = 0;
  while (index < text.length) {
    const rest = text.slice(index);
    const number = /^\d*\.?\d+/.exec(rest);
    if (number) {
      tokens.push({ type: 'num', value: number[0] });
      index += number[0].length;
      continue;
    }
    const name = /^[a-zA-Z]+/.exec(rest);
    if (name) {
      const word = name[0].toLowerCase();
      if (word === 'x') tokens.push({ type: 'x', value: 'x' });
      else if (word === 'pi' || word === 'e') tokens.push({ type: 'const', value: word });
      else tokens.push({ type: 'func', value: word });
      index += name[0].length;
      continue;
    }
    const character = text[index];
    if ('+-*/^'.includes(character)) tokens.push({ type: 'op', value: character });
    else if (character === '(' || character === ')') tokens.push({ type: 'paren', value: character });
    else throw new Error(`کاراکتر ناشناخته در فرمول: ${character}`);
    index += 1;
  }
  return tokens;
}

/** Shunting-yard → RPN → stack eval; throws on malformed input so the caller can skip. */
export function evaluateExpression(source: string, x: number): number {
  const tokens = tokenizeExpression(source);
  const output: Token[] = [];
  const stack: Token[] = [];
  // `u-` (unary minus) binds tighter than * / but looser than ^, so -x^2 = -(x^2).
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, 'u-': 3, '^': 4 };
  let previous: Token | null = null;

  for (const token of tokens) {
    if (token.type === 'num' || token.type === 'x' || token.type === 'const') {
      output.push(token);
    } else if (token.type === 'func') {
      stack.push(token);
    } else if (token.type === 'paren' && token.value === '(') {
      stack.push(token);
    } else if (token.type === 'paren') {
      while (stack.length && !(stack[stack.length - 1].type === 'paren')) output.push(stack.pop() as Token);
      if (!stack.length) throw new Error('پرانتز بسته بدون باز');
      stack.pop();
      if (stack.length && stack[stack.length - 1].type === 'func') output.push(stack.pop() as Token);
    } else {
      const unary = token.type === 'op' && token.value === '-'
        && (!previous || previous.type === 'op' || previous.type === 'unary' || (previous.type === 'paren' && previous.value === '('));
      const operator: Token = unary ? { type: 'unary', value: 'u-' } : token;
      const prec = precedence[operator.value];
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.type === 'func') {
          output.push(stack.pop() as Token);
          continue;
        }
        if (top.type !== 'op' && top.type !== 'unary') break;
        const topPrec = precedence[top.value];
        // ^ is right-associative; every other operator is left-associative.
        if (topPrec > prec || (topPrec === prec && operator.value !== '^')) output.push(stack.pop() as Token);
        else break;
      }
      stack.push(operator);
    }
    previous = token;
  }
  while (stack.length) {
    const token = stack.pop() as Token;
    if (token.type === 'paren') throw new Error('پرانتز باز بسته نشده');
    output.push(token);
  }

  const values: number[] = [];
  for (const token of output) {
    if (token.type === 'num') values.push(Number(token.value));
    else if (token.type === 'x') values.push(x);
    else if (token.type === 'const') values.push(token.value === 'pi' ? Math.PI : Math.E);
    else if (token.type === 'unary') {
      const argument = values.pop();
      if (argument === undefined) throw new Error('عملوند منفی‌ساز کم است');
      values.push(-argument);
    } else if (token.type === 'func') {
      const argument = values.pop();
      if (argument === undefined) throw new Error('آرگومان تابع کم است');
      const impl: Record<string, (value: number) => number> = {
        sin: Math.sin, cos: Math.cos, tan: Math.tan, sqrt: Math.sqrt, abs: Math.abs,
        ln: Math.log, log: Math.log10, exp: Math.exp, floor: Math.floor, ceil: Math.ceil,
      };
      const fn = impl[token.value];
      values.push(fn ? fn(argument) : NaN);
    } else {
      const right = values.pop();
      const left = values.pop();
      if (left === undefined || right === undefined) throw new Error('عملوند کم است');
      values.push(
        token.value === '+' ? left + right
          : token.value === '-' ? left - right
            : token.value === '*' ? left * right
              : token.value === '/' ? left / right
                : left ** right,
      );
    }
  }
  const [result] = values;
  return result;
}

function niceNumber(value: number) {
  if (!Number.isFinite(value)) return '';
  const rounded = Math.abs(value) >= 100 ? Math.round(value) : Math.round(value * 100) / 100;
  return String(rounded);
}

/** `y = x^2` lines + `domain:`/`range:` hints → a small Cartesian graph. */
function renderPlot(source: string) {
  const functions: Array<{ label: string; expression: string }> = [];
  let domain: [number, number] = [-5, 5];
  let range: [number, number] | null = null;
  let title = '';

  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const setting = /^(domain|range|title)\s*[:：]\s*(.+)$/i.exec(line);
    if (setting) {
      const [, key, value] = setting;
      if (key.toLowerCase() === 'title') title = value.trim();
      else {
        const bounds = value.split('..').map((piece) => Number(toLatinDigits(piece.trim())));
        if (bounds.length === 2 && bounds.every((bound) => Number.isFinite(bound))) {
          if (key.toLowerCase() === 'domain') domain = [bounds[0], bounds[1]];
          else range = [bounds[0], bounds[1]];
        }
      }
      continue;
    }
    const equation = /^(?:y\d*|f\s*\(\s*x\s*\))\s*=\s*(.+)$/i.exec(line);
    if (equation) {
      const expression = equation[1].trim();
      functions.push({ label: `y = ${expression}`, expression });
    }
  }
  if (!functions.length) return '';

  const width = 720;
  const height = 430;
  const padding = { top: 26, start: 26, end: 26, bottom: 34 };
  const plotWidth = width - padding.start - padding.end;
  const plotHeight = height - padding.top - padding.bottom;

  const samples = functions.map((fn) => {
    const points: Array<[number, number]> = [];
    for (let step = 0; step <= 240; step += 1) {
      const x = domain[0] + ((domain[1] - domain[0]) * step) / 240;
      let y = NaN;
      try {
        y = evaluateExpression(fn.expression, x);
      } catch {
        y = NaN;
      }
      points.push([x, y]);
    }
    return points;
  });

  let [yMin, yMax] = range || [NaN, NaN];
  if (!range) {
    const finite = samples.flat().map(([, y]) => y).filter((y) => Number.isFinite(y) && Math.abs(y) <= 60);
    yMin = finite.length ? Math.min(...finite) : -5;
    yMax = finite.length ? Math.max(...finite) : 5;
    if (yMax - yMin < 1e-6) {
      yMin -= 1;
      yMax += 1;
    }
    const paddingY = (yMax - yMin) * 0.12;
    yMin -= paddingY;
    yMax += paddingY;
  }

  const toScreenX = (x: number) => padding.start + ((x - domain[0]) / (domain[1] - domain[0])) * plotWidth;
  const toScreenY = (y: number) => padding.top + (1 - (y - yMin) / (yMax - yMin)) * plotHeight;

  const parts: string[] = [];
  parts.push(`<rect x="0" y="0" width="${width}" height="${height}" rx="22" fill="#fbfaff" stroke="#e6e1fa"/>`);

  for (let tick = 0; tick <= 4; tick += 1) {
    const xValue = domain[0] + ((domain[1] - domain[0]) * tick) / 4;
    const x = toScreenX(xValue);
    parts.push(`<line x1="${x}" y1="${padding.top}" x2="${x}" y2="${height - padding.bottom}" stroke="#ece8fa" stroke-width="1"/>`);
    parts.push(`<text x="${x}" y="${height - 12}" text-anchor="middle" style="font-family:${FONT};font-size:11px" fill="#8a83ad">${niceNumber(xValue)}</text>`);
    const yValue = yMin + ((yMax - yMin) * tick) / 4;
    const y = toScreenY(yValue);
    parts.push(`<line x1="${padding.start}" y1="${y}" x2="${width - padding.end}" y2="${y}" stroke="#ece8fa" stroke-width="1"/>`);
    parts.push(`<text x="${width - padding.end - 6}" y="${y - 5}" text-anchor="end" style="font-family:${FONT};font-size:11px" fill="#8a83ad">${niceNumber(yValue)}</text>`);
  }

  const axisColor = '#5b48e0';
  if (yMin <= 0 && yMax >= 0) {
    const yZero = toScreenY(0);
    parts.push(`<line x1="${padding.start}" y1="${yZero}" x2="${width - padding.end}" y2="${yZero}" stroke="${axisColor}" stroke-width="2"/>`);
    parts.push(`<path d="M ${padding.start} ${yZero} l 10 -5 v 10 z" fill="${axisColor}"/>`);
  }
  if (domain[0] <= 0 && domain[1] >= 0) {
    const xZero = toScreenX(0);
    parts.push(`<line x1="${xZero}" y1="${padding.top}" x2="${xZero}" y2="${height - padding.bottom}" stroke="${axisColor}" stroke-width="2"/>`);
    parts.push(`<path d="M ${xZero} ${height - padding.bottom} l -5 -10 h 10 z" fill="${axisColor}"/>`);
  }
  parts.push(`<text x="${width - padding.end}" y="${height - padding.bottom + 22}" text-anchor="end" style="font-family:${FONT};font-size:12px;font-weight:700" fill="${axisColor}">x</text>`);
  parts.push(`<text x="${padding.start + 8}" y="${padding.top + 4}" style="font-family:${FONT};font-size:12px;font-weight:700" fill="${axisColor}">y</text>`);

  samples.forEach((points, index) => {
    const color = PALETTE[index % PALETTE.length];
    let path = '';
    let penDown = false;
    for (const [x, y] of points) {
      if (!Number.isFinite(y) || y < yMin - (yMax - yMin) || y > yMax + (yMax - yMin)) {
        penDown = false;
        continue;
      }
      const command = penDown ? 'L' : 'M';
      path += `${command} ${toScreenX(x).toFixed(2)} ${toScreenY(y).toFixed(2)} `;
      penDown = true;
    }
    if (path) parts.push(`<path d="${path.trim()}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`);
    parts.push(
      `<rect x="${width - padding.end - 190}" y="${padding.top + 8 + index * 26}" width="14" height="14" rx="4" fill="${color}"/>`,
      `<text x="${width - padding.end - 202}" y="${padding.top + 15 + index * 26}" text-anchor="end" style="font-family:${FONT};font-size:12px;font-weight:700" fill="#2f2a52">${escapeXml(functions[index].label)}</text>`,
    );
  });

  if (title) {
    parts.push(`<text x="${width / 2}" y="18" text-anchor="middle" direction="rtl" style="font-family:${FONT};font-size:13px;font-weight:800" fill="#2f2a52">${escapeXml(title)}</text>`);
  }

  return `<svg class="lesson-diagram-svg" viewBox="0 0 ${width} ${height}" role="img" xmlns="http://www.w3.org/2000/svg" font-family="${FONT}">${parts.join('')}</svg>`;
}

/** Guess the kind when the fence says only ` ```diagram `. */
export function detectDiagramKind(source: string): DiagramKind {
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.some((line) => /^(domain|range)\s*[:：]/i.test(line) || /^(?:y\d*|f\s*\(\s*x\s*\))\s*=/i.test(line))) return 'plot';
  if (lines.every((line) => !line.includes('->') && line.includes('|'))) return 'steps';
  return 'flow';
}

export function diagramToSvg(source: string, kind?: string): string {
  const resolved: DiagramKind = kind === 'steps' || kind === 'plot' || kind === 'flow' ? kind : detectDiagramKind(source);
  const svg = resolved === 'plot' ? renderPlot(source) : resolved === 'steps' ? renderSteps(source) : renderFlow(source);
  return svg || `<pre dir="ltr"><code class="language-diagram">${escapeXml(source.trim())}</code></pre>`;
}
