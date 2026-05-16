import { useState, useEffect } from 'react';
import { userApi } from '../../api/endpoints';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const res = await userApi.getAll({ search });
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, data) => {
    try {
      await userApi.update(id, data);
      fetchUsers();
    } catch (error) {
      alert('Có lỗi xảy ra!');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      await userApi.delete(id);
      fetchUsers();
    } catch (error) {
      alert('Có lỗi xảy ra!');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý khách hàng</h1>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      {loading ? (
        <div className="animate-pulse">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Người dùng</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Số điện thoại</th>
                <th className="px-4 py-3 text-center">Vai trò</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Ngày tham gia</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">{user.name?.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.phone || 'N/A'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.role === 'admin' ? 'Admin' : 'Khách hàng'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                      className={`px-3 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {user.isActive ? 'Hoạt động' : 'Vô hiệu'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 text-center">
                    {user.role !== 'admin' && (
                      <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-800">Xóa</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
