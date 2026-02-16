import type { BlockDefinition } from '../../types/block'

export const databaseBlocks: BlockDefinition[] = [
  {
    name: 'create_table',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Create a new table with comma-separated column names',
    category: 'Database',
    inputs: [
      { name: 'name', type: 'string', description: 'Table name' },
      { name: 'columns', type: 'string', description: 'Comma-separated column names' },
    ],
    outputs: [],
    implementations: {
      javascript: `function createTable(name, columns) {
  window.__tables = window.__tables || {};
  var cols = String(columns).split(",").map(function(c) { return c.trim(); }).filter(function(c) { return c; });
  if (cols.length === 0) { console.log("Error: No columns provided"); return; }
  window.__tables[name] = { columns: cols, rows: [] };
}`,
      python: `def create_table(name, columns):
    tables = globals().setdefault("__tables", {})
    cols = [c.strip() for c in str(columns).split(",") if c.strip()]
    if not cols:
        print("Error: No columns provided")
        return
    tables[name] = {"columns": cols, "rows": []}`,
    },
    tests: [
      { input: { name: 'players', columns: 'name, age, score' }, expected: {} },
    ],
    color: '#2563EB',
  },
  {
    name: 'insert_row',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Insert a row of comma-separated values into a table (numbers auto-detected)',
    category: 'Database',
    inputs: [
      { name: 'table', type: 'string', description: 'Table name' },
      { name: 'values', type: 'string', description: 'Comma-separated values' },
    ],
    outputs: [],
    implementations: {
      javascript: `function insertRow(table, values) {
  window.__tables = window.__tables || {};
  if (!window.__tables[table]) { console.log("Error: Table '" + table + "' does not exist"); return; }
  var t = window.__tables[table];
  var vals = String(values).split(",").map(function(v) { var s = v.trim(); var n = Number(s); return !isNaN(n) && s !== "" ? n : s; });
  t.rows.push(vals);
}`,
      python: `def insert_row(table, values):
    tables = globals().get("__tables", {})
    if table not in tables:
        print("Error: Table '" + table + "' does not exist")
        return
    t = tables[table]
    vals = []
    for v in str(values).split(","):
        s = v.strip()
        try:
            vals.append(int(s) if "." not in s else float(s))
        except ValueError:
            vals.append(s)
    t["rows"].append(vals)`,
    },
    tests: [
      { input: { table: 'players', values: 'Alice, 14, 100' }, expected: {} },
    ],
    color: '#2563EB',
  },
  {
    name: 'update_rows',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Update rows where a column matches a value',
    category: 'Database',
    inputs: [
      { name: 'table', type: 'string', description: 'Table name' },
      { name: 'where_column', type: 'string', description: 'Column to match' },
      { name: 'where_value', type: 'any', description: 'Value to match' },
      { name: 'set_column', type: 'string', description: 'Column to update' },
      { name: 'set_value', type: 'any', description: 'New value' },
    ],
    outputs: [],
    implementations: {
      javascript: `function updateRows(table, whereColumn, whereValue, setColumn, setValue) {
  window.__tables = window.__tables || {};
  if (!window.__tables[table]) { console.log("Error: Table '" + table + "' does not exist"); return; }
  var t = window.__tables[table];
  var wi = t.columns.indexOf(whereColumn);
  var si = t.columns.indexOf(setColumn);
  if (wi === -1) { console.log("Error: Column '" + whereColumn + "' not found"); return; }
  if (si === -1) { console.log("Error: Column '" + setColumn + "' not found"); return; }
  var sv = setValue; var n = Number(sv); if (!isNaN(n) && String(sv).trim() !== "") sv = n;
  for (var i = 0; i < t.rows.length; i++) {
    if (String(t.rows[i][wi]) === String(whereValue)) { t.rows[i][si] = sv; }
  }
}`,
      python: `def update_rows(table, where_column, where_value, set_column, set_value):
    tables = globals().get("__tables", {})
    if table not in tables:
        print("Error: Table '" + table + "' does not exist")
        return
    t = tables[table]
    if where_column not in t["columns"]:
        print("Error: Column '" + where_column + "' not found")
        return
    if set_column not in t["columns"]:
        print("Error: Column '" + set_column + "' not found")
        return
    wi = t["columns"].index(where_column)
    si = t["columns"].index(set_column)
    sv = set_value
    try:
        sv = int(sv) if "." not in str(sv) else float(sv)
    except (ValueError, TypeError):
        pass
    for row in t["rows"]:
        if str(row[wi]) == str(where_value):
            row[si] = sv`,
    },
    tests: [
      { input: { table: 'players', where_column: 'name', where_value: 'Alice', set_column: 'score', set_value: 200 }, expected: {} },
    ],
    color: '#2563EB',
  },
  {
    name: 'delete_rows',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Delete rows where a column matches a value',
    category: 'Database',
    inputs: [
      { name: 'table', type: 'string', description: 'Table name' },
      { name: 'where_column', type: 'string', description: 'Column to match' },
      { name: 'where_value', type: 'any', description: 'Value to match' },
    ],
    outputs: [],
    implementations: {
      javascript: `function deleteRows(table, whereColumn, whereValue) {
  window.__tables = window.__tables || {};
  if (!window.__tables[table]) { console.log("Error: Table '" + table + "' does not exist"); return; }
  var t = window.__tables[table];
  var wi = t.columns.indexOf(whereColumn);
  if (wi === -1) { console.log("Error: Column '" + whereColumn + "' not found"); return; }
  t.rows = t.rows.filter(function(row) { return String(row[wi]) !== String(whereValue); });
}`,
      python: `def delete_rows(table, where_column, where_value):
    tables = globals().get("__tables", {})
    if table not in tables:
        print("Error: Table '" + table + "' does not exist")
        return
    t = tables[table]
    if where_column not in t["columns"]:
        print("Error: Column '" + where_column + "' not found")
        return
    wi = t["columns"].index(where_column)
    t["rows"] = [row for row in t["rows"] if str(row[wi]) != str(where_value)]`,
    },
    tests: [
      { input: { table: 'players', where_column: 'name', where_value: 'Bob' }, expected: {} },
    ],
    color: '#2563EB',
  },
  {
    name: 'drop_table',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Remove a table completely',
    category: 'Database',
    inputs: [
      { name: 'name', type: 'string', description: 'Table name' },
    ],
    outputs: [],
    implementations: {
      javascript: `function dropTable(name) {
  window.__tables = window.__tables || {};
  if (!window.__tables[name]) { console.log("Error: Table '" + name + "' does not exist"); return; }
  delete window.__tables[name];
}`,
      python: `def drop_table(name):
    tables = globals().get("__tables", {})
    if name not in tables:
        print("Error: Table '" + name + "' does not exist")
        return
    del tables[name]`,
    },
    tests: [
      { input: { name: 'players' }, expected: {} },
    ],
    color: '#2563EB',
  },
  {
    name: 'print_table',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Print a formatted ASCII table to output',
    category: 'Database',
    inputs: [
      { name: 'name', type: 'string', description: 'Table name' },
    ],
    outputs: [],
    implementations: {
      javascript: `function printTable(name) {
  window.__tables = window.__tables || {};
  if (!window.__tables[name]) { console.log("Error: Table '" + name + "' does not exist"); return; }
  var t = window.__tables[name];
  var cols = t.columns;
  var widths = cols.map(function(c) { return c.length; });
  for (var i = 0; i < t.rows.length; i++) {
    for (var j = 0; j < cols.length; j++) {
      var val = j < t.rows[i].length ? String(t.rows[i][j]) : "";
      if (val.length > widths[j]) widths[j] = val.length;
    }
  }
  var sep = "+" + widths.map(function(w) { return "-".repeat(w + 2); }).join("+") + "+";
  var header = "|" + cols.map(function(c, idx) { return " " + c + " ".repeat(widths[idx] - c.length) + " "; }).join("|") + "|";
  var lines = [sep, header, sep];
  for (var i = 0; i < t.rows.length; i++) {
    var row = "|" + cols.map(function(c, j) {
      var val = j < t.rows[i].length ? String(t.rows[i][j]) : "";
      return " " + val + " ".repeat(widths[j] - val.length) + " ";
    }).join("|") + "|";
    lines.push(row);
  }
  lines.push(sep);
  console.log(lines.join("\\n"));
}`,
      python: `def print_table(name):
    tables = globals().get("__tables", {})
    if name not in tables:
        print("Error: Table '" + name + "' does not exist")
        return
    t = tables[name]
    cols = t["columns"]
    widths = [len(c) for c in cols]
    for row in t["rows"]:
        for j in range(len(cols)):
            val = str(row[j]) if j < len(row) else ""
            if len(val) > widths[j]:
                widths[j] = len(val)
    sep = "+" + "+".join("-" * (w + 2) for w in widths) + "+"
    header = "|" + "|".join(" " + cols[i] + " " * (widths[i] - len(cols[i])) + " " for i in range(len(cols))) + "|"
    lines = [sep, header, sep]
    for row in t["rows"]:
        line = "|" + "|".join(" " + (str(row[j]) if j < len(row) else "") + " " * (widths[j] - len(str(row[j]) if j < len(row) else "")) + " " for j in range(len(cols))) + "|"
        lines.append(line)
    lines.append(sep)
    print("\\n".join(lines))`,
    },
    tests: [
      { input: { name: 'players' }, expected: {} },
    ],
    color: '#2563EB',
  },
  {
    name: 'select_all',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get all rows from a table as an array of objects',
    category: 'Database',
    inputs: [
      { name: 'table', type: 'string', description: 'Table name' },
    ],
    outputs: [{ name: 'rows', type: 'any' }],
    implementations: {
      javascript: `function selectAll(table) {
  window.__tables = window.__tables || {};
  if (!window.__tables[table]) { console.log("Error: Table '" + table + "' does not exist"); return []; }
  var t = window.__tables[table];
  return t.rows.map(function(row) {
    var obj = {};
    for (var i = 0; i < t.columns.length; i++) { obj[t.columns[i]] = i < row.length ? row[i] : null; }
    return obj;
  });
}`,
      python: `def select_all(table):
    tables = globals().get("__tables", {})
    if table not in tables:
        print("Error: Table '" + table + "' does not exist")
        return []
    t = tables[table]
    return [{col: (row[i] if i < len(row) else None) for i, col in enumerate(t["columns"])} for row in t["rows"]]`,
    },
    tests: [
      { input: { table: 'players' }, expected: { rows: 'any' } },
    ],
    color: '#2563EB',
    shape: 'value',
  },
  {
    name: 'select_where',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get rows where a column matches a value',
    category: 'Database',
    inputs: [
      { name: 'table', type: 'string', description: 'Table name' },
      { name: 'column', type: 'string', description: 'Column to match' },
      { name: 'value', type: 'any', description: 'Value to match' },
    ],
    outputs: [{ name: 'rows', type: 'any' }],
    implementations: {
      javascript: `function selectWhere(table, column, value) {
  window.__tables = window.__tables || {};
  if (!window.__tables[table]) { console.log("Error: Table '" + table + "' does not exist"); return []; }
  var t = window.__tables[table];
  var ci = t.columns.indexOf(column);
  if (ci === -1) { console.log("Error: Column '" + column + "' not found"); return []; }
  return t.rows.filter(function(row) { return String(row[ci]) === String(value); }).map(function(row) {
    var obj = {};
    for (var i = 0; i < t.columns.length; i++) { obj[t.columns[i]] = i < row.length ? row[i] : null; }
    return obj;
  });
}`,
      python: `def select_where(table, column, value):
    tables = globals().get("__tables", {})
    if table not in tables:
        print("Error: Table '" + table + "' does not exist")
        return []
    t = tables[table]
    if column not in t["columns"]:
        print("Error: Column '" + column + "' not found")
        return []
    ci = t["columns"].index(column)
    return [{col: (row[i] if i < len(row) else None) for i, col in enumerate(t["columns"])} for row in t["rows"] if str(row[ci]) == str(value)]`,
    },
    tests: [
      { input: { table: 'players', column: 'name', value: 'Alice' }, expected: { rows: 'any' } },
    ],
    color: '#2563EB',
    shape: 'value',
  },
  {
    name: 'count_rows',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Count the number of rows in a table',
    category: 'Database',
    inputs: [
      { name: 'table', type: 'string', description: 'Table name' },
    ],
    outputs: [{ name: 'count', type: 'number' }],
    implementations: {
      javascript: `function countRows(table) {
  window.__tables = window.__tables || {};
  if (!window.__tables[table]) { console.log("Error: Table '" + table + "' does not exist"); return 0; }
  return window.__tables[table].rows.length;
}`,
      python: `def count_rows(table):
    tables = globals().get("__tables", {})
    if table not in tables:
        print("Error: Table '" + table + "' does not exist")
        return 0
    return len(tables[table]["rows"])`,
    },
    tests: [
      { input: { table: 'players' }, expected: { count: 2 } },
    ],
    color: '#2563EB',
    shape: 'value',
  },
  {
    name: 'get_column',
    author: 'CryptoBlocks',
    version: '1.0.0',
    description: 'Get all values from a single column as an array',
    category: 'Database',
    inputs: [
      { name: 'table', type: 'string', description: 'Table name' },
      { name: 'column', type: 'string', description: 'Column name' },
    ],
    outputs: [{ name: 'values', type: 'any' }],
    implementations: {
      javascript: `function getColumn(table, column) {
  window.__tables = window.__tables || {};
  if (!window.__tables[table]) { console.log("Error: Table '" + table + "' does not exist"); return []; }
  var t = window.__tables[table];
  var ci = t.columns.indexOf(column);
  if (ci === -1) { console.log("Error: Column '" + column + "' not found"); return []; }
  return t.rows.map(function(row) { return ci < row.length ? row[ci] : null; });
}`,
      python: `def get_column(table, column):
    tables = globals().get("__tables", {})
    if table not in tables:
        print("Error: Table '" + table + "' does not exist")
        return []
    t = tables[table]
    if column not in t["columns"]:
        print("Error: Column '" + column + "' not found")
        return []
    ci = t["columns"].index(column)
    return [row[ci] if ci < len(row) else None for row in t["rows"]]`,
    },
    tests: [
      { input: { table: 'players', column: 'name' }, expected: { values: 'any' } },
    ],
    color: '#2563EB',
    shape: 'value',
  },
]
