// Xử lý Luồng Đăng ký (Register) với localStorage
document.addEventListener('DOMContentLoaded', function () {
  const registerForm = document.querySelector('form');
  if (!registerForm) return;

  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const inputs = registerForm.querySelectorAll('input');
    // Các trường: [0]: Họ, [1]: Tên, [2]: Số điện thoại, [3]: Email, [4]: Mật khẩu
    if (inputs.length < 5) return;

    const firstName = inputs[0].value.trim();
    const lastName = inputs[1].value.trim();
    const phone = inputs[2].value.trim();
    const email = inputs[3].value.trim();
    const password = inputs[4].value.trim();

    if (password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    // Lấy danh sách users hiện tại từ localStorage
    let users = JSON.parse(localStorage.getItem('users') || '[]');

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      alert('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.');
      return;
    }

    // Tạo đối tượng người dùng mới
    const newUser = {
      id: 'user-' + Date.now(),
      firstName: firstName,
      lastName: lastName,
      name: `${firstName} ${lastName}`.trim(),
      phone: phone,
      email: email,
      password: password
    };

    // Lưu thông tin tài khoản dưới dạng một mảng danh sách người dùng (users) vào localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Tự động lưu currentUser hoặc chuyển hướng sang trang đăng nhập
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('highlands_user', JSON.stringify(newUser));

    alert('Đăng ký tài khoản thành công!');
    window.location.href = '/pages/profile.html';
  });
});
