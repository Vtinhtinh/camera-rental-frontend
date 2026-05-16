import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
  Tooltip, Card, CardContent, Grid, Divider, Badge
} from '@mui/material';
import {
  Visibility, CheckCircle, Cancel, Refresh, Payment,
  Info, QrCode2, AccountBalance, CopyAll, Notifications
} from '@mui/icons-material';
import { paymentApi, adminBookingApi } from '../../api/endpoints';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [vietqrPayments, setVietqrPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vietqrLoading, setVietqrLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [stats, setStats] = useState({ totalCompleted: 0, totalAmount: 0 });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
  const [confirming, setConfirming] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh pending payments every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchVietqrPayments(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    fetchPayments();
    fetchVietqrPayments();
  }, [pagination.page, filterStatus, filterMethod]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filterStatus && { status: filterStatus }),
        ...(filterMethod && { paymentMethod: filterMethod })
      };

      const response = await paymentApi.getAllPayments(params);

      if (response.success) {
        setPayments(response.data.payments || []);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVietqrPayments = useCallback(async (silent = false) => {
    try {
      if (!silent) setVietqrLoading(true);

      // Fetch all VietQR payments using the dedicated endpoint
      const response = await paymentApi.getAllVietQRPayments({ status: 'pending', limit: 50 });

      if (response.success) {
        const payments = response.data.payments || [];

        // Enrich with booking info
        const enrichedPayments = payments.map(payment => ({
          ...payment,
          bookingInfo: payment.booking ? {
            id: payment.booking._id || payment.booking,
            customerName: payment.booking.customerName || payment.booking.customer?.name || 'N/A',
            customerPhone: payment.booking.customerPhone || payment.booking.customer?.phone || 'N/A',
            productName: payment.booking.productId?.name || payment.booking.product?.name || 'N/A'
          } : null
        }));

        setVietqrPayments(enrichedPayments);
      }
    } catch (error) {
      console.error('Error fetching VietQR payments:', error);
    } finally {
      if (!silent) setVietqrLoading(false);
    }
  }, []);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleViewDetail = async (paymentId) => {
    try {
      const response = await paymentApi.getPaymentInfo(paymentId);
      if (response.success) {
        setSelectedPayment(response.data);
        setDetailDialog(true);
      }
    } catch (error) {
      showAlert('error', 'Lỗi khi tải thông tin thanh toán');
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setConfirming(true);
      const response = await paymentApi.confirmPayment(selectedPayment._id || selectedPayment.id, notes);

      if (response.success) {
        showAlert('success', 'Xác nhận thanh toán thành công! Thông báo Telegram đã được gửi.');
        setConfirmDialog(false);
        setNotes('');
        setDetailDialog(false);
        fetchPayments();
        fetchVietqrPayments();
        // Also refresh admin bookings to sync data
        adminBookingApi.getAll({ status: 'pending' });
      } else {
        showAlert('error', response.message || 'Lỗi xác nhận thanh toán');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Lỗi xác nhận thanh toán';
      showAlert('error', errorMsg);
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelPayment = async () => {
    try {
      const response = await paymentApi.cancelPayment(selectedPayment._id || selectedPayment.id, notes);
      if (response.success) {
        showAlert('success', 'Hủy thanh toán thành công');
        setCancelDialog(false);
        setNotes('');
        setDetailDialog(false);
        fetchPayments();
        fetchVietqrPayments();
      }
    } catch (error) {
      showAlert('error', 'Lỗi hủy thanh toán');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showAlert('success', 'Đã sao chép!');
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', label: 'Chờ xử lý' },
      processing: { color: 'info', label: 'Đang xử lý' },
      completed: { color: 'success', label: 'Hoàn thành' },
      failed: { color: 'error', label: 'Thất bại' },
      cancelled: { color: 'default', label: 'Đã hủy' }
    };
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getMethodChip = (method) => {
    const methodConfig = {
      acb_qr: { color: 'primary', label: 'ACB QR' },
      cod: { color: 'warning', label: 'COD' },
      vnpay: { color: 'error', label: 'VNPay' },
      vietqr: { color: 'success', label: 'VietQR' }
    };
    const config = methodConfig[method] || { color: 'default', label: method };
    return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const pendingVietqrCount = vietqrPayments.filter(p =>
    p.status === 'pending' || p.status === 'pending'
  ).length;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {alert.show && (
        <Alert severity={alert.type} onClose={() => setAlert({ show: false })} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Paper sx={{ p: 3, flex: 1, bgcolor: 'success.light' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Payment sx={{ fontSize: 40, color: 'success.main' }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Tổng doanh thu</Typography>
              <Typography variant="h5" fontWeight="bold">{formatCurrency(stats.totalAmount)}</Typography>
            </Box>
          </Box>
        </Paper>
        <Paper sx={{ p: 3, flex: 1, bgcolor: 'info.light' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircle sx={{ fontSize: 40, color: 'info.main' }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Thanh toán thành công</Typography>
              <Typography variant="h5" fontWeight="bold">{stats.totalCompleted}</Typography>
            </Box>
          </Box>
        </Paper>
        <Paper sx={{ p: 3, flex: 1, bgcolor: 'warning.light' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Info sx={{ fontSize: 40, color: 'warning.main' }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Đang chờ xử lý</Typography>
              <Typography variant="h5" fontWeight="bold">{pagination.total - stats.totalCompleted}</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* VietQR Pending Section - Priority Display */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'green.dark', border: '2px solid', borderColor: 'success.main' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <QrCode2 sx={{ fontSize: 40, color: 'success.light' }} />
            <Box>
              <Typography variant="h6" color="white" fontWeight="bold">
                <Badge badgeContent={pendingVietqrCount} color="error" sx={{ mr: 1 }}>
                  <span>Thanh toán VietQR chờ xác nhận</span>
                </Badge>
              </Typography>
              <Typography variant="body2" color="green.200">
                {pendingVietqrCount > 0
                  ? `${pendingVietqrCount} thanh toán đang chờ - Admin vui lòng xác nhận sau khi khách chuyển khoản`
                  : 'Không có thanh toán chờ xác nhận'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color={autoRefresh ? 'success' : 'inherit'}
              startIcon={<Refresh />}
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="small"
              sx={{ color: autoRefresh ? 'white' : 'inherit' }}
            >
              Auto: {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<Refresh />}
              onClick={() => fetchVietqrPayments()}
              disabled={vietqrLoading}
            >
              {vietqrLoading ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </Box>
        </Box>

        {pendingVietqrCount > 0 ? (
          <Grid container spacing={2}>
            {vietqrPayments.filter(p => p.status === 'pending').map((payment) => (
              <Grid item xs={12} sm={6} md={4} key={payment.id || payment._id}>
                <Card sx={{ bgcolor: 'grey.900', height: '100%', border: '1px solid', borderColor: 'success.main' }}>
                  <CardContent>
                    {/* Payment ID & Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          #{payment.id?.toString().slice(-8).toUpperCase() || payment._id?.toString().slice(-8).toUpperCase()}
                        </Typography>
                        {payment.bookingInfo && (
                          <Typography variant="body2" color="success.light" sx={{ fontWeight: 'bold' }}>
                            {payment.bookingInfo.customerName}
                          </Typography>
                        )}
                      </Box>
                      {getStatusChip(payment.status)}
                    </Box>

                    {/* Amount */}
                    <Typography variant="h4" color="success.main" fontWeight="bold" gutterBottom>
                      {formatCurrency(payment.amount)}
                    </Typography>

                    {/* Customer Info */}
                    {payment.bookingInfo && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          📱 {payment.bookingInfo.customerPhone}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          📷 {payment.bookingInfo.productName}
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 1 }} />

                    {/* Bank & Transfer Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <AccountBalance sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {payment.bankInfo?.bankName || payment.bankName}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        CK: <strong>{payment.transferContent}</strong>
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(payment.transferContent)}>
                        <CopyAll sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>

                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      {formatDate(payment.createdAt)}
                    </Typography>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        fullWidth
                        startIcon={<CheckCircle />}
                        onClick={() => {
                          setSelectedPayment(payment);
                          setConfirmDialog(true);
                        }}
                      >
                        Xác nhận
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        onClick={() => handleViewDetail(payment.id || payment._id)}
                      >
                        Chi tiết
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 1 }} />
            <Typography color="green.200">
              Tất cả thanh toán VietQR đã được xử lý!
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="pending">Chờ xử lý</MenuItem>
              <MenuItem value="completed">Hoàn thành</MenuItem>
              <MenuItem value="failed">Thất bại</MenuItem>
              <MenuItem value="cancelled">Đã hủy</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Phương thức</InputLabel>
            <Select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              label="Phương thức"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="acb_qr">ACB QR</MenuItem>
              <MenuItem value="cod">COD</MenuItem>
              <MenuItem value="vnpay">VNPay</MenuItem>
              <MenuItem value="vietqr">VietQR</MenuItem>
            </Select>
          </FormControl>
          <Button startIcon={<Refresh />} onClick={fetchPayments} variant="outlined">
            Làm mới
          </Button>
        </Box>
      </Paper>

      {/* Payments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell><strong>Mã GD</strong></TableCell>
              <TableCell><strong>Khách hàng</strong></TableCell>
              <TableCell><strong>Số tiền</strong></TableCell>
              <TableCell><strong>Phương thức</strong></TableCell>
              <TableCell><strong>Trạng thái</strong></TableCell>
              <TableCell><strong>Ngày tạo</strong></TableCell>
              <TableCell><strong>Thao tác</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Chưa có thanh toán nào</Typography>
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {payment.transactionId?.slice(0, 15) || 'N/A'}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{payment.userId?.name || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {payment.userId?.email || payment.userId?.phone || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="primary">
                      {formatCurrency(payment.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>{getMethodChip(payment.paymentMethod)}</TableCell>
                  <TableCell>{getStatusChip(payment.status)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(payment.createdAt)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Xem chi tiết">
                      <IconButton size="small" onClick={() => handleViewDetail(payment._id)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {payment.status === 'pending' && (
                      <>
                        <Tooltip title="Xác nhận đã thanh toán">
                          <IconButton size="small" color="success" onClick={() => {
                            setSelectedPayment(payment);
                            setConfirmDialog(true);
                          }}>
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hủy thanh toán">
                          <IconButton size="small" color="error" onClick={() => {
                            setSelectedPayment(payment);
                            setCancelDialog(true);
                          }}>
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
        <Button
          disabled={pagination.page === 1}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          variant="outlined"
        >
          Trước
        </Button>
        <Typography sx={{ pt: 1 }}>
          Trang {pagination.page} / {pagination.pages || 1} - Tổng: {pagination.total}
        </Typography>
        <Button
          disabled={pagination.page >= pagination.pages}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          variant="outlined"
        >
          Sau
        </Button>
      </Box>

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết thanh toán</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">Mã giao dịch</Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 2 }}>
                {selectedPayment.payment?.transactionId || 'N/A'}
              </Typography>

              {/* Booking Info */}
              {selectedPayment.bookingInfo && (
                <>
                  <Typography variant="body2" color="text.secondary">Thông tin đơn hàng</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2"><strong>Khách hàng:</strong> {selectedPayment.bookingInfo.customerName}</Typography>
                    <Typography variant="body2"><strong>SĐT:</strong> {selectedPayment.bookingInfo.customerPhone}</Typography>
                    <Typography variant="body2"><strong>Sản phẩm:</strong> {selectedPayment.bookingInfo.productName}</Typography>
                  </Paper>
                </>
              )}

              <Typography variant="body2" color="text.secondary">Số tiền</Typography>
              <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                {formatCurrency(selectedPayment.payment?.amount)}
              </Typography>

              <Typography variant="body2" color="text.secondary">Phương thức</Typography>
              <Box sx={{ mb: 2 }}>
                {getMethodChip(selectedPayment.payment?.paymentMethod)}
              </Box>

              <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
              <Box sx={{ mb: 2 }}>
                {getStatusChip(selectedPayment.payment?.status)}
              </Box>

              <Typography variant="body2" color="text.secondary">Nội dung</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedPayment.payment?.description || 'N/A'}
              </Typography>

              {selectedPayment.payment?.paidAt && (
                <>
                  <Typography variant="body2" color="text.secondary">Thời gian thanh toán</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(selectedPayment.payment?.paidAt)}
                  </Typography>
                </>
              )}

              {selectedPayment.transferInfo && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Thông tin chuyển khoản
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="body2"><strong>Ngân hàng:</strong> {selectedPayment.transferInfo.bankName}</Typography>
                    <Typography variant="body2"><strong>Số TK:</strong> {selectedPayment.transferInfo.accountNumber}</Typography>
                    <Typography variant="body2"><strong>Tên TK:</strong> {selectedPayment.transferInfo.accountName}</Typography>
                    <Typography variant="body2"><strong>Số tiền:</strong> {selectedPayment.transferInfo.formattedAmount}</Typography>
                    <Typography variant="body2"><strong>Nội dung:</strong> {selectedPayment.transferInfo.description}</Typography>
                  </Paper>
                </>
              )}

              {selectedPayment.payment?.status === 'pending' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Info /> Chờ xác nhận. Vui lòng kiểm tra tài khoản ACB và xác nhận thanh toán.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Đóng</Button>
          {selectedPayment?.payment?.status === 'pending' && (
            <>
              <Button color="error" onClick={() => {
                setDetailDialog(false);
                setCancelDialog(true);
              }}>
                Hủy
              </Button>
              <Button color="success" variant="contained" onClick={() => {
                setDetailDialog(false);
                setConfirmDialog(true);
              }}>
                Xác nhận thanh toán
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog} onClose={() => !confirming && setConfirmDialog(false)}>
        <DialogTitle>Xác nhận thanh toán VietQR</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Info /> Xác nhận khách hàng đã chuyển khoản thành công?
          </Alert>

          {selectedPayment && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              {/* Booking Info */}
              {selectedPayment.bookingInfo && (
                <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body2" color="text.secondary">Thông tin khách hàng</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedPayment.bookingInfo.customerName}</Typography>
                  <Typography variant="body2">{selectedPayment.bookingInfo.customerPhone}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sản phẩm: {selectedPayment.bookingInfo.productName}
                  </Typography>
                </Box>
              )}

              <Typography variant="body2" color="text.secondary">Mã thanh toán</Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 1 }}>
                #{selectedPayment.id?.toString().slice(-8).toUpperCase() || selectedPayment._id?.toString().slice(-8).toUpperCase()}
              </Typography>

              <Typography variant="body2" color="text.secondary">Số tiền</Typography>
              <Typography variant="h4" color="success.main" fontWeight="bold" sx={{ mb: 1 }}>
                {formatCurrency(selectedPayment.amount)}
              </Typography>

              {selectedPayment.bankInfo?.bankName && (
                <>
                  <Typography variant="body2" color="text.secondary">Ngân hàng</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {selectedPayment.bankInfo.bankName}
                  </Typography>
                </>
              )}

              {selectedPayment.transferContent && (
                <>
                  <Typography variant="body2" color="text.secondary">Nội dung CK</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'grey.200', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                    {selectedPayment.transferContent}
                  </Typography>
                </>
              )}
            </Paper>
          )}

          <TextField
            label="Ghi chú (tùy chọn)"
            multiline
            rows={2}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={confirming}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            Sau khi xác nhận:
            <br />- Thanh toán sẽ được đánh dấu hoàn thành
            <br />- Đơn hàng sẽ được cập nhật sang trạng thái "Đã thanh toán"
            <br />- Thông báo Telegram sẽ được gửi cho admin
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} disabled={confirming}>Hủy</Button>
          <Button
            onClick={handleConfirmPayment}
            color="success"
            variant="contained"
            disabled={confirming}
            startIcon={confirming ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
          >
            {confirming ? 'Đang xác nhận...' : 'Xác nhận thanh toán'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
        <DialogTitle>Hủy thanh toán</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn hủy thanh toán này?
          </Alert>
          <TextField
            label="Lý do hủy"
            multiline
            rows={2}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>Hủy</Button>
          <Button onClick={handleCancelPayment} color="error" variant="contained">
            Đồng ý hủy
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPayments;
