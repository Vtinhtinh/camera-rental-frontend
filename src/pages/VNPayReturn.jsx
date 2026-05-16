import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, Button, CircularProgress,
  Alert, Divider
} from '@mui/material';
import { CheckCircle, Cancel, AccessTime, Receipt } from '@mui/icons-material';

const VNPayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const success = searchParams.get('success') === 'true';
  const orderId = searchParams.get('order');
  const amount = searchParams.get('amount');
  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const alreadyProcessed = searchParams.get('already_processed') === 'true';

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return '';
    const numAmount = parseInt(amount) / 100;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numAmount);
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6">Đang xử lý kết quả thanh toán...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        {success ? (
          <>
            <CheckCircle sx={{ fontSize: 100, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" color="success.main" gutterBottom>
              Thanh toán thành công!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý.
            </Typography>
            
            {alreadyProcessed && (
              <Alert severity="info" sx={{ mb: 2, textAlign: 'left' }}>
                Thanh toán này đã được xử lý trước đó.
              </Alert>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'left', bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Chi tiết giao dịch
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Receipt fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>Mã đơn hàng:</strong> {orderId}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle fontSize="small" color="success" />
                <Typography variant="body2">
                  <strong>Phương thức:</strong> VNPay
                </Typography>
              </Box>
              
              {amount && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>Số tiền:</strong> {formatCurrency(amount)}
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        ) : (
          <>
            <Cancel sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" color="error.main" gutterBottom>
              Thanh toán thất bại
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {message || 'Đã có lỗi xảy ra trong quá trình thanh toán.'}
            </Typography>

            {code && (
              <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>
                Mã lỗi: {code}
              </Alert>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'left', bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Thông tin đơn hàng
              </Typography>
              <Typography variant="body2">
                <strong>Mã đơn hàng:</strong> {orderId || 'Không xác định'}
              </Typography>
            </Box>
          </>
        )}

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/my-bookings')}
          >
            Xem đơn hàng
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default VNPayReturn;
