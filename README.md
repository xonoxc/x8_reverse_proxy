# X8 Reverse Proxy

A high-performance reverse proxy server built with Node.js and TypeScript, featuring multi-worker clustering for improved throughput and flexible routing configuration.

## Features

- **Multi-process Architecture**: Utilizes Node.js clustering to distribute requests across multiple worker processes
- **Flexible Routing**: Path-based routing to multiple upstream services
- **Custom Headers**: Support for adding custom headers to forwarded requests
- **Configuration-driven**: YAML-based configuration for easy setup and modification
- **TypeScript**: Full TypeScript support with Zod schema validation

## Installation

```bash
# Clone the repository
git clone https://github.com/xonoxc/x8_reverse_proxy.git
cd x8_reverse_proxy

# Install dependencies
pnpm install

# Build the project
npm run build
```

## Usage

### Development

```bash
# Run in development mode with hot reload
npm run dev -- --config config.yaml
```

### Production

```bash
# Start the server
npm start -- --config config.yaml
```

## Configuration

The proxy is configured via a YAML file. Here's an example configuration:

```yaml
# Server configuration
server:
    listen: 8080
    workers: 4
    upstream:
        - id: jsonplaceholder
          url: jsonplaceholder.typicode.com
        - id: dummyjson
          url: dummyjson.com
    headers:
        - key: x-forward-for
          value: $ip
        - key: Authorization
          value: Bearer xyz
    rules:
        - path: /test
          upstrams: [dummyjson]
        - path: /
          upstrams: [jsonplaceholder]
```

### Configuration Options

- `listen`: Port number for the proxy server
- `workers`: Number of worker processes (defaults to CPU count)
- `upstream`: Array of upstream services with unique IDs
- `headers`: Optional custom headers to add to requests
- `rules`: Routing rules that map paths to upstream services

## Architecture

The proxy uses a master-worker architecture:

1. **Master Process**: Listens for HTTP requests and distributes them to workers
2. **Worker Processes**: Handle individual requests, apply routing rules, and proxy to upstream services
3. **Configuration**: Loaded at startup and shared with all workers

## Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Run in development mode with automatic rebuilding
- `npm start`: Start the production server

## Dependencies

- **commander**: Command-line argument parsing
- **yaml**: YAML configuration file parsing
- **zod**: Runtime type validation
- **@types/node**: TypeScript definitions for Node.js

## License

ISC
