// Durable Object：每个房间一个实例，负责维护该房间的 WebSocket 连接
export class SnapdropRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.connections = new Map(); // key: WebSocket, value: { id }
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const id = crypto.randomUUID();

    this.connections.set(server, { id });
    server.accept();

    // 通知客户端其分配的 ID
    server.send(JSON.stringify({ type: 'joined', id }));

    server.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(server, data);
      } catch (_) {
        // 忽略非 JSON 消息
      }
    });

    server.addEventListener('close', () => {
      this.connections.delete(server);
      // 广播离开消息
      const leaveMsg = JSON.stringify({ type: 'left', sender: id });
      for (const [conn] of this.connections) {
        if (conn.readyState === WebSocket.OPEN) {
          conn.send(leaveMsg);
        }
      }
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  handleMessage(sender, data) {
    const senderInfo = this.connections.get(sender);
    if (!senderInfo) return;

    const senderId = senderInfo.id;
    const { type } = data;

    if (type === 'ping') {
      sender.send(JSON.stringify({ type: 'pong' }));
      return;
    }
    if (type === 'leave') {
      sender.close();
      return;
    }

    // 转发给同房间的其他连接
    const message = { ...data, sender: senderId };
    const json = JSON.stringify(message);
    for (const [conn] of this.connections) {
      if (conn !== sender && conn.readyState === WebSocket.OPEN) {
        conn.send(json);
      }
    }
  }
}

// Worker 入口
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 只处理 /ws 路径的 WebSocket 升级请求
    if (url.pathname === '/ws') {
      const room = url.searchParams.get('room') || 'default';
      const id = env.ROOM.idFromName(room);
      const stub = env.ROOM.get(id);
      return stub.fetch(request);
    }

    // 其他请求由 assets 绑定自动处理（静态资源）
    // 如果 assets 未匹配，Cloudflare 会自动返回 404
    return new Response(null, { status: 404 });
  },
};
