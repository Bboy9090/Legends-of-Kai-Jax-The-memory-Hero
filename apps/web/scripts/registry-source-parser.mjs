/** Restricted source reader, never a TypeScript evaluator. Validates dev/source assets. */
function tokenize(source) {
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    if (/\s/.test(source[i])) { i++; continue; }
    if (source.startsWith('//', i)) {
      const end = source.indexOf('\n', i + 2);
      i = end < 0 ? source.length : end; continue;
    }
    if (source.startsWith('/*', i)) {
      const end = source.indexOf('*/', i + 2);
      if (end < 0) throw new Error('Unterminated registry comment');
      i = end + 2; continue;
    }
    if (source[i] === '"' || source[i] === "'") {
      const quote = source[i++];
      let value = '', closed = false;
      while (i < source.length) {
        const c = source[i++];
        if (c === quote) { closed = true; break; }
        if (c === '\\') {
          const escaped = source[i++];
          const escapes = { n: '\n', r: '\r', t: '\t', '\\': '\\', '"': '"', "'": "'" };
          if (!Object.hasOwn(escapes, escaped)) throw new Error('Unsupported registry string escape');
          value += escapes[escaped];
        } else value += c;
      }
      if (!closed) throw new Error('Unterminated registry string');
      tokens.push({ kind: 'string', value }); continue;
    }
    const identifier = /^[A-Za-z_$][\w$]*/.exec(source.slice(i));
    if (identifier) {
      tokens.push({ kind: 'identifier', value: identifier[0] }); i += identifier[0].length; continue;
    }
    tokens.push({ kind: 'punctuation', value: source[i++] });
  }
  return tokens;
}

function splitTopLevel(tokens, separator = ',') {
  const parts = []; let start = 0; const stack = [];
  const closing = { '}': '{', ')': '(', ']': '[' };
  tokens.forEach((token, index) => {
    if (token.kind !== 'punctuation') return;
    const v = token.value;
    if ('{(['.includes(v)) stack.push(v);
    else if (Object.hasOwn(closing, v)) {
      if (stack.pop() !== closing[v]) throw new Error('Unbalanced registry structure');
    } else if (v === separator && stack.length === 0) {
      parts.push(tokens.slice(start, index)); start = index + 1;
    }
  });
  if (stack.length) throw new Error('Unbalanced registry structure');
  parts.push(tokens.slice(start));
  return parts.filter((part) => part.length);
}

export function parseRegistrySource(source) {
  const tokens = tokenize(source);
  const constants = new Map();
  let registry;
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].value !== 'const' || tokens[i].kind !== 'identifier') continue;
    const name = tokens[i + 1];
    if (name?.kind !== 'identifier') continue;
    let equals = i + 2;
    while (equals < tokens.length && !['=', ';'].includes(tokens[equals].value)) equals++;
    if (tokens[equals]?.value !== '=') continue;
    let end = equals + 1; const stack = [];
    for (; end < tokens.length; end++) {
      const token = tokens[end];
      if (token.kind !== 'punctuation') continue;
      if ('{(['.includes(token.value)) stack.push(token.value);
      else if ('})]'.includes(token.value)) stack.pop();
      else if (token.value === ';' && stack.length === 0) break;
    }
    const expression = tokens.slice(equals + 1, end);
    if (constants.has(name.value)) throw new Error(`Duplicate constant ${name.value}`);
    constants.set(name.value, expression);
    if (name.value === 'MODEL_REGISTRY') registry = expression;
    i = end;
  }
  if (!registry) throw new Error('MODEL_REGISTRY declaration not found');

  function resolveExpression(expression, seen = new Set()) {
    let cursor = 0;
    function read() {
      const condition = ['import', '.', 'meta', '.', 'env', '.', 'PROD', '?'];
      if (condition.every((value, index) => expression[cursor + index]?.value === value)) {
        cursor += condition.length;
        read(); // Validate production branch too; never silently accept an unknown expression.
        if (expression[cursor++]?.value !== ':') throw new Error('Expected PROD ternary source branch');
        return read();
      }
      const token = expression[cursor++];
      if (token?.kind === 'string') return token.value;
      if (token?.value === '(') {
        const value = read();
        if (expression[cursor++]?.value !== ')') throw new Error('Unbalanced path expression');
        return value;
      }
      if (token?.kind === 'identifier') {
        if (!constants.has(token.value)) throw new Error(`Unresolved path constant ${token.value}`);
        if (seen.has(token.value)) throw new Error(`Circular path constant ${token.value}`);
        return resolveExpression(constants.get(token.value), new Set([...seen, token.value]));
      }
      throw new Error(`Unsupported registry path expression near ${token?.value ?? 'end'}`);
    }
    const value = read();
    if (cursor !== expression.length) throw new Error('Unsupported trailing registry path expression');
    return value;
  }

  function fields(object) {
    if (object[0]?.value !== '{' || object.at(-1)?.value !== '}') throw new Error('Expected registry object');
    return splitTopLevel(object.slice(1, -1)).map((part) => {
      if (!['string', 'identifier'].includes(part[0]?.kind) || part[1]?.value !== ':') {
        throw new Error('Unsupported registry property (spread and shorthand are not allowed)');
      }
      return [part[0].value, part.slice(2)];
    });
  }
  const entries = Object.create(null);
  for (const [id, object] of fields(registry)) {
    if (Object.hasOwn(entries, id)) throw new Error(`Duplicate registry entry ${id}`);
    const paths = fields(object).filter(([key]) => key === 'path');
    if (paths.length !== 1) throw new Error(`Registry entry ${id} must have exactly one path`);
    const path = resolveExpression(paths[0][1]);
    if (!path.startsWith('/') || path.startsWith('//')) throw new Error(`Registry entry ${id} must use an absolute public path`);
    entries[id] = path;
  }
  if (Object.keys(entries).length === 0) throw new Error('Empty MODEL_REGISTRY');
  return entries;
}
