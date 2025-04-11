// camera-permission-helper.js

const CameraPermissionHelper = {
    async checkPermission() {
      const ua = navigator.userAgent;
      const isIOS = /iPhone|iPad|iPod/i.test(ua);
      const isAndroid = /Android/i.test(ua);
      const browser = /CriOS/i.test(ua) ? 'Chrome iOS'
                   : /Safari/i.test(ua) && !/CriOS/i.test(ua) ? 'Safari'
                   : /Chrome/i.test(ua) ? 'Chrome Android'
                   : 'Unknown';
  
      let browserPermission = 'unsupported';
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'camera' });
          browserPermission = result.state; // 'granted', 'denied', 'prompt'
        }
      } catch (e) {
        browserPermission = 'unsupported';
      }
  
      let actualAccess = 'unknown';
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
        actualAccess = 'granted';
      } catch (err) {
        if (err.name === 'NotAllowedError') actualAccess = 'denied';
        else if (err.name === 'NotFoundError') actualAccess = 'no_device';
        else actualAccess = 'error';
      }
  
      const likelySystemBlocked = browserPermission === 'granted' && actualAccess === 'denied';
  
      return {
        os: isIOS ? 'iOS' : isAndroid ? 'Android' : 'Other',
        browser,
        browserPermission,
        actualAccess,
        likelySystemBlocked
      };
    },
  
    showPermissionTips(env) {
      const { os, browser, likelySystemBlocked, actualAccess } = env;
  
      if (actualAccess === 'granted') {
        return; // 不需要提示
      }
  
      if (likelySystemBlocked) {
        if (os === 'iOS') {
          if (browser === 'Safari') {
            alert('请前往 设置 > Safari > 网站权限 > 相机 开启权限');
          } else {
            alert('请前往 设置 > Chrome > 相机，开启权限后刷新页面');
          }
        } else if (os === 'Android') {
          alert('请前往 系统设置 > 应用 > 权限管理 中为浏览器开启摄像头权限');
        } else {
          alert('系统已限制摄像头使用，请手动开启权限');
        }
      } else if (actualAccess === 'denied') {
        alert('您已拒绝摄像头权限，请在浏览器弹窗中重新授权');
      } else if (actualAccess === 'no_device') {
        alert('未检测到可用摄像头设备');
      } else {
        alert('摄像头调用失败，请检查浏览器或系统权限设置');
      }
    }
  };
  
  export default CameraPermissionHelper;
  