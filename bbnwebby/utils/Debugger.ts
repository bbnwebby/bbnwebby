// utils/Debugger.ts
import util from 'util';
import chalk from 'chalk';

type Timer = {
  start: number;
  label: string;
  caller: { file: string; fn: string };
};

type CallerContext = {
  file?: string;
  fn?: string;
};

class Debugger {
  private timers: Map<string, Timer> = new Map();
  private debugEnabled = true;

  public setDebug(enabled: boolean) {
    this.debugEnabled = enabled;
  }

  // ------------------- Timers -------------------
  public startTimer(label: string, context?: CallerContext) {
    const caller = this.mergeCallerContext(this.getCallerInfo(3), context);
    this.timers.set(label, { start: Date.now(), label, caller });
  }

public stopTimer(label: string, context?: CallerContext) {
  // If timer does not exist → auto-create one instead of throwing error
  let timer = this.timers.get(label);
  if (!timer) {
    const caller = this.mergeCallerContext(this.getCallerInfo(3), context);

    // Create a synthetic timer so elapsed = ~0
    timer = { start: Date.now(), label, caller };

    this.timers.set(label, timer);

    this.warn(
      `Timer "${label}" was missing. A new timer was automatically created.`,
      context
    );
  }

  // Compute elapsed normally
  const elapsed = Date.now() - timer.start;

  const caller = context
    ? this.mergeCallerContext(timer.caller, context)
    : timer.caller;

  this._log('info', `[Timer "${label}" elapsed: ${elapsed}ms]`, caller);

  this.timers.delete(label);
  return elapsed;
}


  // ------------------- Logging -------------------
  public info(message: unknown, context?: CallerContext) {
    this._logWithCaller('info', [message], 3, context);
  }

  public warn(message: unknown, context?: CallerContext) {
    this._logWithCaller('warn', [message], 3, context);
  }

  public error(message: unknown, context?: CallerContext) {
    this._logWithCaller('error', [message], 3, context);
  }

  private _logWithCaller(
    level: 'info' | 'warn' | 'error',
    args: unknown[],
    stackOffset: number,
    context?: CallerContext
  ) {
    if (!this.debugEnabled) return;

    const caller = this.mergeCallerContext(this.getCallerInfo(stackOffset), context);
    const prefix = `[${caller.file} -> ${caller.fn}]`;
    const colorFn = this.getColor(level, prefix);

    const formattedArgs = args.map(arg =>
      typeof arg === 'object' ? util.inspect(arg, { colors: true, depth: null }) : arg
    );

    console[level](colorFn(prefix), ...formattedArgs);
  }

  // ------------------- Internal log (no stack recalc) -------------------
  private _log(level: 'info' | 'warn' | 'error', message: string, caller: { file: string; fn: string }) {
    const prefix = `[${caller.file} -> ${caller.fn}]`;
    const colorFn = this.getColor(level, prefix);
    console[level](colorFn(prefix), message);
  }

  // ------------------- Helpers -------------------
  private mergeCallerContext(base: { file: string; fn: string }, context?: CallerContext) {
    return {
      file: context?.file || base.file,
      fn: context?.fn || base.fn,
    };
  }

  private getColor(level: 'info' | 'warn' | 'error', prefix: string) {
    const baseColor = {
      info: chalk.blue,
      warn: chalk.yellow,
      error: chalk.redBright,
    }[level];
    const hash = this.hashCode(prefix);
    return (text: string) => baseColor.hex(this.intToColor(hash))(text);
  }

  private hashCode(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  private intToColor(num: number) {
    const r = (num & 0xff0000) >> 16;
    const g = (num & 0x00ff00) >> 8;
    const b = num & 0x0000ff;
    return `#${((r & 0xff) << 16 | (g & 0xff) << 8 | (b & 0xff)).toString(16).padStart(6, '0')}`;
  }

  private getCallerInfo(stackOffset = 2): { file: string; fn: string } {
    const stack = new Error().stack;
    if (!stack) return { file: 'unknown', fn: 'anonymous' };

    const stackLines = stack.split('\n').map(l => l.trim());
    const callerLine = stackLines[stackOffset] || '';

    // functionName (file:line:col)
    let match = callerLine.match(/at (\S+) \((.*):\d+:\d+\)/);
    if (match) {
      const fn = match[1] || 'anonymous';
      const file = match[2]?.split('/').pop() || 'unknown';
      return { file, fn };
    }

    // file:line:col (anonymous)
    match = callerLine.match(/at (.*):\d+:\d+/);
    if (match) {
      const file = match[1]?.split('/').pop() || 'unknown';
      return { file, fn: 'anonymous' };
    }

    return { file: 'unknown', fn: 'anonymous' };
  }
}

// Export singleton
export const logDebug = new Debugger();
