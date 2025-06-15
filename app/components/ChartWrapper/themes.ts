import { DeepPartial, Styles } from 'klinecharts'

// 专业暗色主题配置 - 优化版本
export const DARK_THEME: DeepPartial<Styles> = {
  grid: {
    horizontal: { 
      color: '#2a2e39',
      size: 1
    },
    vertical: { 
      color: '#2a2e39',
      size: 1
    }
  },
  candle: {
    bar: {
      upColor: '#00d4aa',        // 更鲜艳的绿色
      downColor: '#ff4976',      // 更鲜艳的红色
      noChangeColor: '#888888',
      upBorderColor: '#00d4aa',
      downBorderColor: '#ff4976',
      noChangeBorderColor: '#888888',
      upWickColor: '#00d4aa',
      downWickColor: '#ff4976',
      noChangeWickColor: '#888888'
    },
    tooltip: { 
      show: true,
      offsetLeft: 8,
      offsetTop: 8,
      offsetRight: 8,
      offsetBottom: 8,
      text: {
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        color: '#d1d4dc',
        marginLeft: 8,
        marginTop: 6,
        marginRight: 8,
        marginBottom: 6
      }
    } as any,
    priceMark: {
      show: true,
      high: { 
        show: true,
        color: '#00d4aa',
        textSize: 10,
        textFamily: 'Helvetica Neue',
        textWeight: 'normal'
      },
      low: { 
        show: true,
        color: '#ff4976',
        textSize: 10,
        textFamily: 'Helvetica Neue',
        textWeight: 'normal'
      },
      last: { 
        show: true,
        upColor: '#00d4aa',
        downColor: '#ff4976',
        noChangeColor: '#888888',
        text: {
          show: true,
          size: 12,
          paddingLeft: 2,
          paddingTop: 2,
          paddingRight: 2,
          paddingBottom: 2,
          color: '#ffffff',
          family: 'Helvetica Neue',
          weight: 'normal'
        }
      }
    }
  },
  xAxis: {
    show: true,
    axisLine: { 
      show: true,
      color: '#4c525e',
      size: 1
    },
    tickLine: { 
      show: true,
      size: 1,
      length: 3,
      color: '#4c525e'
    },
    tickText: { 
      show: true, 
      size: 11,
      color: '#8b949e',
      family: 'Helvetica Neue',
      weight: 'normal',
      marginStart: 4,
      marginEnd: 4
    }
  },
  yAxis: {
    show: true,
    axisLine: { 
      show: true,
      color: '#4c525e',
      size: 1
    },
    tickLine: { 
      show: true,
      size: 1,
      length: 3,
      color: '#4c525e'
    },
    tickText: { 
      show: true, 
      size: 11,
      color: '#8b949e',
      family: 'Helvetica Neue',
      weight: 'normal',
      marginStart: 4,
      marginEnd: 4
    }
  },
  separator: {
    size: 1,
    color: '#4c525e',
    fill: true,
    activeBackgroundColor: 'rgba(230, 230, 230, .15)'
  },
  crosshair: {
    show: true,
    horizontal: {
      show: true,
      line: {
        show: true,
        size: 1,
        color: '#758696'
      },
      text: {
        show: true,
        color: '#ffffff',
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        paddingLeft: 2,
        paddingRight: 2,
        paddingTop: 2,
        paddingBottom: 2,
        borderSize: 1,
        borderColor: '#686d76',
        borderRadius: 2,
        backgroundColor: '#686d76'
      }
    },
    vertical: {
      show: true,
      line: {
        show: true,
        size: 1,
        color: '#758696'
      },
      text: {
        show: true,
        color: '#ffffff',
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        paddingLeft: 2,
        paddingRight: 2,
        paddingTop: 2,
        paddingBottom: 2,
        borderSize: 1,
        borderColor: '#686d76',
        borderRadius: 2,
        backgroundColor: '#686d76'
      }
    }
  },
  indicator: {
    ohlc: {
      upColor: '#00d4aa',
      downColor: '#ff4976',
      noChangeColor: '#888888'
    },
    bars: [
      { upColor: '#00d4aa', downColor: '#ff4976', noChangeColor: '#888888' },
      { upColor: '#00d4aa', downColor: '#ff4976', noChangeColor: '#888888' }
    ],
    lines: [
      { color: '#ff9500', size: 1 },
      { color: '#9d65c9', size: 1 },
      { color: '#2196f3', size: 1 },
      { color: '#e91e63', size: 1 },
      { color: '#ff5722', size: 1 }
    ],
    circles: [
      { upColor: '#00d4aa', downColor: '#ff4976', noChangeColor: '#888888' },
      { upColor: '#00d4aa', downColor: '#ff4976', noChangeColor: '#888888' }
    ],
    lastValueMark: {
      show: false,
      text: {
        show: false,
        color: '#ffffff',
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        paddingLeft: 3,
        paddingTop: 2,
        paddingRight: 3,
        paddingBottom: 2,
        borderRadius: 2
      }
    },
    tooltip: {
      show: true,
      showName: true,
      showParams: true,
      defaultValue: 'n/a',
      text: {
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        color: '#d1d4dc',
        marginTop: 6,
        marginRight: 8,
        marginBottom: 6,
        marginLeft: 8
      }
    } as any
  }
}

// 专业亮色主题配置
export const LIGHT_THEME: DeepPartial<Styles> = {
  grid: {
    horizontal: { 
      color: '#e1e3e6',
      size: 1
    },
    vertical: { 
      color: '#e1e3e6',
      size: 1
    }
  },
  candle: {
    bar: {
      upColor: '#22ab94',        // 专业绿色
      downColor: '#f23645',      // 专业红色
      noChangeColor: '#888888',
      upBorderColor: '#22ab94',
      downBorderColor: '#f23645',
      noChangeBorderColor: '#888888',
      upWickColor: '#22ab94',
      downWickColor: '#f23645',
      noChangeWickColor: '#888888'
    },
    tooltip: { 
      show: true,
      offsetLeft: 8,
      offsetTop: 8,
      offsetRight: 8,
      offsetBottom: 8,
      text: {
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        color: '#131722',
        marginLeft: 8,
        marginTop: 6,
        marginRight: 8,
        marginBottom: 6
      }
    } as any,
    priceMark: {
      show: true,
      high: { 
        show: true,
        color: '#22ab94',
        textSize: 10,
        textFamily: 'Helvetica Neue',
        textWeight: 'normal'
      },
      low: { 
        show: true,
        color: '#f23645',
        textSize: 10,
        textFamily: 'Helvetica Neue',
        textWeight: 'normal'
      },
      last: { 
        show: true,
        upColor: '#22ab94',
        downColor: '#f23645',
        noChangeColor: '#888888',
        text: {
          show: true,
          size: 12,
          paddingLeft: 2,
          paddingTop: 2,
          paddingRight: 2,
          paddingBottom: 2,
          color: '#ffffff',
          family: 'Helvetica Neue',
          weight: 'normal'
        }
      }
    }
  },
  xAxis: {
    show: true,
    axisLine: { 
      show: true,
      color: '#d1d4dc',
      size: 1
    },
    tickLine: { 
      show: true,
      size: 1,
      length: 3,
      color: '#d1d4dc'
    },
    tickText: { 
      show: true, 
      size: 11,
      color: '#6a7179',
      family: 'Helvetica Neue',
      weight: 'normal',
      marginStart: 4,
      marginEnd: 4
    }
  },
  yAxis: {
    show: true,
    axisLine: { 
      show: true,
      color: '#d1d4dc',
      size: 1
    },
    tickLine: { 
      show: true,
      size: 1,
      length: 3,
      color: '#d1d4dc'
    },
    tickText: { 
      show: true, 
      size: 11,
      color: '#6a7179',
      family: 'Helvetica Neue',
      weight: 'normal',
      marginStart: 4,
      marginEnd: 4
    }
  },
  separator: {
    size: 1,
    color: '#d1d4dc',
    fill: true,
    activeBackgroundColor: 'rgba(230, 230, 230, .15)'
  },
  crosshair: {
    show: true,
    horizontal: {
      show: true,
      line: {
        show: true,
        size: 1,
        color: '#9598a1'
      },
      text: {
        show: true,
        color: '#ffffff',
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        paddingLeft: 2,
        paddingRight: 2,
        paddingTop: 2,
        paddingBottom: 2,
        borderSize: 1,
        borderColor: '#686d76',
        borderRadius: 2,
        backgroundColor: '#686d76'
      }
    },
    vertical: {
      show: true,
      line: {
        show: true,
        size: 1,
        color: '#9598a1'
      },
      text: {
        show: true,
        color: '#ffffff',
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        paddingLeft: 2,
        paddingRight: 2,
        paddingTop: 2,
        paddingBottom: 2,
        borderSize: 1,
        borderColor: '#686d76',
        borderRadius: 2,
        backgroundColor: '#686d76'
      }
    }
  },
  indicator: {
    ohlc: {
      upColor: '#22ab94',
      downColor: '#f23645',
      noChangeColor: '#888888'
    },
    bars: [
      { upColor: '#22ab94', downColor: '#f23645', noChangeColor: '#888888' },
      { upColor: '#22ab94', downColor: '#f23645', noChangeColor: '#888888' }
    ],
    lines: [
      { color: '#ff9500', size: 1 },
      { color: '#9d65c9', size: 1 },
      { color: '#2196f3', size: 1 },
      { color: '#e91e63', size: 1 },
      { color: '#ff5722', size: 1 }
    ],
    circles: [
      { upColor: '#22ab94', downColor: '#f23645', noChangeColor: '#888888' },
      { upColor: '#22ab94', downColor: '#f23645', noChangeColor: '#888888' }
    ],
    lastValueMark: {
      show: false,
      text: {
        show: false,
        color: '#131722',
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        paddingLeft: 3,
        paddingTop: 2,
        paddingRight: 3,
        paddingBottom: 2,
        borderRadius: 2
      }
    },
    tooltip: {
      show: true,
      showName: true,
      showParams: true,
      defaultValue: 'n/a',
      text: {
        size: 12,
        family: 'Helvetica Neue',
        weight: 'normal',
        color: '#131722',
        marginTop: 6,
        marginRight: 8,
        marginBottom: 6,
        marginLeft: 8
      }
    } as any
  }
} 