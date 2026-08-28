// ... (前面的 Events 和 generateChineseName 不变) ...

// ---------- ServerConnection ----------
class ServerConnection {
    constructor() {
        this.myId = null;
        this._reconnectAttempts = 0;
        this._maxReconnectAttempts = 10;
        this._connect();
        Events.on('beforeunload', e => this._disconnect());
        Events.on('pagehide', e => this._disconnect());
        document.addEventListener('visibilitychange', e => this._onVisibilityChange());
    }

    _connect() {
        clearTimeout(this._reconnectTimer);
        if (this._isConnected() || this._isConnecting()) return;
        const ws = new WebSocket(this._endpoint());
        ws.binaryType = 'arraybuffer';
        ws.onopen = e => {
            console.log('WS: server connected');
            this._reconnectAttempts = 0;
            // 只发送 join，不立即发 display-name
            this.send({ type: 'join', rtcSupported: window.isRtcSupported });
        };
        ws.onmessage = e => this._onMessage(e.data);
        ws.onclose = e => this._onDisconnect();
        ws.onerror = e => console.error(e);
        this._socket = ws;
    }

    _onMessage(msg) {
        msg = JSON.parse(msg);
        console.log('WS:', msg);
        switch (msg.type) {
            case 'joined':
                this.myId = msg.id;
                // 收到 joined 后，生成昵称并广播
                const name = generateChineseName();
                // 更新本地显示
                const displayNameEl = document.getElementById('displayName');
                if (displayNameEl) {
                    displayNameEl.textContent = '您的昵称：' + name;
                } else {
                    const el = document.createElement('div');
                    el.id = 'displayName';
                    el.style.position = 'fixed';
                    el.style.top = '10px';
                    el.style.left = '10px';
                    el.style.background = 'rgba(0,0,0,0.7)';
                    el.style.color = 'white';
                    el.style.padding = '8px 12px';
                    el.style.borderRadius = '4px';
                    el.style.zIndex = '9999';
                    el.textContent = '您的昵称：' + name;
                    document.body.appendChild(el);
                }
                // 广播自己的昵称
                this.send({
                    type: 'display-name',
                    message: {
                        displayName: name,
                        deviceName: navigator.userAgent || 'Unknown Device'
                    }
                });
                try { localStorage.setItem('snapdrop-name', name); } catch(_) {}
                break;

            case 'peers':
                Events.fire('peers', msg.peers);
                break;
            case 'peer-joined':
                Events.fire('peer-joined', msg.peer);
                break;
            case 'peer-left':
                Events.fire('peer-left', msg.peerId);
                break;
            case 'signal':
                Events.fire('signal', msg);
                break;
            case 'ping':
                this.send({ type: 'pong' });
                Events.fire('refresh', msg);
                break;
            case 'display-name':
                // 只处理其他用户的昵称更新
                if (msg.sender && msg.sender !== this.myId) {
                    Events.fire('peer-display-name', {
                        peerId: msg.sender,
                        displayName: msg.message.displayName
                    });
                }
                break;
            case 'left':
                Events.fire('peer-left', msg.sender);
                break;
            default:
                console.warn('WS: unknown message type', msg);
        }
    }

    // ... 其余方法保持不变 ...
}
