// 3D_navigation_api.js
// 图书馆3D导航系统API接口
// 版本: 1.0.0
// 最后更新: 2024-01-01

(function() {
    'use strict';
    
    // ============================================
    // API 主对象
    // ============================================
    const LibraryNavigationAPI = {
        // API版本
        version: '1.0.0',
        
        // 内部状态
        _initialized: false,
        _ready: false,
        _eventListeners: {},
        
        // ============================================
        // 初始化方法 - 等待3D系统就绪
        // ============================================
        init: function(callback) {
            console.log('[API] 初始化LibraryNavigationAPI...');
            
            // 检查是否已经初始化
            if (this._initialized) {
                console.log('[API] API已经初始化');
                if (callback) callback(true);
                return true;
            }
            
            // 标记为已开始初始化
            this._initialized = true;
            
            // 检查必要的全局变量和函数是否存在
            const checkInterval = setInterval(() => {
                if (this._checkSystemReady()) {
                    clearInterval(checkInterval);
                    this._ready = true;
                    console.log('[API] 3D导航系统已就绪，API初始化完成');
                    
                    // 触发初始化完成事件
                    this._triggerEvent('initialized');
                    
                    if (callback) callback(true);
                }
            }, 200); // 每200ms检查一次
            
            // 设置超时时间（10秒）
            setTimeout(() => {
                if (!this._ready) {
                    clearInterval(checkInterval);
                    console.error('[API] 初始化超时：3D导航系统未在10秒内就绪');
                    this._triggerEvent('error', {
                        type: 'timeout',
                        message: '3D导航系统初始化超时'
                    });
                    
                    if (callback) callback(false);
                }
            }, 10000);
            
            return true;
        },
        
        // ============================================
        // 设置起点
        // ============================================
        setStartPoint: function(data) {
            // 验证API是否就绪
            if (!this._validateReady('setStartPoint')) {
                return {
                    success: false,
                    error: 'API未就绪，请先调用init()方法'
                };
            }
            
            // 验证数据格式
            const validationResult = this._validateData(data, 'start');
            if (!validationResult.valid) {
                this._triggerEvent('error', {
                    type: 'validation',
                    message: validationResult.error,
                    data: data
                });
                return {
                    success: false,
                    error: validationResult.error
                };
            }
            
            try {
                // 查找对应的可点击层
                const layer = this._findClickableLayer(data);
                if (!layer) {
                    const errorMsg = data.isDoor ? 
                        '未找到大门点击层' : 
                        `未找到书架${data.shelfIndex} ${data.face}面 第${data.column}列第${data.row}层的点击层`;
                    
                    this._triggerEvent('error', {
                        type: 'not_found',
                        message: errorMsg,
                        data: data
                    });
                    
                    return {
                        success: false,
                        error: errorMsg
                    };
                }
                
                // 取消当前的设置模式（如果存在）
                this._cancelSettingModes();
                
                // 调用现有的设置函数
                if (data.isDoor) {
                    if (typeof setDoorStartPoint !== 'undefined') {
                        setDoorStartPoint(layer.userData, layer);
                    } else {
                        // 备用方案：直接更新起点信息
                        this._updateStartPointForDoor();
                    }
                } else {
                    if (typeof setStartPoint !== 'undefined') {
                        setStartPoint(layer.userData, layer);
                    } else {
                        // 备用方案：直接更新起点信息
                        this._updateStartPointForShelf(data);
                    }
                }
                
                // 触发设置成功事件
                this._triggerEvent('startPointSet', data);
                
                console.log(`[API] 起点设置成功:`, data);
                return {
                    success: true,
                    message: '起点设置成功'
                };
                
            } catch (error) {
                console.error('[API] 设置起点时发生错误:', error);
                this._triggerEvent('error', {
                    type: 'runtime',
                    message: '设置起点时发生运行时错误',
                    error: error.message,
                    data: data
                });
                
                return {
                    success: false,
                    error: `运行时错误: ${error.message}`
                };
            }
        },
        
        // ============================================
        // 设置终点
        // ============================================
        setEndPoint: function(data) {
            // 验证API是否就绪
            if (!this._validateReady('setEndPoint')) {
                return {
                    success: false,
                    error: 'API未就绪，请先调用init()方法'
                };
            }
            
            // 验证数据格式
            const validationResult = this._validateData(data, 'end');
            if (!validationResult.valid) {
                this._triggerEvent('error', {
                    type: 'validation',
                    message: validationResult.error,
                    data: data
                });
                return {
                    success: false,
                    error: validationResult.error
                };
            }
            
            try {
                // 查找对应的可点击层
                const layer = this._findClickableLayer(data);
                if (!layer) {
                    const errorMsg = data.isDoor ? 
                        '未找到大门点击层' : 
                        `未找到书架${data.shelfIndex} ${data.face}面 第${data.column}列第${data.row}层的点击层`;
                    
                    this._triggerEvent('error', {
                        type: 'not_found',
                        message: errorMsg,
                        data: data
                    });
                    
                    return {
                        success: false,
                        error: errorMsg
                    };
                }
                
                // 取消当前的设置模式（如果存在）
                this._cancelSettingModes();
                
                // 调用现有的设置函数
                if (data.isDoor) {
                    if (typeof setDoorEndPoint !== 'undefined') {
                        setDoorEndPoint(layer.userData, layer);
                    } else {
                        // 备用方案：直接更新终点信息
                        this._updateEndPointForDoor();
                    }
                } else {
                    if (typeof setEndPoint !== 'undefined') {
                        setEndPoint(layer.userData, layer);
                    } else {
                        // 备用方案：直接更新终点信息
                        this._updateEndPointForShelf(data);
                    }
                }
                
                // 触发设置成功事件
                this._triggerEvent('endPointSet', data);
                
                console.log(`[API] 终点设置成功:`, data);
                return {
                    success: true,
                    message: '终点设置成功'
                };
                
            } catch (error) {
                console.error('[API] 设置终点时发生错误:', error);
                this._triggerEvent('error', {
                    type: 'runtime',
                    message: '设置终点时发生运行时错误',
                    error: error.message,
                    data: data
                });
                
                return {
                    success: false,
                    error: `运行时错误: ${error.message}`
                };
            }
        },
        
        // ============================================
        // 计算路径
        // ============================================
        calculatePath: function() {
            // 验证API是否就绪
            if (!this._validateReady('calculatePath')) {
                return {
                    success: false,
                    error: 'API未就绪，请先调用init()方法'
                };
            }
            
            // 检查起点终点是否已设置
            if (!this._checkStartEndSet()) {
                return {
                    success: false,
                    error: '请先设置起点和终点'
                };
            }
            
            try {
                // 调用现有的路径计算函数
                if (typeof calculateAndShowPath !== 'undefined') {
                    calculateAndShowPath();
                    
                    // 触发路径计算事件
                    this._triggerEvent('pathCalculated');
                    
                    console.log('[API] 路径计算已触发');
                    return {
                        success: true,
                        message: '路径计算已触发'
                    };
                } else {
                    this._triggerEvent('error', {
                        type: 'function_missing',
                        message: 'calculateAndShowPath函数不存在'
                    });
                    
                    return {
                        success: false,
                        error: '路径计算功能不可用'
                    };
                }
            } catch (error) {
                console.error('[API] 计算路径时发生错误:', error);
                this._triggerEvent('error', {
                    type: 'runtime',
                    message: '计算路径时发生运行时错误',
                    error: error.message
                });
                
                return {
                    success: false,
                    error: `运行时错误: ${error.message}`
                };
            }
        },
        
        // ============================================
        // 清除所有设置
        // ============================================
        clear: function() {
            if (!this._ready) {
                console.warn('[API] API未就绪，无法清除设置');
                return {
                    success: false,
                    error: 'API未就绪'
                };
            }
            
            try {
                // 清除起点
                if (typeof startMarker !== 'undefined' && startMarker) {
                    if (typeof scene !== 'undefined') {
                        scene.remove(startMarker);
                    }
                    startPoint = null;
                    startMarker = null;
                }
                
                // 清除终点
                if (typeof endMarker !== 'undefined' && endMarker) {
                    if (typeof scene !== 'undefined') {
                        scene.remove(endMarker);
                    }
                    endPoint = null;
                    endMarker = null;
                }
                
                // 清除路径线
                if (typeof pathLine !== 'undefined' && pathLine) {
                    if (typeof scene !== 'undefined') {
                        scene.remove(pathLine);
                    }
                    pathLine = null;
                }
                
                // 清除垂直连接线
                if (typeof verticalConnectors !== 'undefined') {
                    for (let connector of verticalConnectors) {
                        if (connector && typeof scene !== 'undefined') {
                            scene.remove(connector);
                        }
                    }
                    verticalConnectors = [];
                }
                
                // 更新UI信息
                this._updateUI();
                
                // 触发清除事件
                this._triggerEvent('cleared');
                
                console.log('[API] 所有设置已清除');
                return {
                    success: true,
                    message: '所有设置已清除'
                };
                
            } catch (error) {
                console.error('[API] 清除设置时发生错误:', error);
                return {
                    success: false,
                    error: `运行时错误: ${error.message}`
                };
            }
        },
        
        // ============================================
        // 获取当前状态
        // ============================================
        getStatus: function() {
            if (!this._ready) {
                return {
                    ready: false,
                    initialized: this._initialized,
                    error: 'API未就绪'
                };
            }
            
            try {
                const status = {
                    ready: this._ready,
                    initialized: this._initialized,
                    startPoint: null,
                    endPoint: null,
                    hasPath: false
                };
                
                // 获取起点状态
                if (typeof startPoint !== 'undefined' && startPoint) {
                    status.startPoint = {
                        isDoor: startPoint.isDoor || false,
                        shelfIndex: startPoint.shelfIndex || null,
                        face: startPoint.face || null,
                        column: startPoint.column || null,
                        row: startPoint.row || null,
                        position: startPoint.position ? {
                            x: startPoint.position.x,
                            y: startPoint.position.y,
                            z: startPoint.position.z
                        } : null
                    };
                }
                
                // 获取终点状态
                if (typeof endPoint !== 'undefined' && endPoint) {
                    status.endPoint = {
                        isDoor: endPoint.isDoor || false,
                        shelfIndex: endPoint.shelfIndex || null,
                        face: endPoint.face || null,
                        column: endPoint.column || null,
                        row: endPoint.row || null,
                        position: endPoint.position ? {
                            x: endPoint.position.x,
                            y: endPoint.position.y,
                            z: endPoint.position.z
                        } : null
                    };
                }
                
                // 检查是否有路径
                if (typeof pathLine !== 'undefined' && pathLine) {
                    status.hasPath = true;
                }
                
                return status;
                
            } catch (error) {
                console.error('[API] 获取状态时发生错误:', error);
                return {
                    ready: this._ready,
                    initialized: this._initialized,
                    error: `获取状态时发生错误: ${error.message}`
                };
            }
        },
        
        // ============================================
        // 事件监听
        // ============================================
        on: function(eventName, callback) {
            if (!this._eventListeners[eventName]) {
                this._eventListeners[eventName] = [];
            }
            this._eventListeners[eventName].push(callback);
            console.log(`[API] 添加事件监听: ${eventName}`);
            return this;
        },
        
        off: function(eventName, callback) {
            if (!this._eventListeners[eventName]) {
                return this;
            }
            
            if (callback) {
                const index = this._eventListeners[eventName].indexOf(callback);
                if (index !== -1) {
                    this._eventListeners[eventName].splice(index, 1);
                }
            } else {
                // 如果没有指定callback，移除该事件的所有监听器
                this._eventListeners[eventName] = [];
            }
            
            console.log(`[API] 移除事件监听: ${eventName}`);
            return this;
        },
        
        // ============================================
        // 内部辅助方法
        // ============================================
        
        // 检查3D系统是否就绪
        _checkSystemReady: function() {
            const requiredGlobals = [
                'clickableLayers', 'doorLayers', 'scene',
                'startPoint', 'endPoint', 'shelves'
            ];
            
            const requiredFunctions = [
                'updateStartInfo', 'updateEndInfo'
            ];
            
            // 检查全局变量
            for (const globalName of requiredGlobals) {
                if (typeof window[globalName] === 'undefined') {
                    console.log(`[API] 等待全局变量: ${globalName}`);
                    return false;
                }
            }
            
            // 检查函数
            for (const funcName of requiredFunctions) {
                if (typeof window[funcName] !== 'function') {
                    console.log(`[API] 等待函数: ${funcName}`);
                    return false;
                }
            }
            
            return true;
        },
        
        // 验证API是否就绪
        _validateReady: function(operation) {
            if (!this._ready) {
                console.error(`[API] 无法执行 ${operation}: API未就绪`);
                return false;
            }
            return true;
        },
        
        // 验证数据格式
        _validateData: function(data, pointType) {
            // 检查必需字段
            if (!data || typeof data !== 'object') {
                return {
                    valid: false,
                    error: '数据格式无效，必须是一个对象'
                };
            }
            
            // 检查是否为大门
            if (data.isDoor === true) {
                // 大门数据验证通过
                return { valid: true };
            }
            
            // 书架数据验证
            const requiredFields = ['shelfIndex', 'face', 'column', 'row'];
            const missingFields = [];
            
            for (const field of requiredFields) {
                if (typeof data[field] === 'undefined' || data[field] === null) {
                    missingFields.push(field);
                }
            }
            
            if (missingFields.length > 0) {
                return {
                    valid: false,
                    error: `缺少必需字段: ${missingFields.join(', ')}`
                };
            }
            
            // 验证书架号范围 (1-14)
            if (data.shelfIndex < 1 || data.shelfIndex > 14) {
                return {
                    valid: false,
                    error: `书架号无效: ${data.shelfIndex}，必须在1-14范围内`
                };
            }
            
            // 验证正面/背面
            if (data.face !== 'front' && data.face !== 'back') {
                return {
                    valid: false,
                    error: `面参数无效: ${data.face}，必须是'front'或'back'`
                };
            }
            
            // 验证列号范围 (1-3)
            if (data.column < 1 || data.column > 3) {
                return {
                    valid: false,
                    error: `列号无效: ${data.column}，必须在1-3范围内`
                };
            }
            
            // 验证层号范围 (1-4)
            if (data.row < 1 || data.row > 4) {
                return {
                    valid: false,
                    error: `层号无效: ${data.row}，必须在1-4范围内`
                };
            }
            
            return { valid: true };
        },
        
        // 查找可点击层
        _findClickableLayer: function(data) {
            if (data.isDoor) {
                // 查找大门点击层
                // 默认使用外侧，如果有指定doorFace则使用指定值
                const doorFace = data.doorFace || 'outside';
                
                if (typeof doorLayers !== 'undefined' && Array.isArray(doorLayers)) {
                    for (const layer of doorLayers) {
                        if (layer && layer.userData && layer.userData.doorFace === doorFace) {
                            return layer;
                        }
                    }
                }
                
                // 如果在doorLayers中没找到，尝试在clickableLayers中查找
                if (typeof clickableLayers !== 'undefined' && Array.isArray(clickableLayers)) {
                    for (const layer of clickableLayers) {
                        if (layer && layer.userData && layer.userData.isDoor && 
                            layer.userData.doorFace === doorFace) {
                            return layer;
                        }
                    }
                }
                
                return null;
            } else {
                // 查找书架点击层
                if (typeof clickableLayers !== 'undefined' && Array.isArray(clickableLayers)) {
                    for (const layer of clickableLayers) {
                        if (layer && layer.userData && layer.userData.isShelfLayer) {
                            const userData = layer.userData;
                            
                            // 匹配所有条件
                            if (userData.shelfIndex === data.shelfIndex &&
                                userData.face === data.face &&
                                userData.column === data.column &&
                                userData.row === data.row) {
                                return layer;
                            }
                        }
                    }
                }
                
                return null;
            }
        },
        
        // 取消设置模式
        _cancelSettingModes: function() {
            if (typeof isSettingStart !== 'undefined') {
                isSettingStart = false;
            }
            if (typeof isSettingEnd !== 'undefined') {
                isSettingEnd = false;
            }
            
            // 移除按钮的active状态
            const startBtn = document.getElementById('startBtn');
            const endBtn = document.getElementById('endBtn');
            
            if (startBtn) startBtn.classList.remove('active');
            if (endBtn) endBtn.classList.remove('active');
        },
        
        // 检查起点终点是否已设置
        _checkStartEndSet: function() {
            const startSet = typeof startPoint !== 'undefined' && startPoint !== null;
            const endSet = typeof endPoint !== 'undefined' && endPoint !== null;
            
            return startSet && endSet;
        },
        
        // 触发事件
        _triggerEvent: function(eventName, data) {
            if (!this._eventListeners[eventName]) {
                return;
            }
            
            // 创建事件对象
            const event = {
                type: eventName,
                timestamp: Date.now(),
                data: data || null
            };
            
            // 调用所有监听器
            for (const callback of this._eventListeners[eventName]) {
                try {
                    callback(event);
                } catch (error) {
                    console.error(`[API] 事件监听器错误 (${eventName}):`, error);
                }
            }
        },
        
        // 更新UI信息
        _updateUI: function() {
            if (typeof updateStartInfo === 'function') {
                updateStartInfo();
            }
            if (typeof updateEndInfo === 'function') {
                updateEndInfo();
            }
            if (typeof updatePathInfo === 'function') {
                updatePathInfo(0); // 重置路径信息
            }
        },
        
        // 备用方案：更新大门起点信息
        _updateStartPointForDoor: function() {
            if (typeof startMarker !== 'undefined' && startMarker) {
                if (typeof scene !== 'undefined') {
                    scene.remove(startMarker);
                }
            }
            
            // 创建大门起点标记
            const geometry = new THREE.ConeGeometry(0.3, -0.8, 16);
            const material = new THREE.MeshLambertMaterial({ 
                color: 0x4CAF50,
                emissive: 0x2E7D32,
                emissiveIntensity: 2.5
            });
            startMarker = new THREE.Mesh(geometry, material);
            
            const markerPos = new THREE.Vector3(
                0.5,     // DOOR_UNIFIED_POSITION.x
                3.4,     // DOOR_UNIFIED_POSITION.y + 0.8
                -11.3    // DOOR_UNIFIED_POSITION.z
            );
            
            startMarker.position.copy(markerPos);
            scene.add(startMarker);
            
            // 更新起点信息
            startPoint = {
                isDoor: true,
                name: '大门',
                position: markerPos.clone(),
                faceChinese: '大门'
            };
            
            // 更新UI
            this._updateUI();
            
            console.log('[API] 通过备用方案设置大门起点');
        },
        
        // 备用方案：更新大门终点信息
        _updateEndPointForDoor: function() {
            if (typeof endMarker !== 'undefined' && endMarker) {
                if (typeof scene !== 'undefined') {
                    scene.remove(endMarker);
                }
            }
            
            // 创建大门终点标记
            const geometry = new THREE.ConeGeometry(0.3, -0.8, 16);
            const material = new THREE.MeshLambertMaterial({ 
                color: 0xF44336,
                emissive: 0xC62828,
                emissiveIntensity: 2.5
            });
            endMarker = new THREE.Mesh(geometry, material);
            
            const markerPos = new THREE.Vector3(
                0.5,     // DOOR_UNIFIED_POSITION.x
                3.4,     // DOOR_UNIFIED_POSITION.y + 0.8
                -11.3    // DOOR_UNIFIED_POSITION.z
            );
            
            endMarker.position.copy(markerPos);
            scene.add(endMarker);
            
            // 更新终点信息
            endPoint = {
                isDoor: true,
                name: '大门',
                position: markerPos.clone(),
                faceChinese: '大门'
            };
            
            // 更新UI
            this._updateUI();
            
            console.log('[API] 通过备用方案设置大门终点');
        },
        
        // 备用方案：更新书架起点信息
        _updateStartPointForShelf: function(data) {
            // 这是一个简化的备用方案
            // 在实际使用中，应该使用3D系统的原生函数
            
            console.warn('[API] 使用备用方案设置书架起点，3D标记可能无法正确显示');
            
            // 创建起点信息
            startPoint = {
                shelfIndex: data.shelfIndex,
                column: data.column,
                row: data.row,
                face: data.face,
                position: new THREE.Vector3(0, 1, 0) // 简化位置
            };
            
            // 更新UI
            this._updateUI();
            
            // 提示用户
            this._triggerEvent('warning', {
                message: '使用备用方案设置起点，3D标记可能无法正确显示',
                data: data
            });
        },
        
        // 备用方案：更新书架终点信息
        _updateEndPointForShelf: function(data) {
            // 这是一个简化的备用方案
            // 在实际使用中，应该使用3D系统的原生函数
            
            console.warn('[API] 使用备用方案设置书架终点，3D标记可能无法正确显示');
            
            // 创建终点信息
            endPoint = {
                shelfIndex: data.shelfIndex,
                column: data.column,
                row: data.row,
                face: data.face,
                position: new THREE.Vector3(0, 1, 0) // 简化位置
            };
            
            // 更新UI
            this._updateUI();
            
            // 提示用户
            this._triggerEvent('warning', {
                message: '使用备用方案设置终点，3D标记可能无法正确显示',
                data: data
            });
        }
    };
    
    // ... 之前的API代码保持不变 ...

    // ============================================
    // 将API挂载到全局对象
    // ============================================
    if (typeof window !== 'undefined') {
        window.LibraryNavigationAPI = LibraryNavigationAPI;
        console.log('[API] LibraryNavigationAPI已注册到全局对象');
        
        // 提供一个公开的手动初始化方法
        LibraryNavigationAPI.manualInit = function(callback) {
            return this.init(callback);
        };
        
        // 不再自动初始化，等待手动调用
    }

    // ... 导出代码保持不变 ...
    
    // 导出API对象（如果支持模块化）
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = LibraryNavigationAPI;
    }
    
})();