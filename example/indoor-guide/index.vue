<template>
  <view class="container">
    <!-- 配置模式 -->
    <view v-if="mode === 'config'" class="config-panel">
      <view class="header">
        <text class="title">图书馆导航</text>
      </view>

      <!-- 起点设置 -->
      <view class="section">
        <view class="section-title">起点</view>
        <view class="point-config">
          <radio-group @change="onStartTypeChange" class="type-radio">
            <label class="radio-item">
              <radio value="door" :checked="startType === 'door'" /> 大门
            </label>
            <label class="radio-item">
              <radio value="shelf" :checked="startType === 'shelf'" /> 书架
            </label>
          </radio-group>

          <template v-if="startType === 'shelf'">
            <view class="shelf-selector">
              <picker @change="onStartShelfChange" :range="shelfOptions" range-key="label" class="picker">
                <view class="picker-display">{{ startShelfLabel || '选择书架' }}</view>
              </picker>
              <picker @change="onStartFaceChange" :range="faceOptions" range-key="label" class="picker">
                <view class="picker-display">{{ startFaceLabel || '选择面' }}</view>
              </picker>
              <picker @change="onStartColumnChange" :range="columnOptions" class="picker">
                <view class="picker-display">{{ startColumn ? `第${startColumn}列` : '列' }}</view>
              </picker>
              <picker @change="onStartRowChange" :range="rowOptions" class="picker">
                <view class="picker-display">{{ startRow ? `第${startRow}层` : '层' }}</view>
              </picker>
            </view>
          </template>

          <template v-else>
            <!-- 大门内外侧（可选，根据需求保留） -->
            <picker @change="onStartDoorFaceChange" :range="doorFaceOptions" range-key="label" class="picker door-face-picker">
              <view class="picker-display">{{ startDoorFaceLabel || '内外侧(可选)' }}</view>
            </picker>
          </template>
        </view>
      </view>

      <!-- 终点设置（结构与起点类似） -->
      <view class="section">
        <view class="section-title">终点</view>
        <view class="point-config">
          <radio-group @change="onEndTypeChange" class="type-radio">
            <label class="radio-item">
              <radio value="door" :checked="endType === 'door'" /> 大门
            </label>
            <label class="radio-item">
              <radio value="shelf" :checked="endType === 'shelf'" /> 书架
            </label>
          </radio-group>

          <template v-if="endType === 'shelf'">
            <view class="shelf-selector">
              <picker @change="onEndShelfChange" :range="shelfOptions" range-key="label" class="picker">
                <view class="picker-display">{{ endShelfLabel || '选择书架' }}</view>
              </picker>
              <picker @change="onEndFaceChange" :range="faceOptions" range-key="label" class="picker">
                <view class="picker-display">{{ endFaceLabel || '选择面' }}</view>
              </picker>
              <picker @change="onEndColumnChange" :range="columnOptions" class="picker">
                <view class="picker-display">{{ endColumn ? `第${endColumn}列` : '列' }}</view>
              </picker>
              <picker @change="onEndRowChange" :range="rowOptions" class="picker">
                <view class="picker-display">{{ endRow ? `第${endRow}层` : '层' }}</view>
              </picker>
            </view>
          </template>

          <template v-else>
            <picker @change="onEndDoorFaceChange" :range="doorFaceOptions" range-key="label" class="picker door-face-picker">
              <view class="picker-display">{{ endDoorFaceLabel || '内外侧(可选)' }}</view>
            </picker>
          </template>
        </view>
      </view>

      <!-- 按钮区 -->
      <view class="button-group">
        <button @click="clearAll" class="btn clear">清空</button>
        <button @click="startNavigation" class="btn navigate" :disabled="!canNavigate">开始导航</button>
      </view>
    </view>

    <!-- 导航模式：显示 web-view -->
    <view v-else class="navigation-mode">
      <!-- 返回配置按钮（悬浮） -->
      <view class="back-btn" @click="backToConfig">
        <text class="back-icon">←</text>
        <text>返回配置</text>
      </view>
      <web-view :src="webViewUrl" @message="handleWebViewMessage"></web-view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      mode: 'config', // 'config' 或 'navigation'

      // 起点类型
      startType: 'door',
      // 起点书架数据
      startShelf: null, // 书架号 1-14
      startFace: null,  // 'front' 或 'back'
      startColumn: null,
      startRow: null,
      // 起点大门内外侧（可选，默认 outside）
      startDoorFace: 'outside',

      // 终点类型
      endType: 'door',
      endShelf: null,
      endFace: null,
      endColumn: null,
      endRow: null,
      endDoorFace: 'outside',

      // 选项数据
      shelfOptions: [], // 将填充 1-14 的标签
      faceOptions: [
        { value: 'front', label: '正面' },
        { value: 'back', label: '背面' }
      ],
      columnOptions: [1, 2, 3],
      rowOptions: [1, 2, 3, 4],
      doorFaceOptions: [
        { value: 'outside', label: '外侧' },
        { value: 'inside', label: '内侧' }
      ],

      // web-view 地址（请替换为您的实际地址）
      baseWebViewUrl: 'https://stillwrd-dh.github.io/3D-navigation/3D_navigation(editor).html'
    }
  },

  computed: {
    // 起点显示标签
    startShelfLabel() {
      const opt = this.shelfOptions.find(o => o.value === this.startShelf)
      return opt ? opt.label : ''
    },
    startFaceLabel() {
      const opt = this.faceOptions.find(o => o.value === this.startFace)
      return opt ? opt.label : ''
    },
    startDoorFaceLabel() {
      const opt = this.doorFaceOptions.find(o => o.value === this.startDoorFace)
      return opt ? opt.label : ''
    },

    // 终点显示标签
    endShelfLabel() {
      const opt = this.shelfOptions.find(o => o.value === this.endShelf)
      return opt ? opt.label : ''
    },
    endFaceLabel() {
      const opt = this.faceOptions.find(o => o.value === this.endFace)
      return opt ? opt.label : ''
    },
    endDoorFaceLabel() {
      const opt = this.doorFaceOptions.find(o => o.value === this.endDoorFace)
      return opt ? opt.label : ''
    },

    // 是否可以开始导航（起点终点已选）
    canNavigate() {
      const startOk = this.startType === 'door' ? true : (this.startShelf && this.startFace && this.startColumn && this.startRow)
      const endOk = this.endType === 'door' ? true : (this.endShelf && this.endFace && this.endColumn && this.endRow)
      return startOk && endOk
    },

    // 构建起点数据对象（符合 API 格式）
    startData() {
      if (this.startType === 'door') {
        return {
          isDoor: true,
          doorFace: this.startDoorFace // 可选，不必须
        }
      } else {
        return {
          isDoor: false,
          shelfIndex: this.startShelf,
          face: this.startFace,
          column: this.startColumn,
          row: this.startRow
        }
      }
    },

    // 构建终点数据对象
    endData() {
      if (this.endType === 'door') {
        return {
          isDoor: true,
          doorFace: this.endDoorFace
        }
      } else {
        return {
          isDoor: false,
          shelfIndex: this.endShelf,
          face: this.endFace,
          column: this.endColumn,
          row: this.endRow
        }
      }
    },

    // 构建完整的 init 命令，编码为 hash
    webViewUrl() {
      // 构造 init 命令，假设 HTML 支持 action: 'init'，数据包含 start 和 end
      const command = {
        action: 'init',
        data: {
          start: this.startData,
          end: this.endData
        },
        messageId: Date.now().toString()
      }
      const hash = encodeURIComponent(JSON.stringify(command))
      return `${this.baseWebViewUrl}#${hash}`
    }
  },

  created() {
    // 初始化书架选项 1-14
    const shelves = []
    for (let i = 1; i <= 14; i++) {
      shelves.push({ value: i, label: `书架${i}` })
    }
    this.shelfOptions = shelves
  },

  methods: {
    // 起点类型切换
    onStartTypeChange(e) {
      this.startType = e.detail.value
      // 重置书架相关选项
      if (this.startType === 'shelf') {
        this.startShelf = null
        this.startFace = null
        this.startColumn = null
        this.startRow = null
      } else {
        this.startDoorFace = 'outside'
      }
    },

    onStartShelfChange(e) {
      const index = e.detail.value
      this.startShelf = this.shelfOptions[index].value
    },
    onStartFaceChange(e) {
      const index = e.detail.value
      this.startFace = this.faceOptions[index].value
    },
    onStartColumnChange(e) {
      this.startColumn = this.columnOptions[e.detail.value]
    },
    onStartRowChange(e) {
      this.startRow = this.rowOptions[e.detail.value]
    },
    onStartDoorFaceChange(e) {
      const index = e.detail.value
      this.startDoorFace = this.doorFaceOptions[index].value
    },

    // 终点类似
    onEndTypeChange(e) {
      this.endType = e.detail.value
      if (this.endType === 'shelf') {
        this.endShelf = null
        this.endFace = null
        this.endColumn = null
        this.endRow = null
      } else {
        this.endDoorFace = 'outside'
      }
    },
    onEndShelfChange(e) {
      const index = e.detail.value
      this.endShelf = this.shelfOptions[index].value
    },
    onEndFaceChange(e) {
      const index = e.detail.value
      this.endFace = this.faceOptions[index].value
    },
    onEndColumnChange(e) {
      this.endColumn = this.columnOptions[e.detail.value]
    },
    onEndRowChange(e) {
      this.endRow = this.rowOptions[e.detail.value]
    },
    onEndDoorFaceChange(e) {
      const index = e.detail.value
      this.endDoorFace = this.doorFaceOptions[index].value
    },

    // 清空所有选择
    clearAll() {
      this.startType = 'door'
      this.startShelf = null
      this.startFace = null
      this.startColumn = null
      this.startRow = null
      this.startDoorFace = 'outside'

      this.endType = 'door'
      this.endShelf = null
      this.endFace = null
      this.endColumn = null
      this.endRow = null
      this.endDoorFace = 'outside'
    },

    // 开始导航
    startNavigation() {
      if (!this.canNavigate) {
        uni.showToast({ title: '请完整设置起点和终点', icon: 'none' })
        return
      }
      // 切换到导航模式
      this.mode = 'navigation'
    },

    // 返回配置模式
    backToConfig() {
      this.mode = 'config'
    },

    // 监听 web-view 返回的消息（可选）
    handleWebViewMessage(event) {
      console.log('收到 web-view 消息:', event.detail)
      const data = event.detail.data[0] // 根据实际格式调整
      if (data && data.type === 'initResult') {
        if (data.success) {
          uni.showToast({ title: '导航已加载', icon: 'success' })
        } else {
          uni.showToast({ title: data.error || '加载失败', icon: 'none' })
        }
      }
    }
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
}

/* 配置模式样式 */
.config-panel {
  padding: 30rpx;
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #666;
  margin-bottom: 20rpx;
  border-left: 8rpx solid #2196F3;
  padding-left: 20rpx;
}

.point-config {
  margin-top: 10rpx;
}

.type-radio {
  display: flex;
  flex-direction: row;
  margin-bottom: 20rpx;
}

.radio-item {
  margin-right: 40rpx;
  font-size: 28rpx;
}

.shelf-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 10rpx;
}

.picker {
  flex: 1 0 auto;
  min-width: 160rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  text-align: center;
}

.door-face-picker {
  width: 100%;
}

.picker-display {
  color: #333;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
}

.btn {
  flex: 1;
  margin: 0 20rpx;
  border-radius: 60rpx;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
}

.btn.clear {
  background-color: #fff;
  color: #666;
  border: 2rpx solid #ddd;
}

.btn.navigate {
  background-color: #2196F3;
  color: #fff;
}

.btn.navigate[disabled] {
  background-color: #ccc;
  color: #999;
}

/* 导航模式样式 */
.navigation-mode {
  position: relative;
  width: 100%;
  height: 100%;
}

.back-btn {
  position: fixed;
  top: 30rpx;
  left: 30rpx;
  z-index: 1000;
  background-color: rgba(0,0,0,0.5);
  color: #fff;
  padding: 16rpx 30rpx;
  border-radius: 60rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
}

.back-icon {
  font-size: 36rpx;
  margin-right: 8rpx;
}

web-view {
  width: 100%;
  height: 100%;
}
</style>