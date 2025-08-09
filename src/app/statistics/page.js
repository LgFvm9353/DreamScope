'use client'
import { useState, useEffect } from 'react'
import { Cell, Loading, Empty, Tabs, Button } from 'react-vant'
import { useRouter } from 'next/navigation'
import { statsAPI } from '@/services/api'
import styles from './page.module.css'
import {
  ChartTrendingO,
  Star,
  ClockO,
  Smile,
  Bookmark,
  Description
} from '@react-vant/icons'

// 引入echarts图表库
import ReactECharts from 'echarts-for-react'
import useTitle from '@/hooks/useTitle'

// 情绪颜色映射
const emotionColors = {
  'happy': '#4CAF50',
  'sad': '#2196F3',
  'angry': '#F44336',
  'fear': '#9C27B0',
  'surprise': '#FF9800',
  'disgust': '#795548',
  'calm': '#00BCD4',
  'confused': '#607D8B',
  'excited': '#E91E63',
  'anxious': '#FF5722',
  'neutral': '#9E9E9E'
}

// 情绪文本映射
const emotionText = {
  'happy': '开心',
  'sad': '悲伤',
  'angry': '愤怒',
  'fear': '恐惧',
  'surprise': '惊讶',
  'disgust': '厌恶',
  'calm': '平静',
  'confused': '困惑',
  'excited': '兴奋',
  'anxious': '焦虑',
  'neutral': '中性'
}

// 梦境类型颜色映射
const typeColors = {
  'normal': '#2196F3',
  'lucid': '#4CAF50',
  'nightmare': '#F44336',
  'recurring': '#FF9800',
  'prophetic': '#9C27B0',
  'daydream': '#00BCD4',
  'false_awakening': '#607D8B'
}

// 梦境类型文本映射
const typeText = {
  'normal': '普通梦',
  'lucid': '清醒梦',
  'nightmare': '噩梦',
  'recurring': '重复梦',
  'prophetic': '预知梦',
  'daydream': '白日梦',
  'false_awakening': '假醒梦'
}

// 分析状态颜色映射
const analysisStatusColors = {
  'pending': '#FF9800',
  'completed': '#4CAF50',
  'failed': '#F44336',
  'skipped': '#9E9E9E'
}

// 分析状态文本映射
const analysisStatusText = {
  'pending': '待分析',
  'completed': '已分析',
  'failed': '分析失败',
  'skipped': '已跳过'
}

// 统计卡片组件
const StatCard = ({ icon, title, value, suffix, onClick }) => (
  <div className={styles.statCard} onClick={onClick}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statInfo}>
      <div className={styles.statTitle}>{title}</div>
      <div className={styles.statValue}>
        {value}{suffix && <span className={styles.statSuffix}>{suffix}</span>}
      </div>
    </div>
  </div>
);

export default function StatisticsPage() {
  useTitle('图表统计页')
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // 获取统计数据
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('开始获取统计数据...');
      const response = await statsAPI.getStats();
      console.log('统计数据响应:', response);
      
      if (response && response.success) {
        setStats(response.data);
        console.log('统计数据设置成功:', response.data);
      } else {
        throw new Error(response?.message || '获取统计数据失败');
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      setError('获取统计数据失败，请重试');
      
      // 如果是未登录错误，不使用模拟数据
      if (error.response?.status === 401) {
        setStats(null);
      } else {
        // 其他错误情况下使用空数据结构，避免显示错误的模拟数据
        setStats({
          counts: {
            total: 0,
            weekly: 0,
            monthly: 0,
            yearly: 0,
            favorite: 0
          },
          distributions: {
            emotions: [],
            types: [],
            analysisStatus: []
          },
          trends: {
            monthly: []
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载时获取统计数据
  useEffect(() => {
    fetchStats();
  }, []);
  
  // 处理刷新
  const handleRefresh = () => {
    fetchStats();
  };
  
  // 处理标签页切换
  const handleTabChange = (name, tabIndex) => {
    setActiveTab(tabIndex);
  };
  
  // 格式化情绪分布数据
  const formatEmotionData = () => {
    if (!stats || !stats.distributions || !stats.distributions.emotions) return [];
    
    return stats.distributions.emotions.map(item => ({
      name: emotionText[item.emotion] || item.emotion,
      value: parseInt(item.count),
      itemStyle: {
        color: emotionColors[item.emotion] || '#9E9E9E'
      }
    }));
  };
  
  // 格式化梦境类型分布数据
  const formatTypeData = () => {
    if (!stats || !stats.distributions || !stats.distributions.types) return [];
    
    return stats.distributions.types.map(item => ({
      name: typeText[item.type] || item.type,
      value: parseInt(item.count),
      itemStyle: {
        color: typeColors[item.type] || '#9E9E9E'
      }
    }));
  };
  
  // 格式化分析状态分布数据
  const formatAnalysisStatusData = () => {
    if (!stats || !stats.distributions || !stats.distributions.analysisStatus) return [];
    
    return stats.distributions.analysisStatus.map(item => ({
      name: analysisStatusText[item.analysisStatus] || item.analysisStatus,
      value: parseInt(item.count),
      itemStyle: {
        color: analysisStatusColors[item.analysisStatus] || '#9E9E9E'
      }
    }));
  };
  
  // 格式化月度趋势数据
  const formatMonthlyTrendData = () => {
    if (!stats || !stats.trends || !stats.trends.monthly) return { xAxis: [], series: [] };
    
    const months = stats.trends.monthly.map(item => item.month);
    const counts = stats.trends.monthly.map(item => item.count);
    
    return {
      xAxis: months,
      series: counts
    };
  };
  
  // 获取情绪分布图表配置
  const getEmotionChartOption = () => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} 条 ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 5,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          fontSize: 10
        }
      },
      series: [
        {
          name: '情绪分布',
          type: 'pie',
          radius: '50%',
          center: ['50%', '45%'],
          data: formatEmotionData(),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            formatter: '{b}: {d}%',
            fontSize: 10,
            position: 'outside'
          },
          labelLine: {
            show: true,
            length: 10,
            length2: 5
          }
        }
      ]
    };
  };
  
  // 获取梦境类型图表配置
  const getTypeChartOption = () => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} 条 ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 5,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          fontSize: 10
        }
      },
      series: [
        {
          name: '梦境类型',
          type: 'pie',
          radius: '50%',
          center: ['50%', '45%'],
          data: formatTypeData(),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            formatter: '{b}: {d}%',
            fontSize: 10,
            position: 'outside'
          },
          labelLine: {
            show: true,
            length: 10,
            length2: 5
          }
        }
      ]
    };
  };
  
  // 获取月度趋势图表配置
  const getTrendChartOption = () => {
    const { xAxis, series } = formatMonthlyTrendData();
    
    return {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c} 条'
      },
      xAxis: {
        type: 'category',
        data: xAxis,
        axisLabel: {
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 10
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      series: [
        {
          name: '梦境数量',
          type: 'line',
          data: series,
          smooth: true,
          itemStyle: {
            color: '#4CAF50'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(76, 175, 80, 0.3)'
              }, {
                offset: 1, color: 'rgba(76, 175, 80, 0.1)'
              }]
            }
          }
        }
      ]
    };
  };
  
  // 获取分析状态图表配置
  const getAnalysisStatusChartOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}: {c} 条'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: formatAnalysisStatusData().map(item => item.name)
      },
      series: [
        {
          name: '梦境数量',
          type: 'bar',
          data: formatAnalysisStatusData()
        }
      ]
    };
  };
  
  if (loading) {
    return (
      <div className="flex-center min-h-screen">
        <Loading type="spinner" size="24px">加载中...</Loading>
      </div>
    );
  }
  
  if (error && !stats) {
    return (
      <div className="flex-center min-h-screen flex-col">
        <Empty description={error} />
        <Button 
          className="mt-4" 
          type="primary" 
          size="small" 
          onClick={handleRefresh}
        >
          重试
        </Button>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>梦境统计</h1>
        <Button 
          className={styles.refreshButton} 
          icon={<ClockO />} 
          size="small"
          onClick={handleRefresh}
        >
          刷新
        </Button>
      </div>
      
      {/* 统计卡片 */}
      <div className={styles.statsGrid}>
        <StatCard 
          icon={<Description />} 
          title="总梦境" 
          value={stats?.counts?.total || 0} 
          suffix="条"
        />
        <StatCard 
          icon={<ClockO />} 
          title="本周" 
          value={stats?.counts?.weekly || 0} 
          suffix="条"
        />
        <StatCard 
          icon={<ChartTrendingO />} 
          title="本月" 
          value={stats?.counts?.monthly || 0} 
          suffix="条"
        />
      </div>
      
      {/* 图表标签页 */}
      <Tabs 
        className={styles.tabs} 
        active={activeTab} 
        onChange={handleTabChange}
        sticky
        offsetTop="0"
      >
        <Tabs.TabPane title="情绪分布">
          <div className={styles.chartContainer}>
            {formatEmotionData().length > 0 ? (
              <ReactECharts 
                option={getEmotionChartOption()} 
                style={{ height: '300px', width: '100%' }} 
                opts={{ renderer: 'svg' }}
              />
            ) : (
              <Empty description="暂无情绪数据" />
            )}
          </div>
        </Tabs.TabPane>
        
        <Tabs.TabPane title="梦境类型">
          <div className={styles.chartContainer}>
            {formatTypeData().length > 0 ? (
              <ReactECharts 
                option={getTypeChartOption()} 
                style={{ height: '300px', width: '100%' }} 
                opts={{ renderer: 'svg' }}
              />
            ) : (
              <Empty description="暂无类型数据" />
            )}
          </div>
        </Tabs.TabPane>
        
        <Tabs.TabPane title="时间趋势">
          <div className={styles.chartContainer}>
            {formatMonthlyTrendData().xAxis.length > 0 ? (
              <ReactECharts 
                option={getTrendChartOption()} 
                style={{ height: '300px', width: '100%' }} 
                opts={{ renderer: 'svg' }}
              />
            ) : (
              <Empty description="暂无趋势数据" />
            )}
          </div>
        </Tabs.TabPane>
        
        <Tabs.TabPane title="分析状态">
          <div className={styles.chartContainer}>
            {formatAnalysisStatusData().length > 0 ? (
              <ReactECharts 
                option={getAnalysisStatusChartOption()} 
                style={{ height: '300px', width: '100%' }} 
                opts={{ renderer: 'svg' }}
              />
            ) : (
              <Empty description="暂无分析状态数据" />
            )}
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}