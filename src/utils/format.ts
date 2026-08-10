const pad = (n: number) => String(n).padStart(2, '0')

/** 日期格式化：YYYY-MM-DD */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 日期时间格式化：YYYY-MM-DD HH:mm:ss */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date)
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 货币格式化：¥1,234.50（Intl.NumberFormat，zh-CN） */
export function formatCurrency(amount: number, currency = 'CNY'): string {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(amount)
}
