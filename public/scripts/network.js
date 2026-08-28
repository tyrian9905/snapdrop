window.URL = window.URL || window.webkitURL;
window.isRtcSupported = !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection);

// ---------- 中文昵称生成 ----------
const familyNames = ['张','王','李','刘','陈','杨','赵','黄','周','吴','徐','孙','胡','朱','高','林','何','郭','马','罗','梁','宋','郑','谢','韩','唐','冯','于','董','萧','程','曹','袁','邓','许','傅','沈','曾','彭','吕','苏','卢','蒋','蔡','贾','丁','魏','薛','叶','阎','余','潘','杜','戴','夏','钟','汪','田','任','姜','范','方','石','姚','谭','廖','邹','熊','金','陆','郝','孔','白','崔','康','毛','邱','秦','江','史','顾','侯','邵','孟','龙','万','段','雷','钱','汤','尹','黎','易','常','武','乔','贺','赖','龚','文','慕容','令狐','司马','诸葛','上官','欧阳','夏侯','东方','长孙','南宫','公孙'];
const middleNames = ['伟','芳','娜','旭','敏','静','丽','强','磊','军','洋','勇','艳','杰','倩','涛','明','超','秀','霞','平','刚','英','慧','建','文','辉','玲','桂','志','海','玉','珍','兰','云','梓','萱','诗','梦','雨','欣','子','浩','鸣','晨','若','瑾','瑞','逸','思','星','乐','飞','芷','觅','宛','怜','荷','忆','晓','水','凌','菱','琪','盼','怀','惜','枫','亦','依','南','紫','书','琴','灵','柳','元','丝','语','冰','易','青','巧','柏','冬','采','映','曼','彤','蓝','露','寒','白','翠','秋','以','晴','烟','凝','风','霜'];
const lastNames = ['波','海','兰','雪','静','蓉','燕','竹','瑶','英','雁','夏','熙','曦','萱','涵','轩','宇','莲','翠','筠','初','薇','蕾','曼','芙','瑜','珍','芳','辉','强','琴','玉','香','梦','凡','枫','辞','宁','溪','柔','衿','星','念','冉','辰','屿','倦','意','挽','野','觅','寒','琪','琳','睿','哲','浩','然','逸','飞','云','帆','舒','雅','欣','悦','乐','华','音','泽','渊','萍','绾','妧','婳','媱','婵','珩','珏','璋','骁','晟','柳','元','丝','语','冰','易','青','巧','柏','冬','采','映','彤','蓝','露','晴','烟','凝','风','霜'];

function generateChineseName() {
    // 随机选姓氏（含复姓）
    const family = familyNames[Math.floor(Math.random() * familyNames.length)];
    // 随机选中间名
    const middle = middleNames[Math.floor(Math.random() * middleNames.length)];
    let name = family + middle;
    // 70% 概率添加尾字
    if (Math.random() < 0.7) {
        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        name += last;
    }
    return name;
}
// ----------------------------------------------------------------

// ---------- Events ----------
class Events {
  static fire(type, detail) {
    window.dispatchEvent(new CustomEvent(type, { detail: detail }));
  }
  static on(type, callback) {
    return window.addEventListener(type, callback, false);
  }
}

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
            this._reconnectAttempts = 0;
            this.send({ type: 'join', rtcSupported: window.isRtcSupported });
            const name = generateChineseName();
            // 更新本地显示
            const displayNameEl = document.getElementById('displayName');
            if (displayNameEl) {
                displayNameEl.innerHTML = '<b>您的昵称：' + name + '</b>';
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
                el.innerHTML = '<b>您的昵称：' + name + '</b>';
                document.body.appendChild(el);
            }
            // 广播昵称
            this.send({
                type: 'display-name',
                message: {
                    displayName: name,
                    deviceName: navigator.userAgent || 'Unknown Device'
                }
            });
            try { localStorage.setItem('snapdrop-name', name); } catch(_) {}
        };
        ws.onmessage = e => this._onMessage(e.data);
        ws.onclose = e => this._onDisconnect();
        ws.onerror = e => {};
        this._socket = ws;
    }

    _onMessage(msg) {
        msg = JSON.parse(msg);
        switch (msg.type) {
            case 'joined':
                this.myId = msg.id;
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
                if (msg.sender && msg.sender !== this.myId) {
                    if (!window._peerNames) window._peerNames = {};
                    window._peerNames[msg.sender] = msg.message.displayName;
                    Events.fire('peer-display-name', {
                        peerId: msg.sender,
                        displayName: msg.message.displayName
                    });
                    const $peer = document.getElementById(msg.sender);
                    if ($peer) {
                        const nameEl = $peer.querySelector('.name');
                        if (nameEl) nameEl.textContent = msg.message.displayName;
                    }
                }
                break;
            case 'left':
                Events.fire('peer-left', msg.sender);
                break;
            default:
                break;
        }
    }

    send(message) {
        if (!this._isConnected()) {
            return;
        }
        this._socket.send(JSON.stringify(message));
    }

    _endpoint() {
        const room = location.pathname.substring(1) || '';
        let query = '';
        if (room) {
            query = '?room=' + encodeURIComponent(room);
        }
        if (!window.isRtcSupported) {
            query += (query ? '&' : '?') + 'nortc';
        }
        const protocol = location.protocol.startsWith('https') ? 'wss' : 'ws';
        return protocol + '://' + location.host + '/ws' + query;
    }

    _disconnect() {
        this.send({ type: 'disconnect' });
        this._socket.onclose = null;
        this._socket.close();
    }

    _onDisconnect() {
        if (this._reconnectAttempts >= this._maxReconnectAttempts) {
            Events.fire('notify-user', '连接失败，请刷新页面重试');
            return;
        }
        this._reconnectAttempts++;
        Events.fire('notify-user', '连接已中断，5秒之后重试连接...');
        clearTimeout(this._reconnectTimer);
        this._reconnectTimer = setTimeout(_ => this._connect(), 5000);
    }

    _onVisibilityChange() {
        if (document.hidden) return;
        this._connect();
    }

    _isConnected() {
        return this._socket && this._socket.readyState === this._socket.OPEN;
    }

    _isConnecting() {
        return this._socket && this._socket.readyState === this._socket.CONNECTING;
    }
}

// ---------- Peer 类 ----------
class Peer {
    constructor(serverConnection, peerId, peer) {
        this._server = serverConnection;
        this._peerId = peerId;
        this._peer = peer;
        this._filesQueue = [];
        this._busy = false;
    }

    sendJSON(message) {
        this._send(JSON.stringify(message));
    }

    sendFiles(files) {
        for (let i = 0; i < files.length; i++) {
            this._filesQueue.push(files[i]);
        }
        if (this._busy) return;
        this._dequeueFile();
    }

    _dequeueFile() {
        if (!this._filesQueue.length) return;
        this._busy = true;
        const file = this._filesQueue.shift();
        this._sendFile(file);
    }

    _sendFile(file) {
        this.sendJSON({
            type: 'header',
            name: file.name,
            mime: file.type,
            size: file.size
        });
        this._chunker = new FileChunker(file,
            chunk => this._send(chunk),
            offset => this._onPartitionEnd(offset));
        this._chunker.nextPartition();
    }

    _onPartitionEnd(offset) {
        this.sendJSON({ type: 'partition', offset: offset });
    }

    _onReceivedPartitionEnd(offset) {
        this.sendJSON({ type: 'partition-received', offset: offset });
    }

    _sendNextPartition() {
        if (!this._chunker || this._chunker.isFileEnd()) return;
        this._chunker.nextPartition();
    }

    _sendProgress(progress) {
        this.sendJSON({ type: 'progress', progress: progress });
    }

    _onMessage(message) {
        if (typeof message !== 'string') {
            this._onChunkReceived(message);
            return;
        }
        message = JSON.parse(message);
        switch (message.type) {
            case 'header':
                this._onFileHeader(message);
                break;
            case 'partition':
                this._onReceivedPartitionEnd(message);
                break;
            case 'partition-received':
                this._sendNextPartition();
                break;
            case 'progress':
                this._onDownloadProgress(message.progress);
                break;
            case 'transfer-complete':
                this._onTransferCompleted();
                break;
            case 'text':
                this._onTextReceived(message);
                break;
        }
    }

    _onFileHeader(header) {
        this._lastProgress = 0;
        this._digester = new FileDigester({
            name: header.name,
            mime: header.mime,
            size: header.size
        }, file => this._onFileReceived(file));
    }

    _onChunkReceived(chunk) {
        if(!(chunk.byteLength || chunk.size)) return;
        
        this._digester.unchunk(chunk);
        const progress = this._digester.progress;
        this._onDownloadProgress(progress);

        if (progress - this._lastProgress < 0.01) return;
        this._lastProgress = progress;
        this._sendProgress(progress);
    }

    _onDownloadProgress(progress) {
        Events.fire('file-progress', { sender: this._peerId, progress: progress });
    }

    _onFileReceived(proxyFile) {
        Events.fire('file-received', proxyFile);
        this.sendJSON({ type: 'transfer-complete' });
    }

    _onTransferCompleted() {
        this._onDownloadProgress(1);
        this._reader = null;
        this._busy = false;
        this._dequeueFile();
        Events.fire('notify-user', '文件发送成功！');
    }

    sendText(text) {
        const unescaped = btoa(unescape(encodeURIComponent(text)));
        this.sendJSON({ type: 'text', text: unescaped });
    }

    _onTextReceived(message) {
        const escaped = decodeURIComponent(escape(atob(message.text)));
        Events.fire('text-received', { text: escaped, sender: this._peerId });
    }
}

// ---------- RTCPeer 类 ----------
class RTCPeer extends Peer {
    constructor(serverConnection, peerId, peer) {
        super(serverConnection, peerId, peer);
        if (!peerId) return;
        this._connect(peerId, true);
    }

    _connect(peerId, isCaller) {
        if (!this._conn) this._openConnection(peerId, isCaller);
        if (isCaller) {
            this._openChannel();
        } else {
            this._conn.ondatachannel = e => this._onChannelOpened(e);
        }
    }

    _openConnection(peerId, isCaller) {
        this._isCaller = isCaller;
        this._peerId = peerId;
        this._conn = new RTCPeerConnection(RTCPeer.config);
        this._conn.onicecandidate = e => this._onIceCandidate(e);
        this._conn.onconnectionstatechange = e => this._onConnectionStateChange(e);
        this._conn.oniceconnectionstatechange = e => this._onIceConnectionStateChange(e);
    }

    _openChannel() {
        const channel = this._conn.createDataChannel('data-channel', { 
            ordered: true,
            reliable: true
        });
        channel.binaryType = 'arraybuffer';
        channel.onopen = e => this._onChannelOpened(e);
        this._conn.createOffer().then(d => this._onDescription(d)).catch(e => this._onError(e));
    }

    _onDescription(description) {
        this._conn.setLocalDescription(description)
            .then(_ => this._sendSignal({ sdp: description }))
            .catch(e => this._onError(e));
    }

    _onIceCandidate(event) {
        if (!event.candidate) return;
        this._sendSignal({ ice: event.candidate });
    }

    onServerMessage(message) {
        if (!this._conn) this._connect(message.sender, false);
        if (message.sdp) {
            this._conn.setRemoteDescription(new RTCSessionDescription(message.sdp))
                .then( _ => {
                    if (message.sdp.type === 'offer') {
                        return this._conn.createAnswer()
                            .then(d => this._onDescription(d));
                    }
                })
                .catch(e => this._onError(e));
        } else if (message.ice) {
            this._conn.addIceCandidate(new RTCIceCandidate(message.ice));
        }
    }

    _onChannelOpened(event) {
        Events.fire('peer-opened', this._peer);
        const channel = event.channel || event.target;
        channel.onmessage = e => this._onMessage(e.data);
        channel.onclose = e => this._onChannelClosed();
        this._channel = channel;
    }

    _onChannelClosed() {
        if (!this.isCaller) return;
        this._connect(this._peerId, true);
    }

    _onConnectionStateChange(e) {
        switch (this._conn.connectionState) {
            case 'disconnected':
                this._onChannelClosed();
                break;
            case 'failed':
                this._conn = null;
                this._onChannelClosed();
                break;
        }
    }

    _onIceConnectionStateChange() {
        // 忽略
    }

    _onError(error) {
        // 忽略
    }

    _send(message) {
        if (!this._channel) return this.refresh();
        this._channel.send(message);
    }

    _sendSignal(signal) {
        signal.type = 'signal';
        signal.to = this._peerId;
        this._server.send(signal);
    }

    refresh() {
        if (this._isConnected() || this._isConnecting()) return;
        this._connect(this._peerId, this._isCaller);
    }

    _isConnected() {
        return this._channel && this._channel.readyState === 'open';
    }

    _isConnecting() {
        return this._channel && this._channel.readyState === 'connecting';
    }
}

// ---------- PeersManager 类 ----------
class PeersManager {
    constructor(serverConnection) {
        this.peers = {};
        this._server = serverConnection;
        Events.on('signal', e => this._onMessage(e.detail));
        Events.on('peers', e => this._onPeers(e.detail));
        Events.on('peer-joined', e => this._onPeerJoined(e.detail));
        Events.on('refresh', e => this._onRefresh(e.detail));
        Events.on('files-selected', e => this._onFilesSelected(e.detail));
        Events.on('send-text', e => this._onSendText(e.detail));
        Events.on('peer-left', e => this._onPeerLeft(e.detail));
    }

    _onMessage(message) {
        if (this.peers[message.sender]) this.peers[message.sender].onServerMessage(message);
    }

    _onPeerJoined(peer) {
        if (window.isRtcSupported && peer.rtcSupported) {
            this.peers[peer.id] = new RTCPeer(this._server, null, peer);
        }
    }

    _onPeers(peers) {
        peers.forEach(peer => {
            if (window.isRtcSupported && peer.rtcSupported) {
                this.peers[peer.id] = new RTCPeer(this._server, peer.id, peer);
            }
        });
    }

    _onRefresh() {
        Object.values(this.peers).forEach(peer => {
            peer.refresh();
        });
    }

    _onFilesSelected(message) {
        this.peers[message.to].sendFiles(message.files);
    }

    _onSendText(message) {
        this.peers[message.to].sendText(message.text);
    }

    _onPeerLeft(peerId) {
        const peer = this.peers[peerId];
        delete this.peers[peerId];
    }
}

// ---------- FileChunker / FileDigester ----------
class FileChunker {
    constructor(file, onChunk, onPartitionEnd) {
        this._chunkSize = 64000;
        this._maxPartitionSize = 1e6;
        this._offset = 0;
        this._partitionSize = 0;
        this._file = file;
        this._onChunk = onChunk;
        this._onPartitionEnd = onPartitionEnd;
        this._reader = new FileReader();
        this._reader.addEventListener('load', e => this._onChunkRead(e.target.result));
    }

    nextPartition() {
        this._partitionSize = 0;
        this._readChunk();
    }

    _readChunk() {
        const chunk = this._file.slice(this._offset, this._offset + this._chunkSize);
        this._reader.readAsArrayBuffer(chunk);
    }

    _onChunkRead(chunk) {
        this._offset += chunk.byteLength;
        this._partitionSize += chunk.byteLength;
        this._onChunk(chunk);
        if (this._isPartitionEnd() || this.isFileEnd()) {
            this._onPartitionEnd(this._offset);
            return;
        }
        this._readChunk();
    }

    repeatPartition() {
        this._offset -= this._partitionSize;
        this._nextPartition();
    }

    _isPartitionEnd() {
        return this._partitionSize >= this._maxPartitionSize;
    }

    isFileEnd() {
        return this._offset >= this._file.size;
    }

    get progress() {
        return this._offset / this._file.size;
    }
}

class FileDigester {
    constructor(meta, callback) {
        this._buffer = [];
        this._bytesReceived = 0;
        this._size = meta.size;
        this._mime = meta.mime || 'application/octet-stream';
        this._name = meta.name;
        this._callback = callback;
    }

    unchunk(chunk) {
        this._buffer.push(chunk);
        this._bytesReceived += chunk.byteLength || chunk.size;
        const totalChunks = this._buffer.length;
        this.progress = this._bytesReceived / this._size;
        if (isNaN(this.progress)) this.progress = 1;

        if (this._bytesReceived < this._size) return;
        let blob = new Blob(this._buffer, { type: this._mime });
        this._callback({
            name: this._name,
            mime: this._mime,
            size: this._size,
            blob: blob
        });
    }
}

// ---------- RTCPeer 配置 ----------
RTCPeer.config = {
    'sdpSemantics': 'unified-plan',
    'iceServers': [
        {urls: 'stun:stun.l.google.com:19302'},
        {urls:'stun:stun.ekiga.net'},
    ]
};
