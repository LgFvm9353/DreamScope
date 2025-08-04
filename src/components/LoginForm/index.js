import React, { useState, useEffect } from 'react';
import { Form, Input, Button } from 'react-vant'; // 移除 Toast
import useUserStore from '@/store/useUserStore';
import styles from './LoginForm.module.css';

const LoginForm = ({ onLoginSuccess }) => {
  const { login, generateCaptcha, validateCaptcha } = useUserStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 添加错误状态
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    captcha: '',
    form: ''
  });

  // 生成验证码
  const handleGenerateCaptcha = () => {
    const code = generateCaptcha();
    setCaptchaCode(code);
  };

  // 初始化验证码 - 这里修改为 useEffect
  useEffect(() => {
    handleGenerateCaptcha();
  }, []);

  // 处理登录
  const handleLogin = async () => {
    // 重置错误信息
    setErrors({
      username: '',
      password: '',
      captcha: '',
      form: ''
    });
    
    // 表单验证
    let hasError = false;
    
    if (!username.trim()) {
      setErrors(prev => ({ ...prev, username: '请输入用户名' }));
      hasError = true;
    }
    
    if (!password.trim()) {
      setErrors(prev => ({ ...prev, password: '请输入密码' }));
      hasError = true;
    }
    
    if (!captcha.trim()) {
      setErrors(prev => ({ ...prev, captcha: '请输入验证码' }));
      hasError = true;
    }

    // 如果有错误，不继续执行
    if (hasError) return;

    // 验证码校验
    if (!validateCaptcha(captcha)) {
      setErrors(prev => ({ ...prev, captcha: '验证码错误或已过期' }));
      handleGenerateCaptcha(); // 刷新验证码
      setCaptcha(''); // 清空验证码输入
      return;
    }

    setLoading(true);

    try {
      // 调用登录API
      await login({ username, password });
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error('登录失败:', error);
      setErrors(prev => ({ 
        ...prev, 
        form: error.response?.data?.message || '登录失败，请检查用户名和密码'
      }));
      handleGenerateCaptcha(); // 刷新验证码
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginForm}>
      <h2 className={styles.title}>用户登录</h2>
      
      {/* 表单级错误信息 */}
      {errors.form && <div className={styles.formError}>{errors.form}</div>}
      
      <Form className={styles.form}>
        <Form.Item className={styles.formItem}>
          <Input
            placeholder="请输入用户名"
            value={username}
            onChange={setUsername}
          />
          {errors.username && <div className={styles.fieldError}>{errors.username}</div>}
        </Form.Item>
        
        <Form.Item className={styles.formItem}>
          <Input
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={setPassword}
          />
          {errors.password && <div className={styles.fieldError}>{errors.password}</div>}
        </Form.Item>
        
        <Form.Item className={styles.formItem}>
          <div className={styles.captchaContainer}>
            <Input
              placeholder="请输入验证码"
              value={captcha}
              onChange={setCaptcha}
              className={styles.captchaInput}
            />
            <div 
              className={styles.captchaCode} 
              onClick={handleGenerateCaptcha}
            >
              {captchaCode}
            </div>
          </div>
          {errors.captcha && <div className={styles.fieldError}>{errors.captcha}</div>}
        </Form.Item>
        
        <div className={styles.buttonContainer}>
          <Button 
            type="primary" 
            block 
            loading={loading} 
            onClick={handleLogin}
          >
            登录
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;