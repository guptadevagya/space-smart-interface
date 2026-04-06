import { evaluate, parse } from 'mathjs';
import { FormulaDefinition } from './types';

export function extractVariables(formula: string): string[] {
  try {
    const node = parse(formula);
    const vars: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node.traverse((n: any) => {
      if (n.type === 'SymbolNode') {
        vars.push(n.name);
      }
    });
    return [...new Set(vars)];
  } catch {
    return [];
  }
}

function topSort(
  formulas: FormulaDefinition[],
  inputVarIds: Set<string>,
): FormulaDefinition[] {
  const resolved = new Set(inputVarIds);
  const sorted: FormulaDefinition[] = [];
  const remaining = [...formulas];
  let maxIter = remaining.length * remaining.length + 1;

  while (remaining.length > 0 && maxIter-- > 0) {
    const idx = remaining.findIndex((f) => {
      const deps = extractVariables(f.formula);
      return deps.every((d) => resolved.has(d));
    });
    if (idx === -1) break;
    sorted.push(remaining[idx]);
    resolved.add(remaining[idx].id);
    remaining.splice(idx, 1);
  }
  sorted.push(...remaining);
  return sorted;
}

export function evaluateFormulas(
  formulas: FormulaDefinition[],
  inputVariables: Record<string, number>,
): { values: Record<string, number>; errors: Record<string, string> } {
  const scope: Record<string, number> = { ...inputVariables };
  const errors: Record<string, string> = {};
  const sorted = topSort(formulas, new Set(Object.keys(inputVariables)));

  for (const f of sorted) {
    try {
      const result = evaluate(f.formula, { ...scope });
      scope[f.id] = typeof result === 'number' && isFinite(result) ? result : 0;
    } catch (e) {
      errors[f.id] = e instanceof Error ? e.message : 'Invalid formula';
      scope[f.id] = 0;
    }
  }

  return { values: scope, errors };
}

export function validateFormula(
  formula: string,
  availableVars: Set<string>,
): string | null {
  try {
    parse(formula);
    const vars = extractVariables(formula);
    const missing = vars.filter((v) => !availableVars.has(v));
    if (missing.length > 0) return `Unknown variables: ${missing.join(', ')}`;
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : 'Invalid expression';
  }
}
