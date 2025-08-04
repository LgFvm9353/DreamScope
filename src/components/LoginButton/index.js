import React from 'react';
import { Button, Image } from 'react-vant';
import styles from './LoginButton.module.css';

const LoginButton = ({ onClick }) => {
  return (
    <div className={styles.loginButtonContainer} onClick={onClick}>
      <div className={styles.loginButton}>
        <div className={styles.avatarContainer}>
          <Image
            width="50px"
            height="50px"
            fit="cover"
            round
            src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
          />
        </div>
        <div className={styles.loginText}>
          <div className={styles.loginTitle}>点击登录</div>
          <div className={styles.loginDesc}>1秒登录，体验更多功能</div>
        </div>
      </div>
    </div>
  );
};

export default LoginButton;