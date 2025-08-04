import React, { useState, useEffect } from 'react';
import { Form, Input, Button } from 'react-vant'; 
import useUserStore from '@/store/useUserStore';
import styles from './RegisterForm.module.css';

const RegisterForm = ({ onRegisterSuccess }) => {
  const { register, generateCaptcha, validateCaptcha } = useUserStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 添加错误状态
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    captcha: '',
    form: ''
  });

  // 生成验证码
  const handleGenerateCaptcha = () => {
    const code = generateCaptcha();
    setCaptchaCode(code);
    console.log(code);
  };

  // 初始化验证码
  useEffect(() => {
    handleGenerateCaptcha();
  }, []);

  // 验证邮箱格式
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 处理注册
  const handleRegister = async () => {
    // 重置错误信息
    setErrors({
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
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
    
    if (password.length < 6) {
      setErrors(prev => ({ ...prev, password: '密码长度不能少于6位' }));
      hasError = true;
    }
    
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '两次输入的密码不一致' }));
      hasError = true;
    }
    
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: '请输入邮箱' }));
      hasError = true;
    }
    
    if (!isValidEmail(email)) {
      setErrors(prev => ({ ...prev, email: '请输入有效的邮箱地址' }));
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
      // 调用注册API
      await register({ username, password, email });
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (error) {
      console.error('注册失败:', error);
      setErrors(prev => ({ 
        ...prev, 
        form: error.response?.data?.message || '注册失败，请稍后重试'
      }));
      handleGenerateCaptcha(); // 刷新验证码
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerForm}>
      <h2 className={styles.title}>用户注册</h2>
      
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
          <Input
            type="password"
            placeholder="请确认密码"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
          {errors.confirmPassword && <div className={styles.fieldError}>{errors.confirmPassword}</div>}
        </Form.Item>
        
        <Form.Item className={styles.formItem}>
          <Input
            placeholder="请输入邮箱"
            value={email}
            onChange={setEmail}
          />
          {errors.email && <div className={styles.fieldError}>{errors.email}</div>}
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
            onClick={handleRegister}
          >
            注册
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default RegisterForm;