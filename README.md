# Transport Information Management System
## Hệ thống Quản lý Thông tin Vận hành - Excell-On Services

### Mô tả dự án

Hệ thống web quản lý thông tin vận hành và khách hàng cho công ty Excell-On Consulting Services (ECS), cung cấp các dịch vụ tư vấn và hỗ trợ kỹ thuật.

### Công nghệ sử dụng

- **Backend**: ASP.NET Core 8.0 Web API
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: MySQL
- **ORM**: Entity Framework Core
- **Authentication**: JWT Bearer Token

### Yêu cầu hệ thống

- .NET 8.0 SDK
- MySQL Server 8.0+
- Node.js (tùy chọn, chỉ cần để chạy frontend)

### Cài đặt và chạy dự án

#### 1. Cấu hình Database

Cập nhật connection string trong `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TransportInfoDB;User=root;Password=your_password;Port=3306;"
  }
}
```

#### 2. Chạy ứng dụng

```bash
cd src/TransportInfoManagement.API
dotnet restore
dotnet run
```

Ứng dụng sẽ chạy tại: `http://localhost:5000` hoặc `https://localhost:5001`

#### 3. Truy cập ứng dụng

Mở trình duyệt và truy cập: `http://localhost:5000`

**Thông tin đăng nhập mặc định:**
- Username: `admin`
- Password: `admin123`

### Cấu trúc dự án

```
TransportInfoManagement/
├── src/
│   └── TransportInfoManagement.API/
│       ├── Controllers/         # API Controllers
│       ├── Data/                # DbContext và Database
│       ├── Models/              # Data Models
│       ├── Services/            # Business Logic Services
│       └── wwwroot/             # Frontend files
│           ├── css/
│           ├── js/
│           └── index.html
├── TransportInfoManagement.sln
└── README.md
```

### Các module chính

1. **Login & Dashboard** - Đăng nhập và trang tổng quan
2. **Service Management** - Quản lý dịch vụ và phí dịch vụ
3. **Department Management** - Quản lý phòng ban
4. **Employee Management** - Quản lý nhân viên
5. **Client Management** - Quản lý khách hàng (có tìm kiếm nâng cao)
6. **Client Service Mapping** - Quản lý dịch vụ khách hàng và tính chi phí
7. **Product Management** - Quản lý sản phẩm của khách hàng
8. **Payment & Billing** - Quản lý thanh toán
9. **Reports Module** - Các báo cáo thống kê

### Tính năng chính

#### Non-Financial (Phi tài chính)
- ✅ Quản lý danh mục dịch vụ (In-bound, Out-bound, Telemarketing)
- ✅ Quản lý các phòng ban (HR, Admin, Service, Training, Internet Security, Auditors)
- ✅ Quản lý nhân viên theo chức vụ và loại dịch vụ
- ✅ Quản lý phí dịch vụ cho từng loại
- ✅ Quản lý thông tin khách hàng
- ✅ Quản lý dịch vụ mà khách hàng đăng ký
- ✅ Quản lý sản phẩm/dịch vụ mà khách hàng cung cấp
- ✅ Tính tổng chi phí dựa trên dịch vụ mà khách hàng chọn
- ✅ Quản lý thông tin thanh toán của khách hàng
- ✅ Tìm kiếm nâng cao cho khách hàng

#### Financial (Tài chính)
- ✅ Chi phí dịch vụ theo ngày, mỗi nhân viên:
  - In-bound: $4,500/ngày/nhân viên
  - Out-bound: $6,000/ngày/nhân viên
  - Tele Marketing: $5,500/ngày/nhân viên

#### Reports (Báo cáo)
- ✅ Danh sách khách hàng theo dịch vụ
- ✅ Danh sách nhân viên theo dịch vụ
- ✅ Báo cáo thanh toán theo khoảng thời gian
- ✅ Báo cáo thanh toán quá hạn
- ✅ Dashboard với tổng quan hệ thống

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Đăng nhập

#### Services
- `GET /api/services` - Lấy danh sách dịch vụ
- `GET /api/services/{id}` - Lấy thông tin dịch vụ
- `POST /api/services` - Tạo dịch vụ mới
- `PUT /api/services/{id}` - Cập nhật dịch vụ
- `DELETE /api/services/{id}` - Xóa dịch vụ
- `GET /api/services/fees` - Lấy danh sách phí dịch vụ
- `PUT /api/services/fees/{id}` - Cập nhật phí dịch vụ

#### Departments
- `GET /api/departments` - Lấy danh sách phòng ban
- `GET /api/departments/{id}` - Lấy thông tin phòng ban
- `POST /api/departments` - Tạo phòng ban mới
- `PUT /api/departments/{id}` - Cập nhật phòng ban
- `DELETE /api/departments/{id}` - Xóa phòng ban

#### Employees
- `GET /api/employees` - Lấy danh sách nhân viên (có filter theo serviceId, departmentId)
- `GET /api/employees/{id}` - Lấy thông tin nhân viên
- `POST /api/employees` - Tạo nhân viên mới
- `PUT /api/employees/{id}` - Cập nhật nhân viên
- `DELETE /api/employees/{id}` - Xóa nhân viên

#### Clients
- `GET /api/clients` - Lấy danh sách khách hàng (có search)
- `GET /api/clients/advanced-search` - Tìm kiếm nâng cao
- `GET /api/clients/{id}` - Lấy thông tin khách hàng
- `POST /api/clients` - Tạo khách hàng mới
- `PUT /api/clients/{id}` - Cập nhật khách hàng
- `DELETE /api/clients/{id}` - Xóa khách hàng

#### Client Services
- `GET /api/client-services` - Lấy danh sách dịch vụ khách hàng (có filter theo clientId)
- `GET /api/client-services/{id}` - Lấy thông tin dịch vụ khách hàng
- `POST /api/client-services` - Tạo dịch vụ khách hàng mới
- `PUT /api/client-services/{id}` - Cập nhật dịch vụ khách hàng
- `DELETE /api/client-services/{id}` - Xóa dịch vụ khách hàng
- `GET /api/client-services/calculate-cost/{clientId}` - Tính tổng chi phí

#### Products
- `GET /api/products` - Lấy danh sách sản phẩm (có filter theo clientId)
- `GET /api/products/{id}` - Lấy thông tin sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/{id}` - Cập nhật sản phẩm
- `DELETE /api/products/{id}` - Xóa sản phẩm

#### Payments
- `GET /api/payments` - Lấy danh sách thanh toán (có filter theo clientId, status)
- `GET /api/payments/{id}` - Lấy thông tin thanh toán
- `POST /api/payments` - Tạo thanh toán mới
- `PUT /api/payments/{id}` - Cập nhật thanh toán
- `DELETE /api/payments/{id}` - Xóa thanh toán
- `GET /api/payments/overdue` - Lấy danh sách thanh toán quá hạn

#### Reports
- `GET /api/reports/dashboard` - Lấy thống kê tổng quan
- `GET /api/reports/clients-by-service/{serviceId}` - Báo cáo khách hàng theo dịch vụ
- `GET /api/reports/employees-by-service/{serviceId}` - Báo cáo nhân viên theo dịch vụ
- `GET /api/reports/payments` - Báo cáo thanh toán (có filter theo thời gian, status)
- `GET /api/reports/overdue-payments` - Báo cáo thanh toán quá hạn

### Database Schema

Hệ thống bao gồm các bảng chính:
- `Users` - Người dùng hệ thống
- `Services` - Dịch vụ
- `ServiceFees` - Phí dịch vụ
- `Departments` - Phòng ban
- `Employees` - Nhân viên
- `Clients` - Khách hàng
- `ClientServices` - Dịch vụ khách hàng
- `Products` - Sản phẩm của khách hàng
- `Payments` - Thanh toán

### Dữ liệu mẫu

Hệ thống tự động seed dữ liệu mẫu khi khởi động:
- 3 dịch vụ: In-bound, Out-bound, Tele Marketing
- 6 phòng ban: HR, Admin, Service, Training, Internet Security, Auditors
- 1 tài khoản admin mặc định

### Lưu ý

- Tất cả API endpoints (trừ `/api/auth/login`) đều yêu cầu JWT authentication
- Frontend lưu token trong localStorage
- Database sẽ tự động được tạo khi ứng dụng chạy lần đầu (EnsureCreated)

### Phát triển tiếp

Có thể mở rộng thêm:
- Export báo cáo ra Excel/PDF
- Thông báo email cho thanh toán quá hạn
- Dashboard với biểu đồ thống kê
- Quản lý quyền người dùng chi tiết hơn
- Lịch sử thay đổi (audit log)

### License

Dự án này được tạo cho mục đích học tập và nghiên cứu.

