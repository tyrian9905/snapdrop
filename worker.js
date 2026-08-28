// Durable Object：每个房间一个实例
export class SnapdropRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.connections = new Map(); // key: WebSocket, value: { id, rtcSupported }
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const id = crypto.randomUUID();

    // 临时存储，等待客户端发送 join 消息来确定 rtcSupported
    const connInfo = { id, rtcSupported: true, joined: false };
    this.connections.set(server, connInfo);

    server.accept();

    // 发送 joined 消息告知自己的 ID
    server.send(JSON.stringify({ type: 'joined', id }));

    // 当收到第一条消息（期望是 join）时处理
    server.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(server, data);
      } catch (_) { /* ignore */ }
    });

    server.addEventListener('close', () => {
      this.connections.delete(server);
      // 广播离开
      const leaveMsg = JSON.stringify({ type: 'peer-left', peerId: id });
      for (const [conn, info] of this.connections) {
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

    const { id: senderId, rtcSupported, joined } = senderInfo;
    const { type } = data;

    // 处理 ping/pong
    if (type === 'ping') {
      sender.send(JSON.stringify({ type: 'pong' }));
      return;
    }

    // 处理 join 消息（首次连接时发送）
    if (type === 'join') {
      if (joined) return; // 防止重复处理
      senderInfo.rtcSupported = data.rtcSupported !== undefined ? data.rtcSupported : true;
      senderInfo.joined = true;

      // 1. 向新客户端发送当前所有其他用户列表（peers）
      const peers = [];
      for (const [conn, info] of this.connections) {
        if (conn !== sender && conn.readyState === WebSocket.OPEN) {
          peers.push({ id: info.id, rtcSupported: info.rtcSupported });
        }
      }
      sender.send(JSON.stringify({ type: 'peers', peers }));

      // 2. 向其他所有用户广播新用户加入
      const joinMsg = JSON.stringify({
        type: 'peer-joined',
        peer: { id: senderId, rtcSupported: senderInfo.rtcSupported }
      });
      for (const [conn, info] of this.connections) {
        if (conn !== sender && conn.readyState === WebSocket.OPEN) {
          conn.send(joinMsg);
        }
      }
      return;
    }

    // 离开
    if (type === 'leave') {
      sender.close();
      return;
    }

    // 转发信号消息（offer / answer / candidate）给目标用户
    if (type === 'signal') {
      const targetId = data.to;
      // 查找目标连接
      for (const [conn, info] of this.connections) {
        if (info.id === targetId && conn.readyState === WebSocket.OPEN) {
          // 添加发送者信息
          const signalMsg = { ...data, sender: senderId };
          conn.send(JSON.stringify(signalMsg));
          break;
        }
      }
      return;
    }

    // 其他消息直接转发给房间内所有人（或忽略）
    // 为安全，这里只转发给其他人
    const forwardMsg = { ...data, sender: senderId };
    const json = JSON.stringify(forwardMsg);
    for (const [conn, info] of this.connections) {
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

    // 只处理 /ws 路径
    if (url.pathname === '/ws') {
      const room = url.searchParams.get('room') || 'default';
      const id = env.ROOM.idFromName(room);
      const stub = env.ROOM.get(id);
      return stub.fetch(request);
    }

    // 其他请求由 assets 处理或返回 404
    return new Response(null, { status: 404 });
  },
};
