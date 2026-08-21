type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function activeLevel(): LogLevel {
  const env = (process.env.LOG_LEVEL || "info").toLowerCase() as LogLevel;
  return LEVEL_ORDER[env] !== undefined ? env : "info";
}

function format(level: LogLevel, scope: string, message: string, meta?: unknown): string {
  const ts = new Date().toISOString();
  const metaStr = meta !== undefined ? ` ${safeStringify(meta)}` : "";
  return `[${ts}] ${level.toUpperCase()} ${scope}: ${message}${metaStr}`;
}

function safeStringify(value: unknown): string {
  try {
    if (value instanceof Error) {
      return JSON.stringify({ name: value.name, message: value.message, stack: value.stack });
    }
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[activeLevel()];
}

function createScope(scope: string) {
  const log = (level: LogLevel, message: string, meta?: unknown) => {
    if (!shouldLog(level)) return;
    const line = format(level, scope, message, meta);
    if (level === "error") {
      console.error(line);
    } else if (level === "warn") {
      console.warn(line);
    } else if (level === "debug") {
      console.debug(line);
    } else {
      console.log(line);
    }
  };

  return {
    debug: (message: string, meta?: unknown) => log("debug", message, meta),
    info: (message: string, meta?: unknown) => log("info", message, meta),
    warn: (message: string, meta?: unknown) => log("warn", message, meta),
    error: (message: string, meta?: unknown) => log("error", message, meta),
  };
}

export const logger = {
  scope: createScope,
};

export type ScopedLogger = ReturnType<typeof createScope>;
