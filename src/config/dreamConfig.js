// 情绪选项
export const EMOTION_OPTIONS = [
  { value: 'happy', label: '开心', icon: '😊', color: '#52c41a' },
  { value: 'sad', label: '悲伤', icon: '😢', color: '#1890ff' },
  { value: 'angry', label: '愤怒', icon: '😠', color: '#ff4d4f' },
  { value: 'fear', label: '恐惧', icon: '😨', color: '#722ed1' },
  { value: 'surprise', label: '惊讶', icon: '😲', color: '#fa8c16' },
  { value: 'calm', label: '平静', icon: '😌', color: '#13c2c2' },
  { value: 'excited', label: '兴奋', icon: '🤩', color: '#eb2f96' },
  { value: 'anxious', label: '焦虑', icon: '😰', color: '#faad14' },
  { value: 'confused', label: '困惑', icon: '😕', color: '#8c8c8c' },
  { value: 'neutral', label: '中性', icon: '😐', color: '#d9d9d9' },
];

// 梦境类型选项
export const DREAM_TYPE_OPTIONS = [
  { value: 'normal', label: '普通梦', icon: '🌙' },
  { value: 'lucid', label: '清醒梦', icon: '✨' },
  { value: 'nightmare', label: '噩梦', icon: '😱' },
  { value: 'recurring', label: '重复梦', icon: '🔄' },
  { value: 'prophetic', label: '预知梦', icon: '🔮' },
  { value: 'daydream', label: '白日梦', icon: '☁️' },
  { value: 'flying', label: '飞行梦', icon: '🦅' },
  { value: 'falling', label: '坠落梦', icon: '⬇️' },
  { value: 'chase', label: '追逐梦', icon: '🏃' },
  { value: 'other', label: '其他', icon: '❓' },
];

// 常用标签
export const COMMON_TAGS = [
  '飞行', '坠落', '追逐', '逃跑', '考试', '工作', '家庭',
  '朋友', '爱情', '死亡', '重生', '水', '火', '森林',
  '城市', '房子', '学校', '医院', '旅行', '动物', '怪物',
  '超能力', '时间', '空间', '颜色', '声音', '味道', '触感'
];

// 保存选项
export const SAVE_OPTIONS = [
  {
    id: 'save_only',
    label: '仅保存记录',
    description: '只保存梦境内容，不进行AI分析',
    icon: '💾',
    color: '#52c41a'
  },
  {
    id: 'save_and_analyze',
    label: '保存并立即分析',
    description: '保存后立即进行AI分析',
    icon: '🤖',
    color: '#1890ff'
  },
  {
    id: 'save_later',
    label: '保存后稍后分析',
    description: '保存后稍后进行AI分析',
    icon: '⏰',
    color: '#fa8c16'
  }
];

// 表单验证规则
export const VALIDATION_RULES = {
  content: {
    required: true,
    minLength: 10,
    maxLength: 2000,
    message: {
      required: '梦境内容不能为空',
      minLength: '梦境内容至少需要10个字符',
      maxLength: '梦境内容不能超过2000个字符'
    }
  },
  emotion: {
    required: true,
    message: '请选择情绪'
  },
  type: {
    required: true,
    message: '请选择梦境类型'
  }
};

// 自动保存配置
export const AUTO_SAVE_CONFIG = {
  delay: 2000, // 2秒后自动保存
  enabled: true,
  maxDraftAge: 7 * 24 * 60 * 60 * 1000, // 7天
};

// 文本提示
export const TEXT_HINTS = {
  contentPlaceholder: '请详细描述您的梦境内容...',
  emotionHint: '选择梦境中主要的情绪感受',
  typeHint: '选择最符合的梦境类型',
  tagsHint: '添加相关标签，帮助更好地理解梦境',
  saveHint: '选择保存方式，决定是否进行AI分析'
}; 