import { type WriteStream, createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { LogLevel } from './log-levels'

/**
 * A simple file logger with automatic timestamping and session management.
 *
 * LogKeeper provides a plug-and-play logging solution that automatically
 * writes timestamped log entries to disk. Each session creates a new log file
 * with a timestamp-based filename.
 *
 * @example
 * ```typescript
 * LogKeeper.info('Application started');
 * LogKeeper.warning('Low memory detected');
 * LogKeeper.error('Connection failed');
 * LogKeeper.critical('System failure');
 *
 * // Save and close log file when done
 * await LogKeeper.saveLogs();
 * ```
 *
 * Log files are stored in a `logs/` directory relative to the application's
 * working directory. Each log file is named with the format:
 * `yyyy-MM-dd_HH-mm-ss.log`
 */
export class LogKeeper {
  private static instance: LogKeeper
  private writeStream: WriteStream | null = null
  private readonly logDir: string
  private readonly logFile: string

  private constructor() {
    this.logDir = 'logs'
    const filenameTimestamp = this.formatFilenameTimestamp(new Date())
    this.logFile = join(this.logDir, `${filenameTimestamp}.log`)
    this.initializeLogger().catch((error: unknown) => {
      console.error('Error initializing logger:', error)
    })
  }

  private static getInstance(): LogKeeper {
    LogKeeper.instance = new LogKeeper()
    return LogKeeper.instance
  }

  private async initializeLogger(): Promise<void> {
    try {
      // Create logs directory if it doesn't exist
      await mkdir(this.logDir, { recursive: true })

      // Open write stream in append mode
      this.writeStream = createWriteStream(this.logFile, {
        flags: 'a',
        encoding: 'utf8'
      })
    } catch (error) {
      console.error('Failed to initialize LogKeeper:', error)
    }
  }

  private formatFilenameTimestamp(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
  }

  private formatLogTimestamp(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${hours}:${minutes}:${seconds}`
  }

  private static writeLog(level: LogLevel, message: string): void {
    const instance = LogKeeper.getInstance()

    if (!instance.writeStream) {
      console.error('LogKeeper not initialized')
      return
    }

    const timestamp = instance.formatLogTimestamp(new Date())
    const logEntry = `[${timestamp}] ${level}: ${message}\n`

    instance.writeStream.write(logEntry)
  }

  /**
   * Logs an informational message.
   *
   * Use this for general information about application flow and state.
   *
   * @param message - The message to log
   *
   * @example
   * ```typescript
   * LogKeeper.info('User logged in successfully');
   * LogKeeper.info('Database connection established');
   * ```
   */
  public static info(message: string): void {
    this.writeLog(LogLevel.INFO, message)
  }

  /**
   * Logs a warning message.
   *
   * Use this for potentially harmful situations that don't prevent
   * the application from functioning.
   *
   * @param message - The message to log
   *
   * @example
   * ```typescript
   * LogKeeper.warning('Disk space running low');
   * LogKeeper.warning('API rate limit approaching');
   * ```
   */
  public static warning(message: string): void {
    this.writeLog(LogLevel.WARNING, message)
  }

  /**
   * Logs an error message.
   *
   * Use this for error events that might still allow the application
   * to continue running.
   *
   * @param message - The message to log
   *
   * @example
   * ```typescript
   * LogKeeper.error('Failed to fetch user data');
   * LogKeeper.error('Network connection timeout');
   * ```
   */
  public static error(message: string): void {
    this.writeLog(LogLevel.ERROR, message)
  }

  /**
   * Logs a critical message.
   *
   * Use this for severe error events that will presumably lead the
   * application to abort or require immediate attention.
   *
   * @param message - The message to log
   *
   * @example
   * ```typescript
   * LogKeeper.critical('Database corruption detected');
   * LogKeeper.critical('Out of memory error');
   * ```
   */
  public static critical(message: string): void {
    this.writeLog(LogLevel.CRITICAL, message)
  }

  /**
   * Flushes and closes the log file.
   *
   * This method should be called when you're done logging, typically
   * before the application exits. It ensures all buffered log entries
   * are written to disk and the file handle is properly closed.
   *
   * @returns A Promise that resolves when the log file has been flushed and closed
   *
   * @example
   * ```typescript
   * async function main() {
   *   LogKeeper.info('Application starting');
   *   // ... application logic ...
   *   LogKeeper.info('Application shutting down');
   *   await LogKeeper.saveLogs();
   * }
   * ```
   */
  public static async saveLogs(): Promise<void> {
    const instance = LogKeeper.getInstance()

    if (instance.writeStream) {
      await new Promise((resolve, reject) => {
        instance.writeStream!.end((error: unknown) => {
          if (error) {
            reject(error)
          } else {
            instance.writeStream = null
            resolve(null)
          }
        })
      })
    }
  }
}
