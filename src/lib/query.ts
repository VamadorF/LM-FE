export interface QueryOptions<T> {
  search?: string;
  getSearchText?: (item: T) => string;
  filters?: Array<(item: T) => boolean>;
  sort?: (a: T, b: T) => number;
}

export interface QueryResult<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
}

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function filtrarOrdenar<T>(source: T[], opts: QueryOptions<T>): T[] {
  const { search, getSearchText, filters, sort } = opts;
  const term = search ? normalize(search.trim()) : "";

  let result = source;

  if (term && getSearchText) {
    result = result.filter((item) => normalize(getSearchText(item)).includes(term));
  }

  if (filters && filters.length) {
    result = result.filter((item) => filters.every((f) => f(item)));
  }

  if (sort) {
    result = [...result].sort(sort);
  }

  return result;
}

export function paginar<T>(items: T[], page: number, pageSize: number): QueryResult<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page: current,
    pageCount,
  };
}

export function queryList<T>(
  source: T[],
  opts: QueryOptions<T> & { page: number; pageSize: number },
): QueryResult<T> {
  return paginar(filtrarOrdenar(source, opts), opts.page, opts.pageSize);
}
