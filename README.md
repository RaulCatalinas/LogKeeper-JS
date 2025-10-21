# LogKeeper

A simple, plug-and-play file logger for Node.js with automatic timestamping and session management.

## Features

✨ **Zero Configuration** - Works out of the box, no setup required  
📁 **Automatic File Management** - Creates timestamped log files for each session  
⏰ **Built-in Timestamps** - Every log entry includes automatic timestamping  
🎯 **Simple API** - Clean, intuitive methods for different log levels  
💾 **Persistent Logging** - All logs are saved to disk automatically  
📘 **Full TypeScript Support** - Complete type definitions included

## Installation

```bash
npm install logkeeper-js
```

Or with yarn:

```bash
yarn add logkeeper-js
```

Or with pnpm:

```bash
pnpm add logkeeper-js
```

Or with bun:

```bash
bun add logkeeper-js
```

## Quick Start

### TypeScript

```typescript
import { LogKeeper } from 'logkeeper'

// Log different levels
LogKeeper.info('Application started')
LogKeeper.warning('Low memory detected')
LogKeeper.error('Connection failed')
LogKeeper.critical('System failure!')

// Save and close (important!)
await LogKeeper.saveLogs()
```

### JavaScript

```javascript
const { LogKeeper } = require('logkeeper')

// Log different levels
LogKeeper.info('Application started')
LogKeeper.warning('Low memory detected')
LogKeeper.error('Connection failed')
LogKeeper.critical('System failure!')

// Save and close (important!)
await LogKeeper.saveLogs()
```

## Usage

### Basic Logging

```typescript
import { LogKeeper } from 'logkeeper'

LogKeeper.info('User logged in successfully')
LogKeeper.warning('Cache miss, fetching from database')
LogKeeper.error('Failed to send email notification')
LogKeeper.critical('Database connection lost!')
```

### Complete Example

```typescript
import { LogKeeper } from 'logkeeper'

async function main() {
  LogKeeper.info('Application starting...')

  try {
    // Your application logic
    await connectToDatabase()
    LogKeeper.info('Database connected')

    await processData()
    LogKeeper.info('Data processed successfully')
  } catch (error) {
    if (error instanceof ConnectionError) {
      LogKeeper.error(`Connection failed: ${error.message}`)
    } else {
      LogKeeper.critical(`Unexpected error: ${error}`)
    }
  } finally {
    LogKeeper.info('Application shutting down')
    await LogKeeper.saveLogs()
  }
}

main()
```

### With Express.js

```typescript
import express from 'express'
import { LogKeeper } from 'logkeeper'

const app = express()

app.use((req, res, next) => {
  LogKeeper.info(`${req.method} ${req.path}`)
  next()
})

app.get('/', (req, res) => {
  res.send('Hello World')
})

const server = app.listen(3000, () => {
  LogKeeper.info('Server started on port 3000')
})

process.on('SIGTERM', async () => {
  LogKeeper.info('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    LogKeeper.info('HTTP server closed')
  })
  await LogKeeper.saveLogs()
  process.exit(0)
})
```

## Log Levels

| Method       | Level    | Use Case                               |
| ------------ | -------- | -------------------------------------- |
| `info()`     | INFO     | General information, normal operations |
| `warning()`  | WARNING  | Warning messages, potential issues     |
| `error()`    | ERROR    | Error events, recoverable problems     |
| `critical()` | CRITICAL | Critical errors, system failures       |

## Log File Format

### File Naming

Log files are created in the `logs/` directory with timestamps:

```
logs/
├── 2025-10-19_14-30-45.log
├── 2025-10-19_15-22-10.log
└── 2025-10-20_09-15-33.log
```

### Log Entry Format

Each entry includes timestamp, level, and message:

```
[14:30:45] INFO: Application started
[14:30:46] WARNING: Low memory detected
[14:30:47] ERROR: Connection timeout
[14:30:48] CRITICAL: System failure
```

## API Reference

### `LogKeeper.info(message: string): void`

Logs an informational message.

**Parameters:**

- `message` - The message to log

**Example:**

```typescript
LogKeeper.info('User authentication successful')
```

### `LogKeeper.warning(message: string): void`

Logs a warning message.

**Parameters:**

- `message` - The message to log

**Example:**

```typescript
LogKeeper.warning('API rate limit approaching')
```

### `LogKeeper.error(message: string): void`

Logs an error message.

**Parameters:**

- `message` - The message to log

**Example:**

```typescript
LogKeeper.error('Failed to fetch user data')
```

### `LogKeeper.critical(message: string): void`

Logs a critical message.

**Parameters:**

- `message` - The message to log

**Example:**

```typescript
LogKeeper.critical('Database corruption detected')
```

### `LogKeeper.saveLogs(): Promise<void>`

Flushes and closes the log file. Call this before your application exits.

**Returns:** Promise that resolves when the log file is closed

**Example:**

```typescript
await LogKeeper.saveLogs()
```

## Best Practices

### 1. Always Call `saveLogs()`

```typescript
// ✅ Good
async function main() {
  LogKeeper.info('Starting operation')
  // ... do work ...
  await LogKeeper.saveLogs() // Ensures all logs are written
}

// ❌ Bad
function main() {
  LogKeeper.info('Starting operation')
  // Program exits without saving - logs may be lost!
}
```

### 2. Use Appropriate Log Levels

```typescript
// INFO - Normal operations
LogKeeper.info('Server started on port 3000')

// WARNING - Unusual but not critical
LogKeeper.warning('Response time exceeded 2 seconds')

// ERROR - Something failed but app continues
LogKeeper.error('Failed to send notification email')

// CRITICAL - Severe problems
LogKeeper.critical('Unable to connect to primary database')
```

### 3. Include Context in Messages

```typescript
// ✅ Good - Clear and actionable
LogKeeper.error(`Failed to process order #${orderId}: ${error.message}`)

// ❌ Bad - Vague
LogKeeper.error('Processing failed')
```

### 4. Handle Process Termination

```typescript
process.on('SIGINT', async () => {
  LogKeeper.info('Received SIGINT, shutting down gracefully')
  await LogKeeper.saveLogs()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  LogKeeper.info('Received SIGTERM, shutting down gracefully')
  await LogKeeper.saveLogs()
  process.exit(0)
})

process.on('uncaughtException', async error => {
  LogKeeper.critical(`Uncaught exception: ${error.message}`)
  await LogKeeper.saveLogs()
  process.exit(1)
})
```

## TypeScript Support

LogKeeper is written in TypeScript and includes full type definitions. No need for `@types` packages!

```typescript
import { LogKeeper, LogLevel } from 'logkeeper'

// Full autocomplete and type checking
LogKeeper.info('Message') // ✓ Type safe
LogKeeper.info(123) // ✗ Type error
```

## FAQ

### Q: Where are log files stored?

**A:** Log files are stored in a `logs/` directory relative to your application's working directory.

### Q: Can I change the log directory?

**A:** Currently, logs are saved to `logs/` by default. Custom directory support may be added in a future version.

### Q: What happens if I don't call `saveLogs()`?

**A:** Some log entries may remain in the buffer and not be written to disk. Always call `saveLogs()` before exit.
