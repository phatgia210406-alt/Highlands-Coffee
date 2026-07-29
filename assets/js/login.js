// Xử lý Luồng Đăng nhập (Login) với localStorage
document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Lấy danh sách users từ localStorage (mảng danh sách người dùng)
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Kiểm tra email và mật khẩu có khớp với dữ liệu trong localStorage hay không
    const foundUser = users.find(u => u.email === email && u.password === password);

    // Tài khoản mặc định sẵn sàng nếu user chưa từng đăng ký
    const defaultAdmin = (email === 'nhatminh2910206@gmail.com' && password === '12345678') || (email === 'admin@highlands.com' && password === '12345678');

    if (foundUser || defaultAdmin) {
      const userData = foundUser || {
        firstName: 'Nhật',
        lastName: 'Trương',
        name: 'Nhật Trương',
        email: email,
        phone: '0901234567'
      };

      // Lưu thông tin người dùng hiện tại vào localStorage để đánh dấu là Đã đăng nhập
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('highlands_user', JSON.stringify(userData));

      alert('Đăng nhập thành công!');
      
      // Tự động đóng modal/form hoặc chuyển hướng về trang chủ hoặc trang cá nhân
      window.location.href = '/pages/profile.html';
    } else {
      alert('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
    }
  });
});
