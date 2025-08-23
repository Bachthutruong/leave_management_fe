# Hệ thống Quản lý Nghỉ phép

Hệ thống quản lý lịch nghỉ của nhân viên với giao diện đẹp mắt, responsive và nhiều tính năng hữu ích.

## 🚀 Tính năng chính

### 👤 Dành cho Nhân viên
- **Xác thực đơn giản**: Chỉ cần nhập mã nhân viên để đăng nhập
- **Đăng ký nghỉ phép linh hoạt**:
  - Nghỉ cả ngày
  - Nghỉ nửa ngày (sáng, chiều, tối)
  - Nghỉ theo giờ cụ thể
  - Tải lên tài liệu đính kèm (hình ảnh, PDF)
  - Nhập lý do nghỉ (tùy chọn)
- **Xem lịch nghỉ toàn công ty**: Dạng lịch tháng với thông tin chi tiết
- **Theo dõi trạng thái đơn**: Chờ duyệt, đã duyệt, từ chối

### 🔧 Dành cho Quản trị viên
- **Quản lý nhân viên**:
  - Thêm/sửa/xóa thông tin nhân viên
  - Cập nhật trạng thái làm việc
  - Tìm kiếm và lọc theo phòng ban
- **Quản lý đơn xin nghỉ**:
  - Duyệt/từ chối đơn xin nghỉ
  - Thêm/sửa/xóa lịch nghỉ cho nhân viên
  - Tạo lịch nghỉ trực tiếp
- **Thống kê chi tiết**:
  - Theo tháng, quý, năm
  - Tổng quan số ngày nghỉ của từng nhân viên
  - Phân loại theo loại nghỉ
- **Cài đặt hệ thống**:
  - Tùy chỉnh nhãn cho các loại nghỉ nửa ngày
  - Thông tin hệ thống

## 🎨 Giao diện

- **Thiết kế hiện đại**: Sử dụng gradient colors, shadows và animations
- **Responsive**: Tối ưu cho cả desktop và mobile
- **Màu sắc phong phú**: Sử dụng nhiều màu sắc để phân biệt các chức năng
- **UX/UI tốt**: Navigation rõ ràng, feedback trực quan

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

## 📱 Responsive Design

- **Mobile First**: Tối ưu cho màn hình nhỏ
- **Grid System**: Sử dụng CSS Grid và Flexbox linh hoạt
- **Touch Friendly**: Buttons và inputs phù hợp với touch devices
- **Adaptive Layout**: Tự động điều chỉnh layout theo kích thước màn hình

## 🚀 Cách sử dụng

### Cài đặt
```bash
npm install
```

### Chạy development server
```bash
npm run dev
```

### Build production
```bash
npm run build
```

## 📋 Cấu trúc dự án

```
src/
├── components/          # UI Components
│   ├── ui/             # Shadcn/ui components
│   ├── LoginForm.tsx   # Form đăng nhập
│   ├── LeaveRequestForm.tsx # Form đăng ký nghỉ
│   ├── LeaveCalendar.tsx    # Lịch nghỉ phép
│   ├── EmployeeForm.tsx     # Form quản lý nhân viên
│   └── AdminLeaveForm.tsx   # Form quản lý lịch nghỉ
├── pages/              # Các trang chính
│   ├── AdminDashboard.tsx   # Dashboard quản trị viên
│   └── EmployeeDashboard.tsx # Dashboard nhân viên
├── services/           # API services
├── store/              # State management
└── types/              # TypeScript types
```

## 🎯 Tính năng nổi bật

### 1. Giao diện đẹp mắt
- Gradient backgrounds
- Smooth animations
- Modern card designs
- Color-coded status indicators

### 2. Responsive hoàn hảo
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interactions
- Optimized for all screen sizes

### 3. User Experience tốt
- Intuitive navigation
- Clear visual feedback
- Loading states
- Error handling
- Success notifications

### 4. Tính năng đầy đủ
- CRUD operations cho nhân viên
- Quản lý đơn xin nghỉ
- Thống kê chi tiết
- Cài đặt hệ thống
- Upload files
- Search và filter

## 🔒 Bảo mật

- JWT authentication
- Role-based access control
- Secure API endpoints
- Input validation
- XSS protection

## 📊 Performance

- Lazy loading components
- Optimized re-renders
- Efficient state management
- Minimal bundle size
- Fast loading times

## 🌟 Tương lai

- Dark mode
- Multi-language support
- Advanced analytics
- Mobile app
- Email notifications
- Calendar integration

## 📞 Hỗ trợ

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng liên hệ team development.

---

**Hệ thống Quản lý Nghỉ phép** - Giải pháp hoàn chỉnh cho doanh nghiệp! 🎉
