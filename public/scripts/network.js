window.URL = window.URL || window.webkitURL;
window.isRtcSupported = !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection);

// ---------- 中文昵称生成（如 ui.js 未提供，此处启用） ----------
const familyNames = ['张','王','李','刘','陈','杨','赵','黄','周','吴','徐','孙','胡','朱','高','林','何','郭','马','罗','梁','宋','郑','谢','韩','唐','冯','于','董','萧','程','曹','袁','邓','许','傅','沈','曾','彭','吕','苏','卢','蒋','蔡','贾','丁','魏','薛','叶','阎','余','潘','杜','戴','夏','钟','汪','田','任','姜','范','方','石','姚','谭','廖','邹','熊','金','陆','郝','孔','白','崔','康','毛','邱','秦','江','史','顾','侯','邵','孟','龙','万','段','雷','钱','汤','尹','黎','易','常','武','乔','贺','赖','龚','文'];
const givenNames = ['伟','芳','娜','秀英','敏','静','丽','强','磊','军','洋','勇','艳','杰','倩','涛','明','超','秀兰','霞','平','刚','桂英','涛','慧','建','文','辉','玲','桂珍','志强','秀梅','海','玉兰','海燕','玉珍','建国','桂兰','秀珍','桂芳','玉英','海涛','秀云','桂云','志明','海峰','建平','文博','文杰','梓涵','梓萱','诗涵','梦瑶','雨桐','欣怡','子轩','浩宇','子涵','一鸣','晨曦','若曦','瑾瑜','瑞霖','雨泽','明熙','逸飞','思睿','星宇','乐瑶','瑾萱','芷柔','灵熙','云熙','觅柔','宛凝','怜雪','听荷','忆文','晓露','水瑶','凌珍','孤菱','梦琪','盼烟','怀瑶','惜蕊','雁枫','凌春','千亦','醉薇','依波','访南','海雪','雨燕','飞荷','紫安','晓枫','含玉','书瑶','乐安','水琴','静柏','从灵','香薇','绿兰','安荷','飞双','南莲','醉柳','尔容','沛山','静竹','元瑶','雁丝','语蓉','冰蝶','醉易','安青','寄灵','冰芹','凌山','醉香','巧曼','梦秋','雨柏','绿竹','妙竹','访云','怜云','孤松','从安','依瑶','晓瑶','紫真','雨真','飞薇','凌筠','盼海','诗双','从冬','妙芙','采蓝','语海','映萱','书萱','芷容','乐菱','访冬','冰蓝','曼彤','尔蓝','安露','寒松','静白','紫雪','春翠','秋柔','凌旋','以冬','凌晴','晓灵','雨荷','飞烟','千凝','水蕊','依风','映之','梦安','冰旋','访风','春蕾','醉蓝','静曼','白筠','从露','秋荷','晓丝','凌香','雨兰','梦槐','紫霜','飞瑶','依玉','凌翠','晓筠','水香','绿海','安梦','静芙','从筠','灵竹','元绿','香萱','乐双','凝珍','怀薇','采枫','紫玉','飞荷','安春','冰凡','从寒','静枫','妙旋','寻雪','如松','映阳','青梦','乐荷','静芙','依柔','香巧','雨真','诗兰','曼荷','飞兰','春兰','醉香','千兰','水荷','梦竹','乐瑶','依凝','香露','水瑶','怜蕾','秋荷','静松','念薇','飞雪','梦琪','以晴','夏槐','冰枫','春枫','雨筠','依云','诗云','香波','水波','春波','醉波','芷波','妙波','采波','雪波','冰波','梦波','雅波','凝波','忆波','访波','灵波','碧波','翠波','荷波','菱波','萍波','莲波','芝波','蓉波','薇波','茹波','蕾波','蕊波','萱波','菡波','菁波','蔚波','蓝波','滢波','澈波','漪波','澜波','澄波','溶波','渺波','淡波','清波','洁波','净波','明波','皓波','熙波','润波','沛波','泽波','瀚波','凌波','飞波','逸波','傲波','振波','正波','直波','刚波','毅波','勇波','猛波','威波','严波','宁波','安波','定波','恒波','远波','长波','永波','久波','新波','华波','兴波','昌波','盛波','世波','民波','政波','治波','理波','文波','章波','书波','画波','乐波','歌波','舞波','韵波','律波','风波','云波','雨波','雪波','雷波','电波','光波','辉波','煌波','灿波','烂波','妙波','奇波','异波','彩波','瑰波','琳波','琅波','碧波','瑄波','瑶波','琼波','琳波','琅波','琪波','璇波','瑜波','瑾波','玫波','瑰波','莹波','晶波','珠波','玉波','巧波','灵波','慧波','敏波','捷波','迅波','速波','锐波','智波','勇波','毅波','坚波','强波'];
function generateChineseName() {
  const family = familyNames[Math.floor(Math.random() * familyNames.length)];
  const given = givenNames[Math.floor(Math.random() * givenNames.length)];
  return family + given;
}
// ----------------------------------------------------------------

// ---------- Events 类 ----------
class Events {
  static fire(type, detail) {
    window.dispatchEvent(new CustomEvent(type, { detail: detail }));
  }
  static on(type, callback) {
    return window.addEventListener(type, callback, false);
  }
}

// ---------- ServerConnection（已修改） ----------
class ServerConnection {
    constructor() {
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
        
            // 发送 join 消息
            this.send({ type: 'join', rtcSupported: window.isRtcSupported });
        
            // 生成昵称
            const name = generateChineseName();
        
            // 强制在页面左上角显示昵称（即使 index.html 没有 #displayName）
            const existing = document.getElementById('snapdrop-nickname');
            if (existing) existing.remove();
            const div = document.createElement('div');
            div.id = 'snapdrop-nickname';
            div.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px 14px;
                border-radius: 20px;
                font-size: 16px;
                z-index: 9999;
                font-family: sans-serif;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            `;
            div.textContent = '👤 ' + name;
            document.body.appendChild(div);
        
            // 同时按标准格式发送 display-name（兼容 ui.js）
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
        ws.onerror = e => console.error(e);
        this._socket = ws;
    }

    _onMessage(msg) {
        msg = JSON.parse(msg);
        console.log('WS:', msg);
        switch (msg.type) {
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
                Events.fire('display-name', msg);
                break;
            case 'joined':
                // 忽略（已由服务器处理）
                break;
            case 'left':
                // 兼容旧版本，转换为 peer-left
                Events.fire('peer-left', msg.sender);
                break;
            default:
                console.warn('WS: unknown message type', msg);
        }
    }

    send(message) {
        if (!this._isConnected()) {
            console.warn('WS: not connected, message dropped');
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
        console.log('WS: server disconnected');
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

// ---------- Peer 类（未修改） ----------
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
        console.log('RTC:', message);
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

// ---------- RTCPeer 类（未修改） ----------
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
        console.log('RTC: channel opened with', this._peerId);
        Events.fire('peer-opened', this._peer);
        const channel = event.channel || event.target;
        channel.onmessage = e => this._onMessage(e.data);
        channel.onclose = e => this._onChannelClosed();
        this._channel = channel;
    }

    _onChannelClosed() {
        console.log('RTC: channel closed with', this._peerId);
        if (!this.isCaller) return;
        this._connect(this._peerId, true);
    }

    _onConnectionStateChange(e) {
        console.log('RTC: state changed:', this._conn.connectionState);
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
        switch (this._conn.iceConnectionState) {
            case 'failed':
                console.error('ICE Gathering failed');
                break;
            default:
                console.log('ICE Gathering', this._conn.iceConnectionState);
        }
    }

    _onError(error) {
        console.error(error);
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

// ---------- PeersManager 类（未修改） ----------
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

// ---------- FileChunker / FileDigester（未修改） ----------
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
