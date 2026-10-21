// Static SQL inspection only: wildcards need database metadata to expand.
export function extractSqlColumns(sql: string): string[] {
  const tokens = [...sql.matchAll(/--[^\n]*|\/\*[\s\S]*?\*\/|'(?:''|[^'])*'|"(?:""|[^"])*"|`(?:``|[^`])*`|\[(?:\]\]|[^\]])*\]|[A-Za-z_][\w$]*|[^\s]/g)]
    .map((match) => match[0])
    .filter((token) => !token.startsWith('--') && !token.startsWith('/*'));
  let depth = 0;
  const levels = tokens.map((token) => {
    if (token === ')') depth -= 1;
    const level = depth;
    if (token === '(') depth += 1;
    return level;
  });
  const selects = tokens.map((token, index) => token.toUpperCase() === 'SELECT' ? index : -1).filter((index) => index >= 0);
  if (!selects.length) return [];
  const outerDepth = Math.min(...selects.map((index) => levels[index]));
  const start = selects.find((index) => levels[index] === outerDepth)!;
  const expressions: string[][] = [[]];
  for (let index = start + 1; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (levels[index] < outerDepth || (levels[index] === outerDepth && /^(FROM|INTO|UNION|INTERSECT|EXCEPT|WHERE|ORDER|GROUP|LIMIT|OFFSET|FETCH|HAVING|QUALIFY|;)$/i.test(token))) break;
    if (levels[index] === outerDepth && token === ',') expressions.push([]);
    else expressions.at(-1)!.push(token);
  }
  const identifier = /^(?:[A-Za-z_][\w$]*|"(?:""|[^"])+"|`(?:``|[^`])+`|\[(?:\]\]|[^\]])+\])$/;
  const names = expressions.flatMap((expression) => {
    const parts = [...expression];
    if (/^(DISTINCT|ALL)$/i.test(parts[0])) parts.shift();
    if (/^TOP$/i.test(parts[0])) {
      parts.shift();
      if (parts[0] === '(') parts.splice(0, parts.indexOf(')') + 1);
      else parts.shift();
      if (/^PERCENT$/i.test(parts[0])) parts.shift();
      if (/^WITH$/i.test(parts[0]) && /^TIES$/i.test(parts[1])) parts.splice(0, 2);
    }
    const last = parts.at(-1);
    if (!last || !identifier.test(last) || /^(END|NULL|TRUE|FALSE)$/i.test(last)) return [];
    const previous = parts.at(-2);
    const simpleColumn = parts.every((part, index) => index % 2 === 0 ? identifier.test(part) : part === '.');
    const alias = previous?.toUpperCase() === 'AS' || (parts.length > 1 && previous !== '.' && !/^[+\-*/%=<>|&]$/.test(previous || '') && !/^(COLLATE|AT|TIME|ZONE)$/i.test(previous || ''));
    if (!simpleColumn && !alias) return [];
    return [last.replace(/^(?:"|`|\[)|(?:"|`|\])$/g, '').replace(/""/g, '"').replace(/``/g, '`').replace(/\]\]/g, ']')];
  });
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}
